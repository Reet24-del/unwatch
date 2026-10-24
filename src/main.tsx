import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domMax, MotionConfig } from 'motion/react';
import App from './App';
import { ConnectionProvider, publicRequest, type AppConfig } from './lib/api';
import './styles.css';
const fallback: AppConfig = {
  liveReady: false,
  blockers: ['The API server could not be reached. Start it with npm run dev.'],
  auth: null,
  capabilities: { mastra: true },
  limits: { maxMinutes: 180, maxCaptionBytes: 400000 },
};
async function loadConfig(): Promise<AppConfig> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await publicRequest<AppConfig>('/api/config');
    } catch {
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  return fallback;
}
const config = await loadConfig();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <ConnectionProvider config={config}>
          <App config={config} />
        </ConnectionProvider>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
);
