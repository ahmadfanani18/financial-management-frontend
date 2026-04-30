'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { budgetService, Budget, CreateBudgetInput } from '@/services/budget.service';
import { categoryService } from '@/services/category.service';
import { BudgetForm } from '@/components/forms/budget-form';
import { formatCurrency } from '@/lib/currency';

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
  const [isEditingSpent, setIsEditingSpent] = useState(false);
  const [spentInput, setSpentInput] = useState(budget.spent.toString());

  const handleSpentSave = () => {
    const newSpent = parseCurrencyInput(spentInput);
    onUpdateSpent(budget.id, newSpent);
    setIsEditingSpent(false);
  };

  return (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{budget.category.name}</CardTitle>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {budget.isOverBudget && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Over Budget
            </Badge>
          )}
          {budget.isWarning && !budget.isOverBudget && (
            <Badge variant="outline" className="text-xs text-yellow-500">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Warning
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            {isEditingSpent ? (
              <Input
                className="h-6 w-24 text-sm"
                value={spentInput}
                onChange={(e) => setSpentInput(e.target.value.replace(/\D/g, ''))}
                onBlur={handleSpentSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSpentSave()}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                className="cursor-pointer hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpentInput(budget.spent.toString());
                  setIsEditingSpent(true);
                }}
              >
                {formatCurrency(budget.spent)}
              </span>
            )}
            <span className="text-muted-foreground">{formatCurrency(budget.amount)}</span>
          </div>
          <Progress value={budget.percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{budget.percentage.toFixed(0)}% terpakai</span>
            <span>{budget.period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const queryClient = useQueryClient();

  const { data: budgets = [], isFetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll(),
  });

  const { data: summary } = useQuery({
    queryKey: ['budgetSummary'],
    queryFn: () => budgetService.getSummary(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    enabled: isFormOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });

  const updateSpentMutation = useMutation({
    mutationFn: ({ id, spent }: { id: string; spent: number }) => budgetService.updateSpent(id, spent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });

  const handleSubmit = async (data: CreateBudgetInput) => {
    if (editingBudget) {
      await budgetService.update(editingBudget.id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingBudget(undefined);
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = (budget: Budget) => {
    if (confirm(`Hapus budget "${budget.category.name}"?`)) {
      deleteMutation.mutate(budget.id);
    }
  };

  const handleUpdateSpent = (id: string, spent: number) => {
    updateSpentMutation.mutate({ id, spent });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">Kelola batas pengeluaran bulanan</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Budget
        </Button>
      </div>

      {isFetching && !summary ? (
        <OverviewSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalBudget || 0)}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Terpakai</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(summary?.totalSpent || 0)}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Sisa</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.remaining || 0)}</p>
          </div>
        </div>
      )}

      {isFetching ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <BudgetCardSkeleton key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Belum ada budget. Tambahkan budget pertama Anda.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => handleDelete(budget)}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingBudget(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingBudget}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
