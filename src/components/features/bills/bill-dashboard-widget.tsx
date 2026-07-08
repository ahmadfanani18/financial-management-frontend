'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billService } from '@/services/bill.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

interface BillDashboardWidgetProps {
  isHidden?: boolean;
}

export function BillDashboardWidget({ isHidden = false }: BillDashboardWidgetProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bills', 'current-month'],
    queryFn: () => billService.getCurrentMonth(),
  });

  const handleMarkPaid = async (billId: string) => {
    try {
      await billService.markAsPaid(billId);
      queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { bills = [], summary } = data || { bills: [], summary: { paid: { count: 0, total: '0' }, pending: { count: 0, total: '0' }, overdue: { count: 0, total: '0' } } };
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: id });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">{t('bills.thisMonth', { month: currentMonth })}</h3>
          <p className="text-sm text-muted-foreground">{t('bills.billsCount', { count: bills.length })}</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3" /> {summary.paid.count}
          </span>
          <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" /> {summary.pending.count}
          </span>
          <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs">
            <AlertCircle className="h-3 w-3" /> {summary.overdue.count}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <p className="text-xs text-green-600 dark:text-green-500">{t('bills.paid')}</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">{isHidden ? '***' : `Rp ${Number(summary.paid.total).toLocaleString('id-ID')}`}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
          <p className="text-xs text-amber-600 dark:text-amber-500">{t('bills.pending')}</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{isHidden ? '***' : `Rp ${Number(summary.pending.total).toLocaleString('id-ID')}`}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
          <p className="text-xs text-red-600 dark:text-red-500">{t('bills.overdue')}</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">{isHidden ? '***' : `Rp ${Number(summary.overdue.total).toLocaleString('id-ID')}`}</p>
        </div>
      </div>

      <div className="space-y-3">
        {bills.slice(0, 5).map((bill) => (
          <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bill.category?.color || '#8B5CF6' }}
              >
                <span className="text-white text-lg">
                  {bill.category?.icon || '📄'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{bill.name}</p>
                  <BillModeBadge mode={bill.mode} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('bills.due')}: {bill.dueDate} • {t('bills.exec')}: {bill.executionDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-semibold ${bill.status === 'PAID' ? 'text-green-600 dark:text-green-400' : bill.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isHidden ? '***' : `Rp ${Number(bill.amount).toLocaleString('id-ID')}`}
                </p>
                <BillStatusBadge status={bill.status} />
              </div>
              {bill.status !== 'PAID' && bill.mode === 'REMINDER_ONLY' && (
                <Button size="sm" onClick={() => handleMarkPaid(bill.id)}>
                  {t('bills.markAsPaid')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <a href="/bills" className="block mt-4 text-center text-sm text-primary hover:underline">
        {t('bills.manageAll')}
      </a>
    </div>
  );
}

function BillStatusBadge({ status }: { status: 'PAID' | 'PENDING' | 'OVERDUE' }) {
  const { t } = useI18n();
  const styles = {
    PAID: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    OVERDUE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  const labels = {
    PAID: t('bills.paid'),
    PENDING: t('bills.pending'),
    OVERDUE: t('bills.overdue'),
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function BillModeBadge({ mode }: { mode: 'AUTO_DEDUCT' | 'REMINDER_ONLY' }) {
  const { t } = useI18n();
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${mode === 'AUTO_DEDUCT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
      {mode === 'AUTO_DEDUCT' ? t('bills.auto') : t('bills.reminder')}
    </span>
  );
}
