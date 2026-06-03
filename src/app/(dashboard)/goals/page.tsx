'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, History, Lock, Unlock, Edit, Trash2, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { goalService, Goal, CreateGoalInput, ContributionInput, Contribution } from '@/services/goal.service';
import { accountService, Account } from '@/services/account.service';
import { GoalForm, type GoalFormData } from '@/components/forms/goal-form';
import { ContributionForm } from '@/components/forms/contribution-form';
import { ContributionHistoryModal } from '@/components/modal/contribution-history-modal';
import { GoalCardSkeleton, GoalsOverviewSkeleton } from '@/components/skeleton/goal-skeleton';
import { formatCurrency } from '@/lib/currency';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { GoalCard } from '@/components/features/goals/goal-card';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function GoalsPage() {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, isFetching } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const { data: overview } = useQuery({
    queryKey: ['goals', 'overview'],
    queryFn: () => goalService.getOverview(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGoalInput) => goalService.create(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalInput> }) => goalService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId?: string }) => 
      accountId ? goalService.deleteWithTransaction(id, accountId) : goalService.delete(id),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => goalService.toggleLock(id),
  });

  const contributionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributionInput & { accountId?: string } }) => 
      data.accountId 
        ? goalService.addContributionWithAccount(id, data)
        : goalService.addContribution(id, data),
  });

  const historyMutation = useMutation({
    mutationFn: (id: string) => goalService.getContributions(id),
    onSuccess: (data) => {
      setContributions(data);
    },
  });

  const totalTarget = overview?.totalTarget ?? 0;
  const totalSaved = overview?.totalSaved ?? 0;
  const progress = overview?.progress ?? 0;

  const handleSubmit = async (data: GoalFormData) => {
    try {
      const submitData = data as unknown as CreateGoalInput;
      if (selectedGoal?.id) {
        await updateMutation.mutateAsync({ id: selectedGoal.id, data: submitData });
        toast.success('Goal berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success('Goal berhasil dibuat');
      }
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsFormOpen(false);
      setSelectedGoal(undefined);
    } catch (err) {
      toast.error('Gagal menyimpan goal');
    }
  };

  const handleContributionSubmit = async (data: ContributionInput & { accountId?: string }) => {
    if (selectedGoal) {
      await contributionMutation.mutateAsync({ id: selectedGoal.id, data });
      toast.success('Kontribusi berhasil ditambahkan');
      setIsContributionOpen(false);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  };

  const handleAddContribution = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsContributionOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleDelete = async (goal: Goal) => {
    try {
      if (goal.source === 'AUTO_GENERATED') {
        await goalService.deleteWithRefund(goal.id);
        toast.success(t('goals.deleted'));
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else {
        setSelectedGoal(goal);
        setSelectedAccountId('');
        setIsDeleteOpen(true);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || t('goals.failedDelete'));
    }
  };

  const handleDeleteClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setSelectedAccountId('');
    setIsDeleteOpen(true);
  };

  const handleLock = (goal: Goal) => {
    lockMutation.mutate(goal.id);
    toast.success(goal.isLocked ? t('goals.unlocked') : t('goals.locked'));
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  const handleHistory = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsHistoryOpen(true);
    setContributions([]);
    historyMutation.mutate(goal.id);
  };

const confirmDelete = async () => {
    if (selectedGoal && !deleteMutation.isPending) {
      try {
        await deleteMutation.mutateAsync({ 
          id: selectedGoal.id, 
          accountId: selectedAccountId || undefined
        });
        toast.success('Goal berhasil dihapus');
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        setSelectedGoal(undefined);
        setSelectedAccountId('');
        setIsDeleteOpen(false);
      } catch (err: unknown) {
        toast.error((err as Error).message || 'Gagal menghapus goal');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('goals.title')}</h1>
          <p className="text-muted-foreground">{t('goals.manage')}</p>
        </div>
        <Button onClick={() => { setSelectedGoal(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('goals.addGoal')}
        </Button>
      </div>

      {isFetching ? <GoalsOverviewSkeleton /> : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('goals.totalTarget')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('goals.totalSaved')}</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('goals.progress')}</p>
            <div className="mt-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-blue-500 mt-1">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Target className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium">{t('goals.noGoals')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('goals.addFirst')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddContribution={() => handleAddContribution(goal)}
              onViewHistory={() => handleHistory(goal)}
              onToggleLock={() => handleLock(goal)}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDeleteClick(goal)}
            />
          ))}
        </div>
      )}

      <GoalForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedGoal(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedGoal}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ContributionForm
        open={isContributionOpen}
        onOpenChange={setIsContributionOpen}
        onSubmit={handleContributionSubmit}
        isLoading={contributionMutation.isPending}
      />

      <ContributionHistoryModal
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        goalName={selectedGoal?.name || ''}
        goalId={selectedGoal?.id || ''}
        contributions={contributions}
        onContributionDeleted={() => selectedGoal && historyMutation.mutate(selectedGoal.id)}
        isLoading={historyMutation.isPending}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => {
        if (open) {
          setIsDeleteOpen(true);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('goals.deleteGoal')}?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('goals.deleteDescription')}
          </p>
          <div className="space-y-2 py-4">
            <Label>{t('goals.selectAccount')}</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={t('goals.selectAccountPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(Number(account.balance))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }} 
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {deleteMutation.isPending ? t('common.processing') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}