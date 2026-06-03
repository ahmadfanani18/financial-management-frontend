'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Pencil, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="rounded-lg p-4 bg-muted/50 animate-pulse">
        <div className="h-4 w-20 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
      <div className="rounded-lg p-4 bg-muted/50 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
      <div className="rounded-lg p-4 bg-muted/50 animate-pulse">
        <div className="h-4 w-12 rounded bg-muted mb-2" />
        <div className="h-8 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
  onUpdateSpent,
}: {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateSpent: (id: string, spent: number) => void;
}) {
  const { t } = useI18n();
  const [isEditingSpent, setIsEditingSpent] = useState(false);
  const [spentInput, setSpentInput] = useState(budget.spent.toString());

  const handleSpentSave = () => {
    const newSpent = parseCurrencyInput(spentInput);
    onUpdateSpent(budget.id, newSpent);
    setIsEditingSpent(false);
  };

  const effectivePeriod = useMemo(() => {
    const start = new Date(budget.startDate);
    const end = budget.endDate ? new Date(budget.endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const periodLabel = { MONTHLY: t('budgets.monthly'), WEEKLY: t('budgets.weekly'), YEARLY: t('budgets.yearly'), CUSTOM: t('budgets.custom') }[budget.period] || budget.period;
    return {
      period: periodLabel,
      start: start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      end: end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  }, [budget.startDate, budget.endDate, budget.period]);

  return (
    <Card className="relative">
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('budgets.spent')}</span>
            <span className="font-medium">{formatCurrency(Number(budget.spent))}</span>
          </div>
          <Progress value={budget.percentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{formatCurrency(Number(budget.amount))}</span>
          </div>
          {budget.percentage > 100 && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{t('budgets.overBudget')}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
            <Calendar className="h-3 w-3" />
            <span>{effectivePeriod.start} - {effectivePeriod.end}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{budget.percentage.toFixed(0)}% terpakai</span>
            <span>{budget.period}</span>
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

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetsPage() {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    budget: Budget | null;
  }>({ open: false, budget: null });

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

  const updateSpentMutation = useMutation({
    mutationFn: ({ id, spent }: { id: string; spent: number }) => budgetService.updateSpent(id, spent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
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
  } catch (err) {
    toast.error('Gagal menghapus budget');
  }
};

  const handleDeleteClick = (budget: Budget) => {
    setDeleteConfirm({ open: true, budget });
  };

  const handleUpdateSpent = (id: string, spent: number) => {
    updateSpentMutation.mutate({ id, spent });
    toast.success('Pengeluaran berhasil diupdate');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('budgets.title')}</h1>
          <p className="text-muted-foreground">{t('budgets.manage')}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('budgets.addBudget')}
        </Button>
      </div>

      {(isFetching || isFetchingSummary) ? (
        <OverviewSkeleton />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{t('budgets.totalBudget')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalBudget || 0)}</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{t('budgets.spent')}</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(summary?.totalSpent || 0)}</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{t('budgets.remaining')}</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.remaining || 0)}</p>
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
      ) : budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('budgets.noBudgets')}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => handleDeleteClick(budget)}
              onUpdateSpent={handleUpdateSpent}
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