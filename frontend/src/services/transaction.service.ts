import { api } from '@/lib/api';

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  fromAccountId?: string;
  toAccountId?: string;
  isRecurring: boolean;
  account?: { id: string; name: string; color: string };
  category?: { id: string; name: string; icon: string; color: string };
  fromAccount?: { id: string; name: string };
  toAccount?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  accountId?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description?: string;
  date: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export const transactionService = {
  async getAll(query?: TransactionQuery) {
    const params = new URLSearchParams(query as any);
    const response = await api.get<{
      transactions: Transaction[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/transactions?${params}`);
    return response;
  },

  async getById(id: string) {
    const response = await api.get<{ transaction: Transaction }>(`/transactions/${id}`);
    return response.transaction;
  },

  async create(data: CreateTransactionInput) {
    const response = await api.post<{ transaction: Transaction }>('/transactions', data);
    return response.transaction;
  },

  async update(id: string, data: Partial<CreateTransactionInput>) {
    const response = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, data);
    return response.transaction;
  },

  async delete(id: string) {
    return api.delete(`/transactions/${id}`);
  },

  async getRecent(limit = 5) {
    const response = await api.get<{ transactions: Transaction[] }>(`/transactions/recent?limit=${limit}`);
    return response.transactions;
  },

  async getSummary(startDate: string, endDate: string) {
    const response = await api.get<{ income: number; expense: number; balance: number }>(
      `/transactions/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response;
  },
};
