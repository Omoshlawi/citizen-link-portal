import { useEffect, useState } from 'react';
import { TokenPair, useSessionStore } from '@/lib/global-store';
import { useLocalStorage } from '@/lib/storage';
import { decodeJWTtoken, SESSION_TOKEN_KEY } from '../utils';
import { useAuthAPi } from './useAuthApi';

const useLoadInitialAuthState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useLocalStorage<TokenPair>(SESSION_TOKEN_KEY);
  const updateSessionStore = useSessionStore((state) => state.update);
  const updateSessionToken = useSessionStore((state) => state.setSessionToken);
  const { getSessionUserByToken } = useAuthAPi();
  const [error, setError] = useState<any>();

  const initializeSessionHelpers = () => {
    updateSessionStore({
      cacheSession: (session) => {
        setToken(session.token ?? null);
      },
      decodeSesionToken: (token) => {
        return decodeJWTtoken(token.accessToken);
      },
      clearCache: () => {
        setToken(null);
      },
    });
  };
  useEffect(() => {
    initializeSessionHelpers();
    if (token) {
      setIsLoading(true);
      updateSessionToken(token);
      getSessionUserByToken(token.accessToken)
        .then((user) => {
          updateSessionStore({
            session: {
              isAuthenticated: true,
              user,
              token,
              isGuestUser: false,
            },
          });
        })
        .catch((e) => {
          setError(e);
        })
        .finally(() => setIsLoading(false));
    }
  }, [token]);
  return { isLoading, error };
};

export default useLoadInitialAuthState;
