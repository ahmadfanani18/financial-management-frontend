import { api } from '@/lib/api';

export interface MonthlyReport {
  period: { year: number; month: number; label: string };
  summary: { totalIncome: number; totalExpense: number; balance: number };
  incomeByCategory: { name: string; amount: number; color: string }[];
  expenseByCategory: { name: string; amount: number; color: string }[];
  transactions: any[];
}

export interface Trend {
  month: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  investments: number;
  netWorth: number;
}

export const reportService = {
  async getMonthlyReport(year: number, month: number) {
    const response = await api.get<{ report: MonthlyReport }>(`/reports/monthly?year=${year}&month=${month}`);
    return response.report;
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
};
