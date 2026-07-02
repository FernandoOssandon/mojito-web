import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../composables/useApi';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'BUYER' | 'ADMIN';
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isBuyer = computed(() => user.value?.role === 'BUYER');

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    _setSession(data.user, data.token);
    return data;
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    _setSession(data.user, data.token);
    return data;
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me');
    user.value = data;
    return data;
  }

  function restore() {
    const savedToken = localStorage.getItem('mojito_token');
    const savedUser = localStorage.getItem('mojito_user');
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      // Refrescar datos del servidor en segundo plano
      fetchMe().catch(() => logout());
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('mojito_token');
    localStorage.removeItem('mojito_user');
  }

  function _setSession(u: User, t: string) {
    user.value = u;
    token.value = t;
    localStorage.setItem('mojito_token', t);
    localStorage.setItem('mojito_user', JSON.stringify(u));
  }

  return { user, token, isAuthenticated, isAdmin, isBuyer, login, register, logout, restore, fetchMe };
});
