// Test workers must not inherit connected accounts or credentials from local .env.
// Empty variables are intentional: dotenv does not overwrite existing values.
for (const name of [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_AUDIENCE',
  'MONGODB_URI',
  'SERPAPI_API_KEY',
  'PAPERINSTRUMENTS_API_KEY',
  'ELEVENLABS_API_KEY',
  'BACKBOARD_API_KEY',
  'SENTRY_DSN',
])
  process.env[name] = '';
process.env.ENABLE_LIVE = 'false';
process.env.NODE_ENV = 'test';
