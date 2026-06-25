import { AdminFeedbackDashboard } from '@/components/feedback/admin-feedback-table';

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Dashboard</h1>
        <p className="text-muted-foreground">Kelola feedback dari pengguna</p>
      </div>

      <AdminFeedbackDashboard />
    </div>
  );
}