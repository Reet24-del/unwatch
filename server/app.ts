import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { resolve } from 'node:path';
import { z } from 'zod';
import { config, authConfigured, liveBlockers } from './config';
import {
  requestSchema,
  sessionSchema,
  youtubeId,
  defaultSelection,
  type SavedSession,
} from '../shared/domain';
import { AppError } from './errors';
import { ownerFor } from './auth';
import { askAssistant } from './assistant';
import { recordFailure, trace } from './telemetry';
import type { Store } from './store';
import { comparisonWorkflow } from './workflow';

export function createApp(store: Store) {
  const app = express();
  if (config.production) app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://www.youtube.com', 'https://s.ytimg.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://i.ytimg.com'],
          frameSrc: [
            'https://www.youtube.com',
            'https://www.youtube-nocookie.com',
            ...(authConfigured ? [`https://${config.authDomain}`] : []),
          ],
          connectSrc: ["'self'", ...(authConfigured ? [`https://${config.authDomain}`] : [])],
          upgradeInsecureRequests: config.production ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  const allowedOrigins = new Set([
    config.origin,
    ...(!config.production ? ['http://127.0.0.1:5173', 'http://localhost:5173'] : []),
  ]);
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET' && req.headers.origin && !allowedOrigins.has(req.headers.origin))
      return res.status(403).json({
        error: { code: 'ORIGIN_REJECTED', message: 'This request came from a different site.' },
      });
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/config', (_req, res) =>
    res.json({
      liveReady: liveBlockers().length === 0,
      blockers: liveBlockers(),
      auth: authConfigured
        ? { domain: config.authDomain, clientId: config.authClient, audience: config.authAudience }
        : null,
      capabilities: {
        serpapi: Boolean(config.serpKey),
        ultramarine: Boolean(config.paperKey),
        elevenlabs: Boolean(config.elevenKey),
        mongodb: Boolean(config.mongoUri),
        backboard: Boolean(config.backboardKey && config.backboardModel && config.live),
        sentry: Boolean(config.sentryDsn),
        mastra: true,
      },
      limits: { maxMinutes: 180, maxCaptionBytes: 400000 },
    }),
  );
  const expensive = rateLimit({
    windowMs: 60_000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT',
        message: 'Please wait a minute before starting another request.',
      },
    },
  });
  const workflow = comparisonWorkflow(store);
  let active = 0;
  app.post('/api/compare', expensive, async (req, res) => {
    const body = requestSchema.parse(req.body);
    let a: string, b: string;
    try {
      a = youtubeId(body.a);
      b = youtubeId(body.b);
    } catch (e) {
      throw new AppError(400, 'INVALID_URL', (e as Error).message);
    }
    if (a === b)
      throw new AppError(400, 'DUPLICATE_VIDEO', 'Choose two different videos to compare.');
    const blockers = liveBlockers();
    if (blockers.length)
      throw new AppError(
        503,
        'SETUP_REQUIRED',
        `${blockers.join(' ')} You can explore the example without API keys.`,
      );
    const owner = await ownerFor(req);
    if (active >= 2)
      throw new AppError(
        429,
        'BUSY',
        'Two comparisons are already running. Please try again shortly.',
      );
    active++;
    try {
      await store.reserve('comparisons', 1, config.comparisonsMax);
      const outcome = await trace('Build watchlist', 'invoke_agent', async () => {
        const run = await workflow.createRun();
        return run.start({ inputData: { a, b, mode: body.mode } });
      });
      if (outcome.status !== 'success') {
        const error = 'error' in outcome ? outcome.error : null;
        if (error instanceof AppError) throw error;
        // Mastra serializes step errors into plain objects. Restore only our
        // known public error codes; never forward arbitrary provider details.
        const stepError = z
          .object({
            status: z.number().int().min(400).max(599),
            code: z.enum([
              'NO_CAPTIONS',
              'TRANSCRIPTION_FAILED',
              'TRANSCRIPTION_QUOTA',
              'TRANSCRIPTION_AUTH',
              'TRANSCRIPTION_RATE_LIMIT',
              'TRANSCRIPTION_SOURCE',
              'TRANSCRIPTION_PROVIDER',
              'TRANSCRIPTION_TIMEOUT',
              'INVALID_CAPTIONS',
              'VIDEO_TOO_LONG',
              'CAPTIONS_TOO_DENSE',
              'RESPONSE_TOO_LARGE',
              'PROVIDER_ERROR',
              'PROVIDER_UNAVAILABLE',
              'PROVIDER_TIMEOUT',
              'INCOMPLETE_ANALYSIS',
              'INVALID_ANALYSIS',
              'INVALID_EVIDENCE',
              'BUDGET_EXHAUSTED',
            ]),
            message: z.string().min(1).max(500),
          })
          .safeParse(error);
        if (stepError.success)
          throw new AppError(stepError.data.status, stepError.data.code, stepError.data.message);
        throw new AppError(
          502,
          'ANALYSIS_FAILED',
          'The comparison could not finish. Captions may be unavailable, too long, or a provider may need attention. No result was invented.',
        );
      }
      const comparison = outcome.result;
      await store.set(`session:${owner}:${comparison.id}`, {
        comparison,
        selected: defaultSelection(comparison),
        progress: {},
        savedAt: new Date().toISOString(),
      });
      res.json(comparison);
    } finally {
      active--;
    }
  });
  app.get('/api/sessions', async (req, res) => {
    const owner = await ownerFor(req);
    res.json(await store.list<SavedSession>(`session:${owner}:`));
  });
  app.put('/api/sessions/:id', async (req, res) => {
    const owner = await ownerFor(req);
    const session = sessionSchema.parse(req.body);
    if (session.comparison.id !== req.params.id)
      throw new AppError(400, 'INVALID_SESSION', 'Session identifiers do not match.');
    await store.set(`session:${owner}:${session.comparison.id}`, session);
    res.json({ saved: true });
  });
  app.delete('/api/sessions/:id', async (req, res) => {
    const owner = await ownerFor(req);
    await store.remove(`session:${owner}:${req.params.id}`);
    res.json({ deleted: true });
  });
  app.post('/api/assistant', expensive, async (req, res) => {
    const owner = await ownerFor(req);
    const body = z
      .object({
        sessionId: z.string().max(100),
        question: z.string().trim().min(1).max(800),
        remember: z.boolean(),
      })
      .parse(req.body);
    const session = await store.get<SavedSession>(`session:${owner}:${body.sessionId}`);
    if (!session)
      throw new AppError(
        404,
        'SESSION_NOT_FOUND',
        'Save this session before asking the assistant.',
      );
    res.json(await askAssistant(owner, session, body.question, body.remember, store));
  });
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } }),
  );
  if (config.production) {
    app.use(express.static(resolve('dist')));
    app.get('/{*path}', (_req, res) => res.sendFile(resolve('dist/index.html')));
  }
  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const known =
        error instanceof AppError
          ? error
          : error instanceof z.ZodError
            ? new AppError(
                400,
                'INVALID_INPUT',
                'Some submitted data is invalid. Check the inputs and try again.',
              )
            : new AppError(
                500,
                'INTERNAL_ERROR',
                'Something went wrong. Your saved sessions are unchanged.',
              );
      recordFailure(known.code);
      res.status(known.status).json({ error: { code: known.code, message: known.message } });
    },
  );
  return app;
}
