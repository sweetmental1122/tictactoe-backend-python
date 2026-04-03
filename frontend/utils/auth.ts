import { AuthTokens, User } from '../types';

const TOKEN_KEY = 'ttt_tokens';
const USER_KEY = 'ttt_user';

export const saveAuth = (tokens: AuthTokens, user: User) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = (): boolean => !!getTokens();
