import axios from 'axios';
import { getTokens } from '../utils/auth';
import { BASE_URL } from '../config/api';

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

export default client;
