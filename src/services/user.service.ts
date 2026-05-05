import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  createdAt: string;
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
};