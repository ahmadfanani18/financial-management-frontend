import { api } from '@/lib/api';

export interface GeneratePlanInput {
  monthlyIncome: number;
  currency?: string;
  dependents?: number;
}

export interface GeneratePlanResponse {
  summary: {
    monthlyIncome: number;
    needs: number;
    wants: number;
    savings: number;
    currency: string;
  };
  expenses: Array<{
    category: string;
    percentage: number;
    amount: number;
    type: 'EXPENSE' | 'SAVING';
  }>;
  savings: Array<{
    category: string;
    percentage: number;
    amount: number;
    type: 'EXPENSE' | 'SAVING';
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    targetAmount: number;
    isSelected: boolean;
  }>;
  suggestedGoal: {
    name: string;
    targetAmount: number;
    deadline: string;
  };
  message: string;
}

export interface PredictSpendingInput {
  months?: number;
}

export interface PredictSpendingResponse {
  predictions: Array<{
    category: string;
    predictedAmount: number;
    currentAverage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: 'high' | 'medium' | 'low';
  }>;
  totalPredicted: number;
  period: string;
  message: string;
  insufficientData: boolean;
}

export interface SuggestSavingsResponse {
  suggestions: Array<{
    category: string;
    currentSpending: number;
    suggestedSaving: number;
    reason: string;
  }>;
  currentBalance: number;
  message: string;
}

export const aiService = {
  async generatePlan(data: GeneratePlanInput): Promise<GeneratePlanResponse> {
    const response = await api.post<GeneratePlanResponse>('/ai/generate-plan', data);
    return response;
  },

  async predictSpending(data: PredictSpendingInput = {}): Promise<PredictSpendingResponse> {
    const response = await api.post<PredictSpendingResponse>('/ai/predict-spending', {
      months: data.months || 3,
    });
    return response;
  },

  async suggestSavings(): Promise<SuggestSavingsResponse> {
    const response = await api.post<SuggestSavingsResponse>('/ai/suggest-savings', {});
    return response;
  },
};