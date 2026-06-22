'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, BarChart3 } from 'lucide-react';
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
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

export default function ReportsPage() {
  const { t } = useI18n();
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

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['monthlyReport', year, month],
    queryFn: () => reportService.getMonthlyReport(parseInt(year), parseInt(month)),
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ['trends'],
    queryFn: () => reportService.getTrends(6),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
      </div>

      <FeatureLock feature="reports">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="mutations">Mutasi Akun</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
        <div className="flex gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Akun</SelectItem>
              {accounts?.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('reports.downloadCsv')}
          </Button>
        </div>

        {reportLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-primary/10 rounded-lg p-4 overflow-hidden">
              <p className="text-sm text-muted-foreground truncate">{t('reports.totalIncome')}</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-green-500 truncate">
                {formatCurrency(report?.report?.summary?.totalIncome ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
              </p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 overflow-hidden">
              <p className="text-sm text-muted-foreground truncate">{t('reports.totalExpense')}</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-red-500 truncate">
                {formatCurrency(report?.report?.summary?.totalExpense ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
              </p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 overflow-hidden">
              <p className="text-sm text-muted-foreground truncate">Total Transfer</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-500 truncate">
                {formatCurrency(report?.report?.summary?.totalTransfer ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
              </p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 overflow-hidden">
              <p className="text-sm text-muted-foreground truncate">{t('reports.totalSavings')}</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-green-500 truncate">
                {formatCurrency(report?.report?.summary?.balance ?? 0, 'IDR', { isHidden }) || 'Rp 0'}
              </p>
            </div>
          </div>
        )}

        {reportLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.financialTrends')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {trends?.length > 0 ? (
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

        {netWorthLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        ) : netWorth && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('reports.totalAssets')}</p>
                <p className="text-xl font-bold text-green-500">
                  {formatCurrency(netWorth.totalAssets, 'IDR', { isHidden })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('reports.totalLiabilities')}</p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrency(netWorth.totalLiabilities, 'IDR', { isHidden })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('reports.investments')}</p>
                <p className="text-xl font-bold text-blue-500">
                  {formatCurrency(netWorth.investments, 'IDR', { isHidden })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('reports.netWorth')}</p>
                <p className="text-xl font-bold">
                  {formatCurrency(netWorth.netWorth, 'IDR', { isHidden })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        </TabsContent>

        <TabsContent value="mutations">
          <MutationsTab isHidden={isHidden} />
        </TabsContent>
      </Tabs>
      </FeatureLock>
    </div>
  );
}
