import './telemetry';
import { config } from './config';
import { createStore } from './store';
import { createApp } from './app';
try {
  const store = await createStore();
  createApp(store).listen(
    config.port,
    process.env.HOST || (config.production ? '0.0.0.0' : '127.0.0.1'),
    () =>
      console.log(
        `UNWATCH API ready on port ${config.port}. Live requests ${config.live ? 'enabled' : 'disabled'}.`,
      ),
  );
} catch {
  console.error(
    'UNWATCH could not initialise storage. Check local write access or MongoDB configuration.',
  );
  process.exitCode = 1;
}
