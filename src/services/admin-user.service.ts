import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  subscriptionTier: 'FREE' | 'TRIAL' | 'PRO';
  subscriptionEndAt?: string;
  createdAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  tier?: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminUserService = {
  async listUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);
    if (params.status) searchParams.set('status', params.status);
    if (params.tier) searchParams.set('tier', params.tier);
    
    return api.get(`/admin/users?${searchParams.toString()}`);
  },

  async getUser(id: string): Promise<AdminUser> {
    return api.get(`/admin/users/${id}`);
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return api.patch(`/admin/users/${id}`, data);
  },

  async deleteUser(id: string): Promise<void> {
    return api.delete(`/admin/users/${id}`);
  },

  async resetPassword(id: string): Promise<{ token: string }> {
    return api.post(`/admin/users/${id}/reset-password`, {});
  },

  async getUserActivity(userId: string): Promise<{ logins: any[]; actions: any[] }> {
    return api.get(`/admin/activity/${userId}`);
  },

  async extendSubscription(userId: string, days: number): Promise<AdminUser> {
    return api.patch(`/admin/subscriptions/${userId}/extend`, { days });
  },

  async changeTier(userId: string, tier: string): Promise<AdminUser> {
    return api.patch(`/admin/subscriptions/${userId}/tier`, { tier });
  },

  async freezeAccount(userId: string, reason: string): Promise<AdminUser> {
    return api.patch(`/admin/subscriptions/${userId}/freeze`, { reason });
  },

  async cancelSubscription(userId: string): Promise<AdminUser> {
    return api.patch(`/admin/subscriptions/${userId}/cancel`, {});
  },
};