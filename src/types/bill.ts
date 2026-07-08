export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: string;
  amountType: 'FIXED' | 'VARIABLE';
  mode: 'AUTO_DEDUCT' | 'REMINDER_ONLY';
  dueDate: number;
  executionDate: number;
  accountId: string;
  categoryId: string;
  description?: string;
  isActive: boolean;
  lastExecutedAt?: string;
  account: { id: string; name: string; balance: string };
  category: { id: string; name: string; color: string; icon: string };
  createdAt: string;
  updatedAt: string;
}

export interface BillWithStatus extends Bill {
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  lastTransaction?: {
    id: string;
    amount: string;
    date: string;
  };
}

export interface CreateBillInput {
  name: string;
  amount: string;
  amountType?: 'FIXED' | 'VARIABLE';
  mode?: 'AUTO_DEDUCT' | 'REMINDER_ONLY';
  dueDate: number;
  executionDate: number;
  accountId: string;
  categoryId: string;
  description?: string;
  isActive?: boolean;
}

export interface BillSummary {
  paid: { count: number; total: string };
  pending: { count: number; total: string };
  overdue: { count: number; total: string };
}

export interface CurrentMonthBillsResponse {
  bills: BillWithStatus[];
  summary: BillSummary;
}
