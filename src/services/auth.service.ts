import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: { email: string; name: string; password: string }) {
    const response = await api.post<AuthResponse>('/auth/register', data, true);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<AuthResponse>('/auth/login', data, true);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async me() {
    return api.get<User>('/auth/me');
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return api.put<{ message: string }>('/auth/change-password', data);
  },

  async forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    return api.post<{ message: string }>('/auth/reset-password', { token, password });
  },

  logout() {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};
