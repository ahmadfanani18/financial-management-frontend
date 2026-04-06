import { api } from '@/lib/api';

export interface AskRequest {
  question: string;
  context?: {
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface Suggestion {
  id: string;
  type: 'BUDGET' | 'SAVINGS' | 'EXPENSE_REDUCTION' | 'INVESTMENT';
  title: string;
  description: string;
  potentialSavings?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
  actionLabel: string;
}

export const aiService = {
  async ask(data: AskRequest) {
    const response = await api.post<{ answer: string }>('/ai/ask', data);
    return response.answer;
  },

  async getSuggestions() {
    const response = await api.get<{ suggestions: Suggestion[] }>('/ai/suggestions');
    return response.suggestions;
  },

  async getFinancialAdvice() {
    const response = await api.get<{ advice: string }>('/ai/advice');
    return response.advice;
  },

  async analyzeSpendingPattern(startDate: string, endDate: string) {
    const response = await api.get<{ analysis: any }>(`/ai/analyze-spending?startDate=${startDate}&endDate=${endDate}`);
    return response.analysis;
  },
};
