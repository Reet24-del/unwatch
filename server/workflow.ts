import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { comparisonSchema, modeSchema, videoSchema } from '../shared/domain';
import { analyze, fetchTranscript } from './providers';
import { AppError } from './errors';
import type { Store } from './store';

export function comparisonWorkflow(store: Store) {
  const input = z.object({ a: z.string(), b: z.string(), mode: modeSchema });
  const fetched = z.object({
    videos: z.object({ a: videoSchema, b: videoSchema }),
    mode: modeSchema,
    cached: z.number(),
  });
  const fetchStep = createStep({
    id: 'fetch-captions',
    inputSchema: input,
    outputSchema: fetched,
    execute: async ({ inputData }) => {
      const [a, b] = await Promise.all([
        fetchTranscript(inputData.a, store).catch((error: unknown) => {
          if (error instanceof AppError && error.code === 'NO_CAPTIONS')
            throw new AppError(
              422,
              'NO_CAPTIONS',
              `Captions for Tutorial A (${inputData.a}) were unavailable through SerpApi. Connect ElevenLabs for audio transcription, or try another video.`,
            );
          throw error;
        }),
        fetchTranscript(inputData.b, store).catch((error: unknown) => {
          if (error instanceof AppError && error.code === 'NO_CAPTIONS')
            throw new AppError(
              422,
              'NO_CAPTIONS',
              `Captions for Tutorial B (${inputData.b}) were unavailable through SerpApi. Connect ElevenLabs for audio transcription, or try another video.`,
            );
          throw error;
        }),
      ]);
      return {
        videos: { a: a.video, b: b.video },
        mode: inputData.mode,
        cached: Number(a.cached) + Number(b.cached),
      };
    },
  });
  const compareStep = createStep({
    id: 'compare-explanations',
    inputSchema: fetched,
    outputSchema: comparisonSchema,
    execute: async ({ inputData }) =>
      analyze(inputData.videos, inputData.mode, inputData.cached, store),
  });
  return createWorkflow({
    id: 'unwatch-comparison',
    inputSchema: input,
    outputSchema: comparisonSchema,
  })
    .then(fetchStep)
    .then(compareStep)
    .commit();
}
