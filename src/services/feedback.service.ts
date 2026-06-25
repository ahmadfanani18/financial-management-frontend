import { api } from '@/lib/api';
import type { Feedback, AdminFeedback, CreateFeedbackInput, FeedbackStats } from '@/types/feedback';

interface UserFeedbackResponse {
  feedback: Feedback[];
}

interface AdminFeedbackResponse {
  feedback: AdminFeedback[];
  stats: FeedbackStats;
}

interface CreateFeedbackResponse {
  feedback: Feedback;
}

interface UpdateFeedbackResponse {
  feedback: Feedback;
}

export const feedbackService = {
  async getMyFeedback(): Promise<Feedback[]> {
    const response = await api.get<UserFeedbackResponse>('/feedback');
    return response.feedback;
  },

  async create(input: CreateFeedbackInput): Promise<Feedback> {
    const response = await api.post<CreateFeedbackResponse>('/feedback', input);
    return response.feedback;
  },

  async getAdminFeedback(): Promise<{ feedback: AdminFeedback[]; stats: FeedbackStats }> {
    const response = await api.get<AdminFeedbackResponse>('/admin/feedback');
    return response;
  },

  async updateStatus(id: string, data: { status?: string; adminNote?: string }): Promise<Feedback> {
    const response = await api.patch<UpdateFeedbackResponse>(`/admin/feedback/${id}`, data);
    return response.feedback;
  },
};
