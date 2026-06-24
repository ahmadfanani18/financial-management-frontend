'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GrowthStatsProps {
  newUsers7Days: number;
  conversionRate: number;
  isLoading?: boolean;
}

export function GrowthStats({ newUsers7Days, conversionRate, isLoading }: GrowthStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardContent className="pt-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardContent className="pt-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">New Users (7 days)</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{newUsers7Days}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{conversionRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
