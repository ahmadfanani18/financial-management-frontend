'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { feedbackService } from '@/services/feedback.service';
import type { FeedbackType } from '@/types/feedback';

export function FeedbackForm() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [type, setType] = useState<FeedbackType>('BUG');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: () => feedbackService.create({ type, subject, description }),
    onSuccess: () => {
      toast.success(t('feedback.successSent'));
      setSubject('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
    },
    onError: () => toast.error(t('feedback.failedSent')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error(t('feedback.fillRequired'));
      return;
    }
    if (description.trim().length < 10) {
      toast.error(t('feedback.descriptionMin10'));
      return;
    }
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('feedback.type')}</label>
        <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BUG">{t('feedback.bug')}</SelectItem>
            <SelectItem value="SUGGESTION">{t('feedback.suggestion')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('feedback.subject')}</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('feedback.subjectPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('feedback.description')}</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('feedback.descriptionPlaceholder')}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? t('feedback.sending') : t('feedback.submit')}
      </Button>
    </form>
  );
}