'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, BarChart3, TrendingUp, ArrowLeftRight, Users, CreditCard, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reportService } from '@/services/report.service';
import { accountService } from '@/services/account.service';
import { FeatureLock } from '@/components/subscription/feature-lock';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { MutationsTab } from '@/components/features/reports/mutations-tab';
import { InvestmentReportTab } from '@/components/features/reports/investment-report-tab';
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';
import { UserReportTab } from '@/components/features/reports/user-report-tab';
import { SubscriptionReportTab } from '@/components/features/reports/subscription-report-tab';
import { ActivityReportTab } from '@/components/features/reports/activity-report-tab';
import { useAuthStore } from '@/stores/auth.store';

export default function ReportsPage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'user' : 'overview');
  const { isHidden, toggle } = useAmountVisibility('reports');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: report, isLoading: reportLoading, isFetching: reportFetching } = useQuery({
    queryKey: ['monthlyReport', year, month, selectedAccountId],
    queryFn: () => reportService.getMonthlyReport(parseInt(year), parseInt(month), selectedAccountId !== 'all' ? selectedAccountId : undefined),
  });

  const { data: trends = [], isLoading: trendsLoading, isFetching: trendsFetching } = useQuery({
    queryKey: ['trends', selectedAccountId],
    queryFn: () => reportService.getTrends(6, selectedAccountId !== 'all' ? selectedAccountId : undefined),
  });

  const { data: netWorth, isLoading: netWorthLoading } = useQuery({
    queryKey: ['netWorth'],
    queryFn: () => reportService.getNetWorth(),
  });

  const downloadMutation = useMutation({
    mutationFn: () => reportService.downloadMonthlyTransactions(parseInt(year), parseInt(month)),
  });

  const handleDownload = () => {
    downloadMutation.mutate();
    toast.success(t('reports.downloadReport'));
  };

  const months = [
    { value: '1', label: t('reports.months.1') },
    { value: '2', label: t('reports.months.2') },
    { value: '3', label: t('reports.months.3') },
    { value: '4', label: t('reports.months.4') },
    { value: '5', label: t('reports.months.5') },
    { value: '6', label: t('reports.months.6') },
    { value: '7', label: t('reports.months.7') },
    { value: '8', label: t('reports.months.8') },
    { value: '9', label: t('reports.months.9') },
    { value: '10', label: t('reports.months.10') },
    { value: '11', label: t('reports.months.11') },
    { value: '12', label: t('reports.months.12') },
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <TabsList className="bg-muted dark:bg-zinc-800 p-1 rounded-xl">
              <TabsTrigger 
                value="user"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                {t('reports.tabs.userReport')}
              </TabsTrigger>
              <TabsTrigger 
                value="subscription"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {t('reports.tabs.subscription')}
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                {t('reports.tabs.activity')}
              </TabsTrigger>
            </TabsList>
            <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
          </div>
          <TabsContent value="user"><UserReportTab /></TabsContent>
          <TabsContent value="subscription"><SubscriptionReportTab /></TabsContent>
          <TabsContent value="activity"><ActivityReportTab /></TabsContent>
        </Tabs>
      ) : (
        <FeatureLock feature="reports">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            
            {/* Tab Header with Hide Amount Toggle */}
            <div className="flex items-center justify-between gap-4">
              <TabsList className="bg-muted dark:bg-zinc-800 p-1 rounded-xl">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('reports.tabs.overview')}
                </TabsTrigger>
                <TabsTrigger 
                  value="mutations"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {t('reports.tabs.mutations')}
                </TabsTrigger>
                <TabsTrigger 
                  value="investments"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('reports.tabs.investments')}
                </TabsTrigger>
              </TabsList>
              <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
            </div>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Filters + Download */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 dark:bg-zinc-800/50 rounded-xl">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[140px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[140px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-[180px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')} Akun</SelectItem>
                    {accounts?.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="bg-muted dark:bg-zinc-800 border-border dark:border-zinc-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('reports.downloadCsv')}
                </Button>
              </div>

              {/* Summary Cards */}
              {reportLoading || reportFetching ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl p-4 space-y-2 bg-muted dark:bg-zinc-800">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground truncate">{t('reports.totalIncome')}</p>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-500 truncate">
                      {formatCurrency(report?.report?.summary?.totalIncome ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
                    </p>
                  </div>
                  <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground truncate">{t('reports.totalExpense')}</p>
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-red-500 truncate">
                      {formatCurrency(report?.report?.summary?.totalExpense ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
                    </p>
                  </div>
                  <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground truncate">{t('reports.totalTransfer')}</p>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-500 truncate">
                      {formatCurrency(report?.report?.summary?.totalTransfer ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
                    </p>
                  </div>
                  <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground truncate">{t('reports.totalSavings')}</p>
                      <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold truncate">
                      {formatCurrency(report?.report?.summary?.balance ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
                    </p>
                  </div>
                </div>
              )}

              {/* Charts */}
              {reportLoading || reportFetching ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border bg-card dark:bg-zinc-900 border-border dark:border-zinc-800 p-6 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                  <div className="rounded-xl border bg-card dark:bg-zinc-900 border-border dark:border-zinc-800 p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle>{t('reports.expenseByCategory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {(report?.report?.expenseByCategory?.length ?? 0) > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={report!.report!.expenseByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="amount"
                                nameKey="name"
                              >
                                {report!.report!.expenseByCategory!.map((entry: { color: string }, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            {t('reports.noExpenseData')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle>{t('reports.financialTrends')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {trendsLoading || trendsFetching ? (
                          <Skeleton className="h-full w-full" />
                        ) : trends?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                              <Legend />
                              <Line type="monotone" dataKey="income" stroke="#10B981" name={t('reports.income')} />
                              <Line type="monotone" dataKey="expense" stroke="#EF4444" name={t('reports.expense')} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            {t('reports.noTrendData')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Net Worth */}
              {netWorthLoading ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl p-4 space-y-2 bg-muted dark:bg-zinc-800">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  ))}
                </div>
              ) : netWorth && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('reports.netWorth')}</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{t('reports.totalAssets')}</p>
                        <p className="text-xl font-bold text-emerald-500">
                          {formatCurrency(netWorth.totalAssets, 'IDR', { isHidden })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{t('reports.totalLiabilities')}</p>
                        <p className="text-xl font-bold text-red-500">
                          {formatCurrency(netWorth.totalLiabilities, 'IDR', { isHidden })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{t('reports.investments')}</p>
                        <p className="text-xl font-bold text-blue-500">
                          {formatCurrency(netWorth.investments, 'IDR', { isHidden })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent/10 dark:bg-accent/20 border-accent/20 dark:border-accent/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{t('reports.netWorth')}</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(netWorth.netWorth, 'IDR', { isHidden })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Mutations Tab - has its own filters and download CSV */}
            <TabsContent value="mutations">
              <MutationsTab isHidden={isHidden} />
            </TabsContent>

            {/* Investments Tab - has its own filters */}
            <TabsContent value="investments">
              <InvestmentReportTab isHidden={isHidden} />
            </TabsContent>
          </Tabs>
        </FeatureLock>
      )}
    </div>
  );
}
