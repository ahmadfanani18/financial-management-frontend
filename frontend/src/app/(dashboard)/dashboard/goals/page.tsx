'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { goalService, Goal, CreateGoalInput, ContributionInput } from '@/services/goal.service';
import { GoalForm } from '@/components/forms/goal-form';
import { ContributionForm } from '@/components/forms/contribution-form';

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
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGoalInput) => goalService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const contributionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributionInput }) => goalService.addContribution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsContributionOpen(false);
    },
  });

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleSubmit = async (data: CreateGoalInput) => {
    if (selectedGoal) {
      await goalService.update(selectedGoal.id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedGoal(undefined);
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  const handleContributionSubmit = async (data: ContributionInput) => {
    if (selectedGoal) {
      await contributionMutation.mutateAsync({ id: selectedGoal.id, data });
    }
  };

  const handleAddContribution = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsContributionOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Capai tujuan finansial Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Target</p>
          <p className="text-2xl font-bold">{totalTarget.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tersimpan</p>
          <p className="text-2xl font-bold text-green-500">{totalSaved.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-2xl font-bold text-blue-500">{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
                  {goal.isCompleted && <Badge variant="secondary">Selesai</Badge>}
                  {goal.isOverdue && !goal.isCompleted && <Badge variant="destructive">Terlambat</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ProgressRing progress={goal.percentage} color={goal.color} />
                  <div className="flex-1">
                    <p className="text-lg font-semibold">
                      {goal.currentAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      dari {goal.targetAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {goal.daysRemaining} hari tersisa
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => handleAddContribution(goal)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kontribusi
                </Button>
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
        isLoading={createMutation.isPending}
      />

      <ContributionForm
        open={isContributionOpen}
        onOpenChange={setIsContributionOpen}
        onSubmit={handleContributionSubmit}
        isLoading={contributionMutation.isPending}
      />
    </div>
  );
}
