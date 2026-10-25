import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domMax, MotionConfig } from 'motion/react';
import Landing from './components/Landing';
import './styles.css';
const WorkspaceEntry = lazy(() => import('./WorkspaceEntry'));
const query = new URLSearchParams(window.location.search);
// Auth0's existing registered root callback must still mount its provider.
const authCallback = query.has('state') && (query.has('code') || query.has('error'));
const isWorkspace =
  window.location.pathname.startsWith('/workspace') ||
  window.location.hash === '#main' ||
  authCallback;
document
  .querySelector('meta[name="theme-color"]')
  ?.setAttribute('content', isWorkspace ? '#131312' : '#ee4b16');
document.title = isWorkspace
  ? 'UNWATCH — Your workspace'
  : 'UNWATCH — Skip the replay. Keep the discovery.';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div className="workspace-loading" role="status">
              Opening UNWATCH…
            </div>
          }
        >
          {isWorkspace ? <WorkspaceEntry /> : <Landing />}
        </Suspense>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
);
