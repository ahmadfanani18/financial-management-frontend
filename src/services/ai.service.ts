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
    budgetLimit?: number;
    isOverBudget?: boolean;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: 'high' | 'medium' | 'low';
  }>;
  totalPredicted: number;
  totalBudget: number;
  totalSpent: number;
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
  totalAccountBalance: number;
  activeGoalsCount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  message: string;
}

export interface SmartSaverCalculateInput {
  itemName?: string;
  targetPrice: number;
  monthlyBudget?: number;
}

export interface SmartSaverResult {
  progress: number;
  remainingNeeded: number;
  monthlyNeeded: number;
  estimatedMonths: number;
  startDate: string;
  targetDate: string;
  feasibility: 'safe' | 'tight' | 'aggressive';
  insight: string;
  suggestion?: {
    monthlyBudget: number;
    reason: string;
  };
}

export interface SmartSaverSuggestion {
  name: string;
  category: string;
  estimatedPrice: number;
  estimatedMonths: number;
  merchant: string;
  lastTransactionDate: string;
}

export interface SmartSaverSuggestionsResponse {
  suggestions: SmartSaverSuggestion[];
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

  async smartSaverCalculate(data: SmartSaverCalculateInput): Promise<SmartSaverResult> {
    const response = await api.post<SmartSaverResult>('/ai/smart-saver/calculate', data);
    return response;
  },

  async getSmartSaverSuggestions(): Promise<SmartSaverSuggestionsResponse> {
    const response = await api.get<SmartSaverSuggestionsResponse>('/ai/smart-saver/suggestions');
    return response;
  },
};