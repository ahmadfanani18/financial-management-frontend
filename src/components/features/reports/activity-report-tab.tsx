'use client';

import { useQuery } from '@tanstack/react-query';
import { adminReportService } from '@/services/admin-report.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ActivityReportTab() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['admin-activity-report'],
    queryFn: () => adminReportService.getActivityReport(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{report?.activeUsersToday ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{report?.activeUsersThisWeek ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
            <BarChartIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{report?.activeUsersThisMonth ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Login Frequency (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
<ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={report?.loginFrequency ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="logins" fill="#8B5CF6" name="Logins" />
                  </RechartsBarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Feature Usage</CardTitle></CardHeader>
          <CardContent>
            {report?.featureUsage && report.featureUsage.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={report.featureUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="feature" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="usageCount" fill="#10B981" name="Usage" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground">Feature usage data will be available when analytics tracking is implemented</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}