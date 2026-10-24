import { useCallback, type ReactNode } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ConnectionContext, publicRequest as request, type AppConfig } from './api';
function AuthConnection({ children }: { children: ReactNode }) {
  const auth = useAuth0();
  const authenticatedRequest = useCallback(
    async <T,>(path: string, body?: unknown, method?: string) => {
      if (!auth.isAuthenticated) throw new Error('Sign in to use connected services.');
      return request<T>(path, body, method, await auth.getAccessTokenSilently());
    },
    [auth.isAuthenticated, auth.getAccessTokenSilently],
  );
  return (
    <ConnectionContext.Provider
      value={{
        signedIn: auth.isAuthenticated,
        configured: true,
        loading: auth.isLoading,
        login: () => {
          void auth.loginWithRedirect();
        },
        logout: () => {
          void auth.logout({ logoutParams: { returnTo: window.location.origin } });
        },
        request: authenticatedRequest,
      }}
    >
      {auth.error && (
        <div role="alert" className="global-error">
          Sign-in failed. Please check the Auth0 callback configuration.
        </div>
      )}
      {children}
    </ConnectionContext.Provider>
  );
}

export default function ConnectedAuth({
  auth,
  children,
}: {
  auth: NonNullable<AppConfig['auth']>;
  children: ReactNode;
}) {
  return (
    <Auth0Provider
      domain={auth.domain}
      clientId={auth.clientId}
      authorizationParams={{ redirect_uri: window.location.origin, audience: auth.audience }}
      cacheLocation="memory"
    >
      <AuthConnection>{children}</AuthConnection>
    </Auth0Provider>
  );
}
