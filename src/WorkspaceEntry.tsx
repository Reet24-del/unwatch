import { useEffect, useState } from 'react';
import App from './App';
import { ConnectionProvider, publicRequest, type AppConfig } from './lib/api';

const fallback: AppConfig = {
  liveReady: false,
  blockers: ['The API server could not be reached. Please try again shortly.'],
  auth: null,
  capabilities: { mastra: true },
  limits: { maxMinutes: 180, maxCaptionBytes: 400000 },
};
let pendingConfig: Promise<AppConfig> | undefined;
function loadConfig() {
  return (pendingConfig ||= (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await publicRequest<AppConfig>('/api/config');
      } catch {
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    return fallback;
  })());
}
export default function WorkspaceEntry() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  useEffect(() => {
    let active = true;
    void loadConfig().then((value) => {
      if (active) setConfig(value);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!config)
    return (
      <div className="workspace-loading" role="status">
        <span>UNWATCH</span>
        <p>Opening your workspace…</p>
        <a href="/">Back to home</a>
      </div>
    );
  return (
    <ConnectionProvider config={config}>
      <App config={config} />
    </ConnectionProvider>
  );
}
