'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { AdminFeedbackDashboard } from '@/components/feedback/admin-feedback-table';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAuthStore } from '@/stores/auth.store';

export default function FeedbackPage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (isAdmin) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('feedback.title')}</h1>
        <p className="text-muted-foreground">
          {t('feedback.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.newFeedback')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.myFeedback')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackList />
        </CardContent>
      </Card>
    </div>
  );
}
