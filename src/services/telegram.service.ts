import { api } from '@/lib/api';

export interface TelegramSettings {
  isLinked: boolean;
  notifications: {
    budgetAlert: boolean;
    goalProgress: boolean;
    weeklySummary: boolean;
    weeklySummaryDay: number;
    weeklySummaryTime: string;
    billsDue: boolean;
  };
}

export interface LinkCodeResponse {
  code: string;
  expiresAt: string;
}

export const telegramService = {
  async generateLinkCode(): Promise<LinkCodeResponse> {
    return api.post<LinkCodeResponse>('/telegram/link-code');
  },

  async getSettings(): Promise<TelegramSettings> {
    return api.get<TelegramSettings>('/telegram/settings');
  },

  async updateSettings(notifications: Record<string, boolean>): Promise<{ ok: boolean }> {
    return api.patch<{ ok: boolean }>('/telegram/settings', { notifications });
  },
};
