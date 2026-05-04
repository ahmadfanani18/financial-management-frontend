'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Lock, Unlock, Edit, Trash2, History } from 'lucide-react';
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

function ProgressRing({ progress, size = 80, strokeWidth = 8, color = 'currentColor' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
}

export default function GoalsPage() {
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

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleSubmit = async (data: CreateGoalInput) => {
    if (selectedGoal?.id) {
      await updateMutation.mutateAsync({ id: selectedGoal.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedGoal(undefined);
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
    setSelectedGoal(goal);
    setIsDeleteOpen(true);
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
      await deleteMutation.mutateAsync({ 
        id: selectedGoal.id, 
        accountId: selectedAccountId || undefined 
      });
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
            <p className="text-2xl font-bold text-blue-500">{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%</p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon || '🎯'}</span>
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.isCompleted && <Badge variant="secondary">Selesai</Badge>}
                    {goal.isOverdue && !goal.isCompleted && <Badge variant="destructive">Terlambat</Badge>}
                    {goal.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ProgressRing progress={goal.percentage} color={goal.color} />
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{formatCurrency(goal.currentAmount)}</p>
                    <p className="text-sm text-muted-foreground">dari {formatCurrency(goal.targetAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{goal.daysRemaining} hari tersisa</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleAddContribution(goal)}>
                    <Plus className="w-4 h-4 mr-1" /> Kontribusi
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleHistory(goal)}>
                    <History className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleLock(goal)}
                    title={goal.isLocked ? 'Unlock goal' : 'Lock goal'}
                  >
                    {goal.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(goal)}
                    disabled={goal.isLocked}
                    title={goal.isLocked ? 'Goal terkunci' : 'Edit'}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(goal)}
                    className="text-destructive hover:text-destructive"
                  >
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
    </div>
  );
}