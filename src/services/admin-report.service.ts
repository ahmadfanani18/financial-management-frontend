import { api } from '@/lib/api';

export interface UserReport {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  trialUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  inactiveUsers: number;
  registrationTrend: Array<{ month: string; count: number }>;
}

export interface SubscriptionReport {
  mrr: number;
  totalRevenue: number;
  churnRate: number;
  conversionRate: number;
  tierDistribution: Array<{ tier: string; count: number }>;
  expiringSoon: Array<{ userId: string; email: string; expiresAt: string }>;
  pendingPayments: number;
}

export interface ActivityReport {
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  loginFrequency: Array<{ date: string; logins: number }>;
  featureUsage: Array<{ feature: string; usageCount: number }>;
}

export const adminReportService = {
  async getUserReport(): Promise<UserReport> {
    return api.get<UserReport>('/admin/reports/users');
  },

  async getSubscriptionReport(): Promise<SubscriptionReport> {
    return api.get<SubscriptionReport>('/admin/reports/subscriptions');
  },

  async getActivityReport(): Promise<ActivityReport> {
    return api.get<ActivityReport>('/admin/reports/activity');
  },
};
