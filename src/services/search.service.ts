import { api } from '@/lib/api';

export interface SearchResults {
  transactions: Array<{
    id: string;
    title: string;
    date: string;
    amount: number;
  }>;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
  }>;
  budgets: Array<{
    id: string;
    categoryName: string;
    amount: number;
  }>;
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
  }>;
  plans: Array<{
    id: string;
    name: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  }>;
  total: number;
}

export const searchService = {
  search: async (query: string, limit: number = 5): Promise<SearchResults> => {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const response = await api.get<SearchResults>(`/search?${params}`);
    return response;
  },
};