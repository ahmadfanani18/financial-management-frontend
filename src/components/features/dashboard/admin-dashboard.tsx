'use client';

import { useQuery } from '@tanstack/react-query';
import { adminReportService } from '@/services/admin-report.service';
import { StatsCards } from '@/components/admin/stats-cards';
import { GrowthStats } from './growth-stats';
import { UserChart } from './user-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CreditCard, Clock } from 'lucide-react';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    pendingPayments: number;
    expiringSoon: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const { data: userReport, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user-report'],
    queryFn: () => adminReportService.getUserReport(),
  });

  const { data: subscriptionReport, isLoading: subLoading } = useQuery({
    queryKey: ['admin-subscription-report'],
    queryFn: () => adminReportService.getSubscriptionReport(),
  });

  const isLoading = userLoading || subLoading;

  const computedStats = {
    totalUsers: userReport?.totalUsers ?? stats.totalUsers,
    freeUsers: userReport?.freeUsers ?? stats.freeUsers,
    proUsers: userReport?.proUsers ?? stats.proUsers,
    pendingPayments: subscriptionReport?.pendingPayments ?? stats.pendingPayments,
    expiringSoon: subscriptionReport?.expiringSoon?.length ?? stats.expiringSoon,
  };

  const conversionRate = computedStats.totalUsers > 0
    ? Math.round((computedStats.proUsers / computedStats.totalUsers) * 10000) / 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and metrics</p>
        </div>
      </div>

      <StatsCards stats={computedStats} />

      <GrowthStats
        newUsers7Days={userReport?.newUsersLast7Days ?? 0}
        conversionRate={conversionRate}
        isLoading={isLoading}
      />

      <UserChart
        data={userReport?.registrationTrend ?? []}
        isLoading={userLoading}
      />

      {subscriptionReport && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subscriptionReport.mrr)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <Crown className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subscriptionReport.totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trial Users</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userReport?.trialUsers ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
