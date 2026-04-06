import { api } from '@/lib/api';

export interface Account {
  id: string;
  name: string;
  type: 'BANK' | 'EWALLET' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  name: string;
  type: 'BANK' | 'EWALLET' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export const accountService = {
  async getAll() {
    const response = await api.get<{ accounts: Account[] }>('/accounts');
    return response.accounts;
  },

  async getById(id: string) {
    const response = await api.get<{ account: Account }>(`/accounts/${id}`);
    return response.account;
  },

  async create(data: CreateAccountInput) {
    const response = await api.post<{ account: Account }>('/accounts', data);
    return response.account;
  },

  async update(id: string, data: Partial<CreateAccountInput>) {
    const response = await api.put<{ account: Account }>(`/accounts/${id}`, data);
    return response.account;
  },

  async delete(id: string) {
    return api.delete(`/accounts/${id}`);
  },

  async getTotalBalance() {
    const response = await api.get<{ total: number }>('/accounts/balance/total');
    return response.total;
  },
};
