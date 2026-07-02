import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/auth';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Inyectar JWT en cada request
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Manejar 401 globalmente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore();
      auth.logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  },
);

export function useApi() {
  return { api };
}

export default api;
