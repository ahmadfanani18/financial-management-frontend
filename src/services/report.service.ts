import { api } from '@/lib/api';
import { axiosInstance } from '@/lib/axios';

export interface MonthlyReportData {
  period: { year: number; month: number; label: string };
  summary: { totalIncome: number; totalExpense: number; totalTransfer: number; balance: number };
  incomeByCategory: { name: string; amount: number; color: string }[];
  expenseByCategory: { name: string; amount: number; color: string }[];
  transactions: any[];
}

export interface MonthlyReport {
  report: MonthlyReportData;
}

export interface Trend {
  month: string;
  year: number;
  income: number;
  expense: number;
  transfer: number;
  balance: number;
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  investments: number;
  netWorth: number;
}

export interface MutationsResponse {
  account: { id: string; name: string; type: string; currentBalance: number };
  startingBalance: number;
  endingBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    type: string;
    amount: number;
    category: { name: string } | null;
    toAccount: { name: string } | null;
    runningBalance: number;
    adminFee?: number;
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const reportService = {
  async getMonthlyReport(year: number, month: number, accountId?: string) {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (accountId) params.append('accountId', accountId);
    return api.get<MonthlyReport>(`/reports/monthly?${params}`);
  },

  async getTrends(months = 6) {
    const response = await api.get<{ trends: Trend[] }>(`/reports/trends?months=${months}`);
    return response.trends;
  },

  async getCategoryBreakdown(startDate: string, endDate: string) {
    const response = await api.get<{ total: number; categories: any[] }>(
      `/reports/category-breakdown?startDate=${startDate}&endDate=${endDate}`
    );
    return response;
  },

  async getNetWorth() {
    return api.get<NetWorth>('/reports/net-worth');
  },

  async getCashFlow(startDate: string, endDate: string) {
    const response = await api.get<{ dailyFlow: any[] }>(`/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
    return response.dailyFlow;
  },

  async downloadMonthlyTransactions(year: number, month: number): Promise<void> {
    const response = await axiosInstance.get<string>(
      `/reports/export/transactions?year=${year}&month=${month}`,
      { responseType: 'text' }
    );

    const blob = new Blob(['\ufeff' + response.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transaksi-${year}-${month.toString().padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },

  async getMutations(params: { accountId: string; startDate: string; endDate: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams({
      accountId: params.accountId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    return api.get<MutationsResponse>(`/reports/mutations?${searchParams}`);
  },

  async downloadMutations(accountId: string, startDate: string, endDate: string) {
    const response = await axiosInstance.get(
      `/reports/mutations/export?accountId=${accountId}&startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' }
    );
    return response;
  },
};
