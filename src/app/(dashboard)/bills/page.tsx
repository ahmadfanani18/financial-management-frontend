'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billService } from '@/services/bill.service';
import type { Bill, BillWithStatus } from '@/types/bill';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { BillFormModal } from '@/components/features/bills/bill-form-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/ui/motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';
import { formatCurrency } from '@/lib/currency';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MarkAsPaidSheet } from '@/components/features/bills/mark-as-paid-sheet';
import { toast } from 'sonner';

type ViewMode = 'card' | 'table';
type StatusFilter = 'all' | 'active' | 'inactive';
type ModeFilter = 'all' | 'AUTO_DEDUCT' | 'REMINDER_ONLY';

function BillCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-28 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

function BillCard({
  bill,
  onEdit,
  onDelete,
  onMarkPaid,
  isHidden,
}: {
  bill: Bill | BillWithStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid?: () => void;
  isHidden?: boolean;
}) {
  const { t } = useI18n();
  const isWithStatus = 'status' in bill;
  const status = isWithStatus ? bill.status : bill.isActive ? 'PENDING' : undefined;

  const statusConfig = {
    PAID: { label: t('bills.paid') || 'Lunas', color: 'text-green-500', bg: 'bg-green-500/10' },
    PENDING: { label: t('bills.pending') || 'Tertunda', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    OVERDUE: { label: t('bills.overdue') || 'Jatuh Tempo', color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const modeConfig = {
    AUTO_DEDUCT: { label: t('bills.auto') || 'Auto Potong', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    REMINDER_ONLY: { label: t('bills.reminder') || 'Pengingat', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  const currentStatus = status ? statusConfig[status] : null;
  const currentMode = modeConfig[bill.mode];

  return (
    <div className="group relative rounded-2xl bg-card border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: bill.category?.color || '#64748B' }}
      />

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title={t('common.edit')}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            title={t('common.delete')}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-3 rounded-xl border"
          style={{ backgroundColor: `${bill.category?.color}15`, borderColor: `${bill.category?.color}30` }}
        >
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: bill.category?.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{bill.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${currentMode?.bg} ${currentMode?.color}`}>
              {currentMode?.label}
            </span>
            {currentStatus && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('bills.amount')}</span>
          <span className="text-xl font-bold">
            {formatCurrency(Number(bill.amount), 'IDR', { isHidden })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('bills.executionDate')}</span>
          <span className="text-sm">
            {bill.executionDate} / {bill.dueDate}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('bills.account')}</span>
          <span className="text-sm">{bill.account?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('bills.category')}</span>
          <span className="text-sm">{bill.category?.name}</span>
        </div>
      </div>

      {bill.isActive && bill.status !== 'PAID' && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onMarkPaid}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t('bills.markAsPaid')}
          </Button>
        </div>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-card border border-border p-5 animate-pulse">
          <div className="h-4 w-24 rounded bg-muted mb-2" />
          <div className="h-8 w-32 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function OverviewCards({
  summary,
  isLoading,
  isHidden,
}: {
  summary?: {
    paid: { count: number; total: string };
    pending: { count: number; total: string };
    overdue: { count: number; total: string };
  };
  isLoading: boolean;
  isHidden: boolean;
}) {
  const { t } = useI18n();

  if (isLoading) return <SummarySkeleton />;

  const cards = [
    {
      label: t('bills.totalPending') || 'Total Tertunda',
      value: formatCurrency(Number(summary?.pending.total || 0), 'IDR', { isHidden }),
      count: summary?.pending.count || 0,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: t('bills.overdue') || 'Jatuh Tempo',
      value: formatCurrency(Number(summary?.overdue.total || 0), 'IDR', { isHidden }),
      count: summary?.overdue.count || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: t('bills.paid') || 'Sudah Dibayar',
      value: formatCurrency(Number(summary?.paid.total || 0), 'IDR', { isHidden }),
      count: summary?.paid.count || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.count} {t('bills.bills') || 'tagihan'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BillsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isHidden, toggle } = useAmountVisibility('bills');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    billId: string | null;
  }>({ open: false, billId: null });
  const [markPaidSheet, setMarkPaidSheet] = useState<{ open: boolean; bill: Bill | BillWithStatus | null }>({
    open: false,
    bill: null,
  });

  const billFilters = useMemo(() => {
    if (statusFilter === 'all' && modeFilter === 'all') return {};
    return {
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      mode: modeFilter !== 'all' ? modeFilter : undefined,
    };
  }, [statusFilter, modeFilter]);

  const { data: billsData, isLoading } = useQuery({
    queryKey: ['bills', billFilters],
    queryFn: () => billService.getAll(billFilters),
  });

  const bills = billsData ?? [];

  const { data: currentMonthData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['bills', 'current-month'],
    queryFn: () => billService.getCurrentMonth(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const filteredBills = useMemo(() => {
    let filtered = bills ?? [];

    if (statusFilter === 'active') {
      filtered = filtered.filter((b) => b.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((b) => !b.isActive);
    }

    if (modeFilter !== 'all') {
      filtered = filtered.filter((b) => b.mode === modeFilter);
    }

    return filtered;
  }, [bills, statusFilter, modeFilter]);

  const handleEdit = (billId: string) => {
    setEditingBill(billId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await billService.delete(id);
      toast.success(t('bills.deletedSuccess') || 'Tagihan berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
      setDeleteConfirm({ open: false, billId: null });
    } catch {
      toast.error(t('bills.deleteError') || 'Gagal menghapus tagihan');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await billService.markAsPaid(id);
      toast.success(t('bills.markPaidSuccess') || 'Tagihan berhasil ditandai lunas');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
    } catch {
      toast.error(t('bills.markPaidError') || 'Gagal menandai tagihan');
    }
  };

  const handleOpenModal = (billId: string | null = null) => {
    setEditingBill(billId);
    setIsModalOpen(true);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bills.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('bills.subtitle') || 'Kelola tagihan bulanan'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
          >
            {isHidden ? (
              <>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('accounts.showAmount')}
                </span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('accounts.hideAmount')}
                </span>
              </>
            )}
          </button>
          <Button onClick={() => handleOpenModal(null)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('bills.addBill')}
          </Button>
        </div>
      </div>

      <OverviewCards
        summary={currentMonthData?.summary}
        isLoading={isLoadingSummary}
        isHidden={isHidden}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-muted border border-border">
          <button
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              viewMode === 'card'
                ? 'bg-success text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('common.card') || 'Kartu'}
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              viewMode === 'table'
                ? 'bg-success text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <List className="h-4 w-4" />
            {t('common.table') || 'Tabel'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('bills.status') || 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="active">{t('bills.active')}</SelectItem>
              <SelectItem value="inactive">{t('bills.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as ModeFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('bills.mode') || 'Mode'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="AUTO_DEDUCT">{t('bills.auto')}</SelectItem>
              <SelectItem value="REMINDER_ONLY">{t('bills.reminder')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BillCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="p-6 rounded-full bg-muted mb-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('bills.noBills')}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t('bills.noBillsDesc') || 'Tambahkan tagihan pertamamu untuk mulai melacak pengeluaran tetap bulanan.'}
          </p>
          <Button onClick={() => handleOpenModal(null)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('bills.addBill')}
          </Button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={() => handleEdit(bill.id)}
              onDelete={() => setDeleteConfirm({ open: true, billId: bill.id })}
              onMarkPaid={() => setMarkPaidSheet({ open: true, bill })}
              isHidden={isHidden}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead className="bg-muted/50 dark:bg-muted/20 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.name') || 'Nama'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.amount') || 'Jumlah'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.date') || 'Tanggal'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.mode') || 'Mode'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.account') || 'Akun'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.category') || 'Kategori'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('bills.status') || 'Status'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  {t('common.actions') || 'Aksi'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-border hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{bill.name}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(Number(bill.amount), 'IDR', { isHidden })}
                  </td>
                  <td className="px-4 py-3">
                    {bill.executionDate} / {bill.dueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        bill.mode === 'AUTO_DEDUCT'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}
                    >
                      {bill.mode === 'AUTO_DEDUCT' ? t('bills.auto') : t('bills.reminder')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{bill.account?.name}</td>
                  <td className="px-4 py-3">{bill.category?.name}</td>
                  <td className="px-4 py-3">
                    {bill.isActive ? (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">
                        {t('bills.active') || 'Aktif'}
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                        {t('bills.inactive') || 'Nonaktif'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {bill.mode === 'REMINDER_ONLY' && bill.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMarkPaidSheet({ open: true, bill })}
                        >
                          {t('bills.markAsPaid')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(bill.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm({ open: true, billId: bill.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, billId: null })}
        onConfirm={() => {
          if (deleteConfirm.billId) {
            handleDelete(deleteConfirm.billId);
          }
        }}
        title={t('bills.deleteBill') || 'Hapus Tagihan'}
        description={t('bills.deleteConfirm') || 'Tagihan yang dihapus tidak dapat dikembalikan.'}
        confirmText={t('common.delete')}
        variant="destructive"
      />

      <BillFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        billId={editingBill}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bills'] });
          queryClient.invalidateQueries({ queryKey: ['bills', {}] });
          queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
        }}
      />

      <MarkAsPaidSheet
        open={markPaidSheet.open}
        onOpenChange={(open) => setMarkPaidSheet({ open, bill: markPaidSheet.bill })}
        bill={markPaidSheet.bill}
      />
    </PageTransition>
  );
}
