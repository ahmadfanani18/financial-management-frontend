'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedbackService } from '@/services/feedback.service';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminFeedbackModal } from './admin-feedback-modal';
import { useI18n } from '@/components/i18n/i18n-provider';
import type { AdminFeedback, FeedbackStats } from '@/types/feedback';

const statusStyles = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
};

export function AdminFeedbackDashboard() {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedback | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: () => feedbackService.getAdminFeedback(),
  });

  const stats: FeedbackStats = data?.stats || { total: 0, open: 0, inProgress: 0, resolved: 0 };

  const filteredFeedback = data?.feedback.filter(f => {
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  }) || [];

  const handleReview = (feedback: AdminFeedback) => {
    setSelectedFeedback(feedback);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('feedback.admin.total')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('feedback.status.open')}</p>
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('feedback.status.inProgress')}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('feedback.status.resolved')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('feedback.admin.allType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('feedback.admin.allType')}</SelectItem>
            <SelectItem value="BUG">{t('feedback.bug')}</SelectItem>
            <SelectItem value="SUGGESTION">{t('feedback.suggestion')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('feedback.admin.allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('feedback.admin.allStatus')}</SelectItem>
            <SelectItem value="OPEN">{t('feedback.status.open')}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t('feedback.status.inProgress')}</SelectItem>
            <SelectItem value="RESOLVED">{t('feedback.status.resolved')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('feedback.admin.user')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('feedback.type')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('feedback.subject')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('feedback.admin.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('feedback.admin.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFeedback.map((f) => (
                <tr key={f.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {f.user.name[0]}
                      </span>
                      <span className="font-medium">{f.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${f.type === 'BUG' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {f.type === 'BUG' ? t('feedback.bug') : t('feedback.suggestion')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{f.subject}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(f.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[f.status]}`}>
                      {t(`feedback.status.${f.status.toLowerCase().replace('_', '')}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleReview(f)}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      {t('feedback.admin.review')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFeedback.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t('feedback.admin.noData')}</p>
          )}
        </CardContent>
      </Card>

      <AdminFeedbackModal
        feedback={selectedFeedback}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}