export type FeedbackType = 'BUG' | 'SUGGESTION';
export type FeedbackStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  subject: string;
  description: string;
  screenshot?: string | null;
  status: FeedbackStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface AdminFeedback extends Feedback {
  user: UserSummary;
}

export interface CreateFeedbackInput {
  type: FeedbackType;
  subject: string;
  description: string;
  screenshot?: string;
}

export interface FeedbackStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}
