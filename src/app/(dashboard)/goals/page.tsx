'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, History, Lock, Unlock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { GoalForm } from '@/components/forms/goal-form';
import { ContributionForm } from '@/components/forms/contribution-form';
import { ContributionHistoryModal } from '@/components/modal/contribution-history-modal';
import { GoalCardSkeleton, GoalsOverviewSkeleton } from '@/components/skeleton/goal-skeleton';
import { formatCurrency } from '@/lib/currency';
import { useNotification } from '@/hooks/use-notification';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function CircularProgress({ progress, color, size = 48 }: { progress: number; color?: string; size?: number }) {
  const data = [
    { name: 'progress', value: progress },
    { name: 'remaining', value: Math.max(0, 100 - progress) },
  ];
  const progressColor = color || (progress > 0 ? '#22c55e' : '#9ca3af');
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={size * 0.35}
            outerRadius={size * 0.5}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={progressColor} />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { notify } = useNotification();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    goal: Goal | null;
  }>({ open: false, goal: null });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalInput> }) => goalService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId?: string }) => 
      accountId ? goalService.deleteWithTransaction(id, accountId) : goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => goalService.toggleLock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const contributionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributionInput & { accountId?: string } }) => 
      data.accountId 
        ? goalService.addContributionWithAccount(id, data)
        : goalService.addContribution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsContributionOpen(false);
    },
  });

  const historyMutation = useMutation({
    mutationFn: (id: string) => goalService.getContributions(id),
    onSuccess: (data) => {
      setContributions(data);
      setIsHistoryOpen(true);
    },
  });

  const totalTarget = overview?.totalTarget ?? 0;
  const totalSaved = overview?.totalSaved ?? 0;
  const progress = overview?.progress ?? 0;

  const handleSubmit = async (data: CreateGoalInput) => {
    try {
      if (selectedGoal?.id) {
        notify.promise(
          updateMutation.mutateAsync({ id: selectedGoal.id, data }),
          notify.update('Goal')
        );
      } else {
        notify.promise(
          createMutation.mutateAsync(data),
          notify.create('Goal')
        );
      }
      setIsFormOpen(false);
      setSelectedGoal(undefined);
    } catch (err) {
      // Error handled by toast
    }
  };

  const handleContributionSubmit = async (data: ContributionInput & { accountId?: string }) => {
    if (selectedGoal) {
      await contributionMutation.mutateAsync({ id: selectedGoal.id, data });
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

  const handleDelete = (goal: Goal) => {
    if (goal.source === 'AUTO_GENERATED') {
      notify.promise(
        () => goalService.deleteWithRefund(goal.id),
        {
          loading: 'Menghapus goal...',
          success: 'Goal berhasil dihapus',
          error: (err) => err.message || 'Gagal menghapus goal',
        }
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      });
    } else {
      setSelectedGoal(goal);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteClick = (goal: Goal) => {
    setDeleteConfirm({ open: true, goal });
  };

  const handleLock = (goal: Goal) => {
    lockMutation.mutate(goal.id);
  };

  const handleHistory = (goal: Goal) => {
    setSelectedGoal(goal);
    historyMutation.mutate(goal.id);
  };

const confirmDelete = async () => {
    if (selectedGoal) {
      await notify.promise(
        () => deleteMutation.mutateAsync({ 
          id: selectedGoal.id, 
          accountId: selectedAccountId || undefined 
        }),
        notify.delete('Goal')
      );
    }
    setIsDeleteOpen(false);
    setSelectedGoal(undefined);
    setSelectedAccountId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Capai tujuan finansial Anda</p>
        </div>
        <Button onClick={() => { setSelectedGoal(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Goal
        </Button>
      </div>

      {isFetching ? <GoalsOverviewSkeleton /> : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Target</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Tersimpan</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Progress</p>
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
        <div className="text-center py-8 text-muted-foreground">Belum ada goal. Tambahkan goal pertama Anda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
<div className="flex items-center gap-3">
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.source === 'AUTO_GENERATED' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600">Milestone</Badge>
                    )}
                    {goal.isLocked && <Badge variant="outline" className="bg-orange-50 text-orange-600">Terkunci</Badge>}
                    {goal.isCompleted && <Badge variant="secondary">Selesai</Badge>}
                    {goal.isOverdue && !goal.isCompleted && <Badge variant="destructive">Terlambat</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <CircularProgress progress={goal.percentage} color={goal.color} size={72} />
                  <div className="flex-1 space-y-1">
                    <p className="text-lg font-semibold">{formatCurrency(goal.currentAmount)}</p>
                    <p className="text-sm text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.daysRemaining > 0 
                        ? `${goal.daysRemaining} hari tersisa` 
                        : goal.daysRemaining === 0 
                          ? 'Hari ini' 
                          : `Terlambat ${Math.abs(goal.daysRemaining)} hari`}
                    </p>
                    <p className="text-xs text-muted-foreground">Batas: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleAddContribution(goal)}>
                    <Plus className="w-4 h-4 mr-1" /> Kontribusi
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleHistory(goal)}>
                    <History className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleLock(goal)} title={goal.isLocked ? 'Unlock' : 'Lock'}>
                    {goal.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)} disabled={goal.isLocked} title={goal.isLocked ? 'Goal terkunci' : 'Edit'}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(goal)} disabled={goal.isLocked} className={`text-destructive ${!goal.isLocked ? 'hover:text-destructive' : 'opacity-50 cursor-not-allowed'}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        contributions={contributions}
        isLoading={historyMutation.isPending}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Goal?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            Menghapus goal akan menghapus semua kontribusi. Pilih akun untuk mengembalikan dana.
          </p>
          <div className="space-y-2 py-4">
            <Label>Akun untuk pengembalian dana (opsional)</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun" />
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
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, goal: null })}
        onConfirm={() => {
          if (deleteConfirm.goal) {
            handleDelete(deleteConfirm.goal);
          }
        }}
        title="Hapus Goal"
        description={
          deleteConfirm.goal?.source === 'AUTO_GENERATED'
            ? 'Goal ini dibuat dari Milestone. Menghapus akan mengembalikan uang ke akun. Lanjutkan?'
            : 'Yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan.'
        }
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}