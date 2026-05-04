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
  isLocked: boolean;
  percentage: number;
  daysRemaining: number;
  isCompleted: boolean;
  isOverdue: boolean;
  source?: 'MANUAL' | 'AUTO_GENERATED';
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
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

export interface ContributionWithAccountInput {
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
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

  async deleteWithTransaction(id: string, accountId?: string) {
    return api.delete(`/goals/${id}/with-transaction`, { accountId });
  },

  async addContribution(id: string, data: ContributionInput) {
    const response = await api.post<{ goal: Goal }>(`/goals/${id}/contributions`, data);
    return response.goal;
  },

  async addContributionWithAccount(id: string, data: ContributionWithAccountInput) {
    const response = await api.post<{ goal: Goal }>(`/goals/${id}/contributions/with-account`, data);
    return response.goal;
  },

  async toggleLock(id: string) {
    const response = await api.patch<{ goal: Goal }>(`/goals/${id}/lock`);
    return response.goal;
  },

  async getContributions(id: string) {
    const response = await api.get<{ contributions: Contribution[] }>(`/goals/${id}/contributions`);
    return response.contributions;
  },

  async createFromMilestone(milestoneId: string, data?: Partial<CreateGoalInput>) {
    const response = await api.post<{ goal: Goal }>(`/goals/from-milestone/${milestoneId}`, data || {});
    return response.goal;
  },

  async deleteWithRefund(id: string) {
    return api.delete(`/goals/${id}/with-refund`);
  },

  async getOverview() {
    const response = await api.get<{ totalTarget: number; totalSaved: number; progress: number }>('/goals/overview');
    return response;
  },
};