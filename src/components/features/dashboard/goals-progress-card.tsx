'use client';

import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/services/goal.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';

interface GoalsProgressCardProps {
  isHidden: boolean;
}

export function GoalsProgressCard({ isHidden }: GoalsProgressCardProps) {
  const { t } = useI18n();
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const sortedGoals = [...goals]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sortedGoals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            {t('goalsProgress.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('goalsProgress.noGoals')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            {t('goalsProgress.title')}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">{t('goalsProgress.viewAll')} →</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{goal.name}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{isHidden ? '••••••••' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(goal.currentAmount)}</span>
                <span>{isHidden ? '••••••••' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(goal.targetAmount)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
