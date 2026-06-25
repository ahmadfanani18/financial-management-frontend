'use client';

import { useQuery } from '@tanstack/react-query';
import { feedbackService } from '@/services/feedback.service';
import { FeedbackItem } from './feedback-item';
import { Skeleton } from '@/components/ui/skeleton';

export function FeedbackList() {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: () => feedbackService.getMyFeedback(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!feedback?.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Belum ada feedback yang dikirim
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((item) => (
        <FeedbackItem key={item.id} feedback={item} />
      ))}
    </div>
  );
}