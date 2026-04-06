import { api } from '@/lib/api';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  percentage: number;
  daysRemaining: number;
  isCompleted: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  deadline: string;
  icon?: string;
  color?: string;
}

export interface ContributionInput {
  amount: number;
  date: string;
  note?: string;
}

export const goalService = {
  async getAll() {
    const response = await api.get<{ goals: Goal[] }>('/goals');
    return response.goals;
  },

  async getById(id: string) {
    const response = await api.get<{ goal: Goal }>(`/goals/${id}`);
    return response.goal;
  },

  async create(data: CreateGoalInput) {
    const response = await api.post<{ goal: Goal }>('/goals', data);
    return response.goal;
  },

  async update(id: string, data: Partial<CreateGoalInput>) {
    const response = await api.put<{ goal: Goal }>(`/goals/${id}`, data);
    return response.goal;
  },

  async delete(id: string) {
    return api.delete(`/goals/${id}`);
  },

  async addContribution(id: string, data: ContributionInput) {
    const response = await api.post<{ goal: Goal }>(`/goals/${id}/contributions`, data);
    return response.goal;
  },
};
