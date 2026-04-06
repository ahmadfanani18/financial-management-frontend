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
};
