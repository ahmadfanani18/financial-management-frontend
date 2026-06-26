'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import type { AdminFeedback } from '@/types/feedback';

interface AdminFeedbackModalProps {
  feedback: AdminFeedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminFeedbackModal({ feedback, open, onOpenChange }: AdminFeedbackModalProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; adminNote?: string }) =>
      fetch(`/api/admin/feedback/${feedback?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast.success(t('feedback.admin.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      onOpenChange(false);
    },
    onError: () => toast.error(t('feedback.admin.updateFailed')),
  });

  const handleSubmit = () => {
    updateMutation.mutate({
      status: status || undefined,
      adminNote: adminNote || undefined,
    });
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('feedback.admin.review')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('feedback.admin.user')}</p>
              <p className="font-medium">{feedback.user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('feedback.admin.email')}</p>
              <p className="font-medium">{feedback.user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('feedback.type')}</p>
              <p className="font-medium">{feedback.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('feedback.admin.date')}</p>
              <p className="font-medium">{new Date(feedback.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">{t('feedback.subject')}</p>
            <p className="font-medium">{feedback.subject}</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">{t('feedback.description')}</p>
            <p className="text-sm">{feedback.description}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">{t('feedback.admin.updateStatus')}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={feedback.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">{t('feedback.status.open')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('feedback.status.inProgress')}</SelectItem>
                  <SelectItem value="RESOLVED">{t('feedback.status.resolved')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('feedback.admin.adminNote')}</label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={t('feedback.admin.adminNotePlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('feedback.admin.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.saving') : t('feedback.admin.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}