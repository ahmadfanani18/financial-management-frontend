'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import type { Feedback } from '@/types/feedback';

interface FeedbackItemProps {
  feedback: Feedback;
}

const typeStyles = {
  BUG: 'bg-red-100 text-red-700',
  SUGGESTION: 'bg-blue-100 text-blue-700',
};

const statusStyles = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
};

export function FeedbackItem({ feedback }: FeedbackItemProps) {
  const { t } = useI18n();
  const date = new Date(feedback.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${typeStyles[feedback.type]}`}>
        {feedback.type === 'BUG' ? 'B' : 'S'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{feedback.subject}</h3>
          <span className={`px-2 py-0.5 text-xs rounded-full ${typeStyles[feedback.type]}`}>
            {feedback.type === 'BUG' ? t('feedback.bug') : t('feedback.suggestion')}
          </span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[feedback.status]}`}>
            {t(`feedback.status.${feedback.status.toLowerCase().replace('_', '')}`)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{feedback.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
    </div>
  );
}