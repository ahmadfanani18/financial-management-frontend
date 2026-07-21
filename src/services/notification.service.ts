import { api } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface GetNotificationsResponse {
  notifications: Notification[];
}

interface MarkAsReadResponse {
  notification: Notification;
}

export const notificationService = {
  async getAll(): Promise<GetNotificationsResponse> {
    const response = await api.get<GetNotificationsResponse>('/notifications');
    return response;
  },

  async markAsRead(id: string): Promise<MarkAsReadResponse> {
    const response = await api.patch<MarkAsReadResponse>(`/notifications/${id}/read`);
    return response;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};