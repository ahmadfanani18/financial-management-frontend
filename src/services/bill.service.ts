import { api } from '@/lib/api';
import type { Bill, CreateBillInput, CurrentMonthBillsResponse } from '@/types/bill';

export const billService = {
  async getAll() {
    const response = await api.get<{ bills: Bill[] }>('/bills');
    return response.bills;
  },

  async getCurrentMonth() {
    const response = await api.get<CurrentMonthBillsResponse>('/bills/current-month');
    return response;
  },

  async getById(id: string) {
    const response = await api.get<{ bill: Bill }>(`/bills/${id}`);
    return response.bill;
  },

  async create(data: CreateBillInput) {
    const response = await api.post<{ bill: Bill }>('/bills', data);
    return response.bill;
  },

  async update(id: string, data: Partial<CreateBillInput>) {
    const response = await api.put<{ bill: Bill }>(`/bills/${id}`, data);
    return response.bill;
  },

  async updateAmount(id: string, amount: string) {
    const response = await api.put<{ bill: Bill }>(`/bills/${id}/amount`, { amount });
    return response.bill;
  },

  async delete(id: string) {
    return api.delete(`/bills/${id}`);
  },

  async markAsPaid(id: string, amount?: string) {
    const response = await api.post<{ transaction: unknown }>(`/bills/${id}/mark-paid`, { amount });
    return response.transaction;
  },
};
