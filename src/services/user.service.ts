import { api } from '@/lib/api';
import type { SubscriptionTier } from './auth.service';

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
  createdAt: string;
}

export interface NotificationPreferences {
  budgetWarning: boolean;
  goalMilestone: boolean;
  planReminder: boolean;
  accountAlert: boolean;
  dailySummary: boolean;
  recurringTransaction: boolean;
}

export interface ApiKeysStatus {
  configuredProviders: string[];
  primaryProvider: string | null;
  hasAnyKey: boolean;
}

export interface SaveApiKeysResult {
  success: boolean;
  validatedProviders: string[];
  failedProviders: Record<string, string>;
}

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>('/user/me');
    return response.user;
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    const response = await api.put<{ user: User }>('/user/me', data);
    return response.user;
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<{ preferences: NotificationPreferences }>('/user/preferences/notifications');
    return response.preferences;
  },

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put<{ preferences: NotificationPreferences }>('/user/preferences/notifications', preferences);
    return response.preferences;
  },

  async getApiKeysStatus(): Promise<ApiKeysStatus> {
    const response = await api.get<ApiKeysStatus>('/user/api-keys');
    return response;
  },

  async saveApiKeys(data: {
    geminiApiKey?: string;
    openaiApiKey?: string;
    claudeApiKey?: string;
    primaryProvider?: string;
  }): Promise<SaveApiKeysResult> {
    const response = await api.post<SaveApiKeysResult>('/user/api-keys', data);
    return response;
  },
};