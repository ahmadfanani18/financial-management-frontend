import { api } from '@/lib/api';
import type { Bill, CreateBillInput, CurrentMonthBillsResponse } from '@/types/bill';

interface BillFilters {
  isActive?: boolean;
  mode?: 'AUTO_DEDUCT' | 'REMINDER_ONLY';
}

export const billService = {
  async getAll(filters?: BillFilters) {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters?.mode) {
      params.append('mode', filters.mode);
    }
    const queryString = params.toString();
    const url = queryString ? `/bills?${queryString}` : '/bills';
    const response = await api.get<{ bills: Bill[] }>(url);
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

  async markAsPaid(id: string, amount?: string, createTransaction = true) {
    const response = await api.post<{ success: boolean; billId: string; transactionCreated: boolean }>(`/bills/${id}/mark-paid`, {
      amount,
      createTransaction,
    });
    return response;
  },
};
