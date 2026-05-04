import { api } from '@/lib/api';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  targetAmount?: number;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  targetDate: string;
  targetAmount?: number;
}

export interface GeneratedPlan {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  milestones: {
    id: string;
    title: string;
    description?: string;
    targetDate: string;
    targetAmount?: number;
    isCompleted: boolean;
    order: number;
  }[];
}

export interface GeneratePlanSummary {
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  savings: string;
  topExpenses: { category: string; amount: number }[];
}

export interface GeneratePlanResponse {
  plan: GeneratedPlan;
  summary: GeneratePlanSummary;
}

export interface GeneratePlanError {
  error: true;
  message: string;
}

export const planService = {
  async getAll() {
    const response = await api.get<{ plans: Plan[] }>('/plans');
    return response.plans;
  },

  async getById(id: string) {
    const response = await api.get<{ plan: Plan }>(`/plans/${id}`);
    return response.plan;
  },

  async create(data: CreatePlanInput) {
    const response = await api.post<{ plan: Plan }>('/plans', data);
    return response.plan;
  },

  async update(id: string, data: Partial<CreatePlanInput>) {
    const response = await api.put<{ plan: Plan }>(`/plans/${id}`, data);
    return response.plan;
  },

  async delete(id: string) {
    return api.delete(`/plans/${id}`);
  },

  async addMilestone(planId: string, data: CreateMilestoneInput) {
    const response = await api.post<{ milestone: Milestone }>(`/plans/${planId}/milestones`, data);
    return response.milestone;
  },

  async completeMilestone(planId: string, milestoneId: string) {
    const response = await api.patch<{ milestone: Milestone }>(`/plans/${planId}/milestones/${milestoneId}/complete`);
    return response.milestone;
  },

  async reorderMilestones(planId: string, milestones: { id: string; order: number }[]) {
    const response = await api.put<{ plan: Plan }>(`/plans/${planId}/milestones/reorder`, { milestones });
    return response.plan;
  },

  async generatePlan(): Promise<GeneratePlanResponse> {
    const response = await api.post<GeneratePlanResponse | GeneratePlanError>('/ai/generate-plan-from-data');
    
    if ('error' in response && response.error) {
      throw new Error(response.message);
    }
    
    return response as GeneratePlanResponse;
  },
};
