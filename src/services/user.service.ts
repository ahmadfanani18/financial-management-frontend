import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
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
};