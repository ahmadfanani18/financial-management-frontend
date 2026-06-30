import { api } from '@/lib/api';

export type SubscriptionTier = 'FREE' | 'TRIAL' | 'PRO';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  subscriptionTier: SubscriptionTier;
  trialStartedAt?: string;
  trialEndsAt?: string;
  subscriptionStartAt?: string;
  subscriptionEndAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: { email: string; name: string; password: string; trial?: boolean }) {
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
    const response = await api.get<User>('/auth/me');
    return response;
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

  async activateTrial() {
    return api.post<{ success: boolean; message: string }>('/subscription/activate-trial', {});
  },

  async getFeatures() {
    return api.get<{
      features: {
        aiTips: boolean;
        reports: boolean;
        export: boolean;
        unlimitedTransactions: boolean;
        unlimitedGoals: boolean;
        unlimitedAccounts: boolean;
        maxAccounts: number;
        maxTransactions: number;
        maxGoals: number;
      };
    }>('/subscription/features');
  },

  async verifyEmail(token: string) {
    return api.post<{ message: string }>('/auth/verify-email', { token });
  },

  async resendVerification(email: string) {
    return api.post<{ message: string }>('/auth/resend-verification', { email });
  },
};
