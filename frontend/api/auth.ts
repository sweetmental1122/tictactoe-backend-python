import client from './client';
import { AuthResponse, ApiResponse } from '../types';

export const signUp = async (username: string, email: string, password: string) => {
  const res = await client.post<ApiResponse<AuthResponse>>('/auth/signup/', {
    username, email, password,
  });
  return res.data;
};

export const signIn = async (username: string, password: string) => {
  const res = await client.post<ApiResponse<AuthResponse>>('/auth/signin/', {
    username, password,
  });
  return res.data;
};
