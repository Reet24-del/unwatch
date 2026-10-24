import { createContext, useContext, lazy, Suspense, type ReactNode } from 'react';
const ConnectedAuth = lazy(() => import('./ConnectedAuth'));
export type AppConfig = {
  liveReady: boolean;
  blockers: string[];
  auth: { domain: string; clientId: string; audience: string } | null;
  capabilities: Record<string, boolean>;
  limits: { maxMinutes: number; maxCaptionBytes: number };
};
type Connection = {
  signedIn: boolean;
  configured: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  request: <T>(path: string, body?: unknown, method?: string) => Promise<T>;
};
async function request<T>(
  path: string,
  body?: unknown,
  method?: string,
  token?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      signal: AbortSignal.timeout(path === '/api/config' ? 5000 : path === '/api/compare' ? 330000 : 180000),
      method: method || (body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      'The app server could not be reached. Your saved sessions are still on this device.',
    );
  }
  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(
      'The app server is starting or returned an unreadable response. Please try again.',
    );
  }
  if (!response.ok) throw new Error(json.error?.message || 'The request could not be completed.');
  return json as T;
}
export const ConnectionContext = createContext<Connection>({
  signedIn: false,
  configured: false,
  loading: false,
  login: () => {},
  logout: () => {},
  request,
});
export function ConnectionProvider({
  config,
  children,
}: {
  config: AppConfig;
  children: ReactNode;
}) {
  if (!config.auth)
    return (
      <ConnectionContext.Provider
        value={{
          signedIn: false,
          configured: false,
          loading: false,
          login: () => {},
          logout: () => {},
          request,
        }}
      >
        {children}
      </ConnectionContext.Provider>
    );
  return (
    <Suspense
      fallback={
        <div className="app-loading" role="status">
          Opening your workspace…
        </div>
      }
    >
      <ConnectedAuth auth={config.auth}>{children}</ConnectedAuth>
    </Suspense>
  );
}
export const useConnection = () => useContext(ConnectionContext);
export { request as publicRequest };
