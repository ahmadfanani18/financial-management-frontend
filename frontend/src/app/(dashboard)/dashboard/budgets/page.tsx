'use client';

import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Budget {
  id: string;
  category: { name: string; color: string };
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

const mockBudgets: Budget[] = [
  { id: '1', category: { name: 'Makanan', color: '#F97316' }, limit: 2000000, spent: 1850000, period: 'monthly' },
  { id: '2', category: { name: 'Transportasi', color: '#3B82F6' }, limit: 500000, spent: 320000, period: 'monthly' },
  { id: '3', category: { name: 'Hiburan', color: '#EF4444' }, limit: 300000, spent: 149000, period: 'monthly' },
  { id: '4', category: { name: 'Belanja', color: '#8B5CF6' }, limit: 1000000, spent: 1200000, period: 'monthly' },
];

export default function BudgetsPage() {
  const [budgets] = useState(mockBudgets);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">Kelola batas pengeluaran bulanan</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold">{totalBudget.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Terpakai</p>
          <p className="text-2xl font-bold text-red-500">{totalSpent.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Sisa Budget</p>
          <p className="text-2xl font-bold text-green-500">{(totalBudget - totalSpent).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isWarning = percentage >= 80;
          const isExceeded = percentage >= 100;

          return (
            <Card key={budget.id} className={`hover:shadow-md transition-shadow ${isExceeded ? 'border-red-500' : isWarning ? 'border-yellow-500' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: budget.category.color + '20' }}>
                    <span className="text-lg font-semibold" style={{ color: budget.category.color }}>{percentage.toFixed(0)}%</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{budget.category.name}</CardTitle>
                    <Badge variant={isExceeded ? 'destructive' : isWarning ? 'warning' : 'secondary'} className="text-xs mt-1">
                      {isExceeded ? 'Melebihi Limit' : isWarning ? 'Hampir Penuh' : 'Aman'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={percentage} className={isExceeded ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-yellow-500' : ''} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{budget.spent.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} terpakai</span>
                  <span className="font-medium">dari {budget.limit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                </div>
                {isWarning && !isExceeded && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    Sisa {((budget.limit - budget.spent)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
