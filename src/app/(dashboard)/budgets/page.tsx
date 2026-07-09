'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Pencil, Trash2, Calendar, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { budgetService, Budget, CreateBudgetInput } from '@/services/budget.service';
import { categoryService } from '@/services/category.service';
import { BudgetForm } from '@/components/forms/budget-form';
import { formatCurrency } from '@/lib/currency';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

function parseCurrencyInput(value: string) {
  const num = value.replace(/\D/g, '');
  return parseInt(num) || 0;
}

function BudgetCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="h-2 w-full rounded bg-muted" />
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl p-5 bg-muted/50 animate-pulse">
        <div className="h-4 w-20 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
      <div className="rounded-xl p-5 bg-muted/50 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
      <div className="rounded-xl p-5 bg-muted/50 animate-pulse">
        <div className="h-4 w-12 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}

type BudgetStatus = 'healthy' | 'nearlimit' | 'overbudget';

function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage > 100) return 'overbudget';
  if (percentage >= 75) return 'nearlimit';
  return 'healthy';
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
  isHidden,
}: {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
  isHidden?: boolean;
}) {
  const { t } = useI18n();
  const status = getBudgetStatus(budget.percentage);

  const effectivePeriod = useMemo(() => {
    const start = new Date(budget.startDate);
    const end = budget.endDate ? new Date(budget.endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const periodLabel = { MONTHLY: t('budgets.monthly'), WEEKLY: t('budgets.weekly'), YEARLY: t('budgets.yearly'), CUSTOM: t('budgets.custom') }[budget.period] || budget.period;
    return {
      period: periodLabel,
      start: start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      end: end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  }, [budget.startDate, budget.endDate, budget.period, t]);

  const statusColors = {
    healthy: 'text-green-500',
    nearlimit: 'text-amber-500',
    overbudget: 'text-red-500',
  };

  const progressColors = {
    healthy: 'bg-green-500',
    nearlimit: 'bg-amber-500',
    overbudget: 'bg-red-500',
  };

  const bgColors = {
    healthy: 'bg-green-500/10',
    nearlimit: 'bg-amber-500/10',
    overbudget: 'bg-red-500/10',
  };

  return (
    <Card className="relative transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" data-status={status}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{budget.category.name}</CardTitle>
            <Badge variant="outline" className="mt-1">{effectivePeriod.period}</Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-red-500" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('budgets.spent')}</span>
            <span className="font-medium">{formatCurrency(Number(budget.spent), 'IDR', { isHidden })}</span>
          </div>
          <Progress value={Math.min(budget.percentage, 100)} className="h-2.5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('budgets.budget')}</span>
            <span className="font-medium">{formatCurrency(Number(budget.amount), 'IDR', { isHidden })}</span>
          </div>
          {status === 'overbudget' && (
            <div className={`flex items-center gap-1 text-sm ${statusColors[status]}`}>
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{t('budgets.overBudgetLabel')}</span>
            </div>
          )}
          {status === 'nearlimit' && (
            <div className={`flex items-center gap-1 text-xs ${statusColors[status]} font-medium`}>
              <AlertTriangle className="h-3 w-3" />
              <span>{t('budgets.nearLimitWarning')}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
            <Calendar className="h-3 w-3" />
            <span>{effectivePeriod.start} - {effectivePeriod.end}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={`font-medium ${statusColors[status]}`}>
              {t('budgets.percentageUsed', { percent: budget.percentage.toFixed(0) })}
            </span>
            <span>{effectivePeriod.period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const MONTHS = [
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' },
];

type FilterTab = 'all' | 'overbudget' | 'nearlimit' | 'healthy';

export default function BudgetsPage() {
  const { t } = useI18n();
  const { isHidden, toggle } = useAmountVisibility('budgets');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    budget: Budget | null;
  }>({ open: false, budget: null });
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const currentMonth = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  const queryClient = useQueryClient();

  const { data: budgets = [], isFetching } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => budgetService.getAll(currentMonth),
  });

  const { data: summary, isFetching: isFetchingSummary } = useQuery({
    queryKey: ['budgetSummary', currentMonth],
    queryFn: () => budgetService.getSummary(currentMonth),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    enabled: isFormOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetService.create(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBudgetInput }) =>
      budgetService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
  });

  const handleSubmit = async (data: CreateBudgetInput) => {
    setFormError(undefined);
    try {
      if (editingBudget) {
        await updateMutation.mutateAsync({ id: editingBudget.id, data });
        toast.success('Budget berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Budget berhasil dibuat');
      }
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      setIsFormOpen(false);
      setEditingBudget(undefined);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async (budget: Budget) => {
    try {
      await deleteMutation.mutateAsync(budget.id);
      toast.success('Budget berhasil dihapus');
      setDeleteConfirm({ open: false, budget: null });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    } catch {
      toast.error('Gagal menghapus budget');
    }
  };

  const handleDeleteClick = (budget: Budget) => {
    setDeleteConfirm({ open: true, budget });
  };

  const filteredBudgets = useMemo(() => {
    if (filterTab === 'all') return budgets;
    return budgets.filter(b => {
      const status = getBudgetStatus(b.percentage);
      return status === filterTab;
    });
  }, [budgets, filterTab]);

  const filterCounts = useMemo(() => {
    return {
      all: budgets.length,
      overbudget: budgets.filter(b => getBudgetStatus(b.percentage) === 'overbudget').length,
      nearlimit: budgets.filter(b => getBudgetStatus(b.percentage) === 'nearlimit').length,
      healthy: budgets.filter(b => getBudgetStatus(b.percentage) === 'healthy').length,
    };
  }, [budgets]);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('budgets.filter.all') },
    { key: 'overbudget', label: t('budgets.filter.overBudget') },
    { key: 'nearlimit', label: t('budgets.filter.nearLimit') },
    { key: 'healthy', label: t('budgets.filter.healthy') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('budgets.title')}</h1>
          <p className="text-muted-foreground">{t('budgets.manage')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
          >
            {isHidden ? (
              <>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.showAmount')}</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.hideAmount')}</span>
              </>
            )}
          </button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('budgets.addBudget')}
          </Button>
        </div>
      </div>

      {isFetching || isFetchingSummary ? (
        <OverviewSkeleton />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-semibold ${
                  filterTab === tab.key ? 'bg-primary-foreground/20' : 'bg-background'
                }`}>
                  {filterCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl p-5 bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">{t('budgets.totalBudget')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalBudget || 0, 'IDR', { isHidden })}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('budgets.thisMonth')}</p>
            </div>
            <div className="rounded-xl p-5 bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-muted-foreground">{t('budgets.spent')}</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(summary?.totalSpent || 0, 'IDR', { isHidden })}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('budgets.ofTotal')}</p>
            </div>
            <div className="rounded-xl p-5 bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">{t('budgets.remaining')}</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.remaining || 0, 'IDR', { isHidden })}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('budgets.available')}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(y => y - 1);
                } else {
                  setSelectedMonth(m => m - 1);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, -1, -2].map((offset) => {
                  const year = now.getFullYear() + offset;
                  return <SelectItem key={year} value={String(year)}>{String(year)}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(y => y + 1);
                } else {
                  setSelectedMonth(m => m + 1);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {isFetching ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <BudgetCardSkeleton key={i} />)}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {budgets.length === 0 ? t('budgets.noBudgets') : t('budgets.noBudgets')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => handleDeleteClick(budget)}
              isHidden={isHidden}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, budget: null })}
        onConfirm={() => {
          if (deleteConfirm.budget) {
            handleDelete(deleteConfirm.budget);
          }
        }}
        title={t('budgets.deleteBudget')}
        description={`${t('messages.confirmDelete')} "${deleteConfirm.budget?.category.name}"?`}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <BudgetForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingBudget(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingBudget}
        isLoading={createMutation.isPending || updateMutation.isPending}
        error={formError}
      />
    </div>
  );
}
