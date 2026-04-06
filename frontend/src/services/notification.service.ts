import { api } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'BUDGET_WARNING' | 'GOAL_MILESTONE' | 'REMINDER' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getAll() {
    const response = await api.get<{ notifications: Notification[] }>('/notifications');
    return response.notifications;
  },

  async getUnread() {
    const response = await api.get<{ notifications: Notification[] }>('/notifications/unread');
    return response.notifications;
  },

  async getUnreadCount() {
    const response = await api.get<{ count: number }>('/notifications/unread/count');
    return response.count;
  },

  async markAsRead(id: string) {
    return api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return api.patch('/notifications/read-all');
  },

  async delete(id: string) {
    return api.delete(`/notifications/${id}`);
  },
};
