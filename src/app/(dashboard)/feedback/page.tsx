'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackList } from '@/components/feedback/feedback-list';

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">
          Laporkan bug atau berikan saran untuk improve aplikasi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buat Feedback Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackList />
        </CardContent>
      </Card>
    </div>
  );
}