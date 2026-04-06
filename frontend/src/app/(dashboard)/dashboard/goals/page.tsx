'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

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

const mockGoals: Goal[] = [
  { id: '1', name: 'Liburan ke Jepang', targetAmount: 50000000, currentAmount: 35000000, deadline: '2026-12-31', icon: '✈️', color: '#3B82F6' },
  { id: '2', name: 'DP Rumah', targetAmount: 200000000, currentAmount: 85000000, deadline: '2027-06-30', icon: '🏠', color: '#10B981' },
  { id: '3', name: 'Pendidikan Anak', targetAmount: 100000000, currentAmount: 100000000, deadline: '2028-01-01', icon: '🎓', color: '#F59E0B' },
];

export default function GoalsPage() {
  const [goals] = useState(mockGoals);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Capai tujuan finansial Anda</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Goals
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Target</p>
          <p className="text-2xl font-bold">{totalTarget.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Terkumpul</p>
          <p className="text-2xl font-bold text-green-500">{totalSaved.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = percentage >= 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={goal.id} className={cn('hover:shadow-md transition-shadow', isCompleted && 'border-green-500')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ProgressRing progress={percentage} size={60} strokeWidth={6} color={goal.color} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{percentage.toFixed(0)}%</span>
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">{goal.icon} {goal.name}</CardTitle>
                    <Badge variant={isCompleted ? 'success' : daysLeft < 30 ? 'warning' : 'secondary'} className="text-xs mt-1">{isCompleted ? 'Tercapai!' : `${daysLeft} hari lagi`}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{goal.currentAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                  <span className="font-medium">{goal.targetAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                </div>
                {!isCompleted && (
                  <Button variant="outline" className="w-full" size="sm">Tabung</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
