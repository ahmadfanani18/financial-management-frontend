'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function FeedbackPage() {
  const { t } = useI18n();

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