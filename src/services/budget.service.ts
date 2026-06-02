import { api } from '@/lib/api';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM';
  startDate: string;
  endDate?: string;
  warningThreshold: number;
  isActive: boolean;
  category: { id: string; name: string; color: string };
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean;
  createdAt: string;
  updatedAt: string;
  amountValue?: number;  
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  period?: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM';
  startDate: string;
  endDate?: string;
  warningThreshold?: number;
  isActive?: boolean;
}

export const budgetService = {
  async getAll() {
    const response = await api.get<{ budgets: Budget[] }>('/budgets');
    return response.budgets;
  },

  async getSummary() {
    const response = await api.get<{ totalBudget: number; totalSpent: number; remaining: number; budgetCount: number }>('/budgets/summary');
    return response;
  },

  async getById(id: string) {
    const response = await api.get<{ budget: Budget; spent: number; remaining: number; percentage: number }>(`/budgets/${id}`);
    return response;
  },

  async create(data: CreateBudgetInput) {
    const response = await api.post<{ budget: Budget }>('/budgets', data);
    return response.budget;
  },

  async update(id: string, data: Partial<CreateBudgetInput>) {
    const response = await api.put<{ budget: Budget }>(`/budgets/${id}`, data);
    return response.budget;
  },

  async updateSpent(id: string, spent: number) {
    const response = await api.put<{ budget: Budget }>(`/budgets/${id}/spent`, { spent });
    return response.budget;
  },

  async delete(id: string) {
    return api.delete(`/budgets/${id}`);
  },
};
