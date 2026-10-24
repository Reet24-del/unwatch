import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT || 3001),
  production: process.env.NODE_ENV === 'production',
  live: process.env.ENABLE_LIVE === 'true',
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  serpKey: process.env.SERPAPI_API_KEY || '',
  paperKey: process.env.PAPERINSTRUMENTS_API_KEY || '',
  elevenKey: process.env.ELEVENLABS_API_KEY || '',
  elevenMaxAttempts: Number(process.env.ELEVENLABS_MAX_ATTEMPTS || 3),
  model: process.env.ULTRAMARINE_MODEL || 'ultramarine-1-flash',
  mongoUri: process.env.MONGODB_URI || '',
  mongoDb: process.env.MONGODB_DATABASE || 'unwatch',
  authDomain: process.env.AUTH0_DOMAIN || '',
  authClient: process.env.AUTH0_CLIENT_ID || '',
  authAudience: process.env.AUTH0_AUDIENCE || '',
  backboardKey: process.env.BACKBOARD_API_KEY || '',
  backboardModel: process.env.BACKBOARD_MODEL || '',
  backboardProvider: process.env.BACKBOARD_PROVIDER || 'openrouter',
  backboardMax: Number(process.env.BACKBOARD_MAX_CALLS || 20),
  sentryDsn: process.env.SENTRY_DSN || '',
  serpMax: Number(process.env.SERPAPI_MAX_REQUESTS || 200),
  paperCents: Math.floor(Number(process.env.ULTRAMARINE_BUDGET_USD || 4) * 100),
  comparisonsMax: Number(process.env.MAX_COMPARISONS || 100),
  dataDir: process.env.DATA_DIR || '.data',
};
export const authConfigured = Boolean(
  config.authDomain && config.authClient && config.authAudience,
);
export function liveBlockers(): string[] {
  return [
    !config.live && 'Live analysis is disabled in this installation.',
    !config.serpKey && 'SerpApi is not connected.',
    !config.paperKey && 'Ultramarine is not connected.',
    config.production &&
      !config.mongoUri &&
      'Durable budget storage is required for public live analysis.',
    config.production &&
      !authConfigured &&
      'Sign-in must be configured before public live analysis.',
  ].filter(Boolean) as string[];
}
