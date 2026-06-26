'use client';

import { AdminFeedbackDashboard } from '@/components/feedback/admin-feedback-table';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function AdminFeedbackPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('feedback.admin.title')}</h1>
        <p className="text-muted-foreground">{t('feedback.admin.subtitle')}</p>
      </div>

      <AdminFeedbackDashboard />
    </div>
  );
}