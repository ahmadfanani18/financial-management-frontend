import { api } from '@/lib/api';

interface SubscriptionOverview {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  pendingPayments: number;
  expiringSoon: number;
}

interface SubscriptionData {
  overview: SubscriptionOverview;
  active: any[];
  pending: any[];
  expiring: any[];
}

interface SendReminderResult {
  userId: string;
  email: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

interface SendReminderResponse {
  sent: number;
  failed: number;
  results: SendReminderResult[];
}

export const adminSubscriptionService = {
  async getOverview(): Promise<SubscriptionData> {
    return api.get('/admin/subscriptions');
  },

  async sendReminders(userIds: string[]): Promise<SendReminderResponse> {
    return api.post('/admin/subscriptions/send-reminders', { userIds });
  },
};
