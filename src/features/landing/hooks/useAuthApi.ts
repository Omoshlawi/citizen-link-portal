import { apiFetch } from '@/lib/api';
import { TokenPair, useSessionStore } from '@/lib/global-store';
import { useLocalStorage } from '@/lib/storage';
import { LoginFormData, RegistrationFormData, User } from '../types';
import { decodeJWTtoken, SESSION_TOKEN_KEY } from '../utils';

const loginUser = async (data: LoginFormData) => {
  const resp = await apiFetch<{ user: User; token: TokenPair }>('/auth/signin/credentials', {
    data,
    method: 'POST',
  });
  const responseData = resp.data;

  useSessionStore.setState((state) => ({
    ...state,
    session: {
      ...state.session,
      isAuthenticated: true,
      token: responseData.token,
      user: responseData.user,
    },
  }));

  return responseData;
};
const registerUser = async (data: RegistrationFormData) => {
  const resp = await apiFetch<{ user: User; token: TokenPair }>('/auth/signup', {
    data,
    method: 'POST',
  });
  const responseData = resp.data;
  useSessionStore.setState((state) => ({
    ...state,
    session: {
      ...state.session,
      isAuthenticated: true,
      token: responseData.token,
      user: responseData.user,
    },
  }));
  return responseData;
};

const getSessionUserByToken = async (token: string) => {
  const v = 'custom:include(person,accounts)';
  const resp = await apiFetch<User>('/users/profile', {
    params: { v },
    headers: { 'x-access-token': token },
  });
  const responseData = resp.data;
  useSessionStore.setState((state) => ({
    ...state,
    session: {
      ...state.session,
      user: responseData,
    },
  }));
  return responseData;
};

const logoutUser = () => {
  useSessionStore.setState((state) => ({
    ...state,
    session: {
      isAuthenticated: false,
      token: undefined,
      user: undefined,
      isGuestUser: false,
    },
  }));
};

export const useAuthAPi = () => {
  const [, setToken] = useLocalStorage<TokenPair>(SESSION_TOKEN_KEY);

  return {
    loginUser: async (data: LoginFormData) => {
      const response = await loginUser(data);
      setToken(response.token);
      return response;
    },
    registerUser: async (data: RegistrationFormData) => {
      const response = await registerUser(data);
      setToken(response.token);
      return response;
    },
    getSessionUserByToken,
    logoutUser: () => {
      logoutUser();
      setToken(null);
    },
  };
};
