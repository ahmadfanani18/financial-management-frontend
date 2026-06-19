'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { reportService, type Trend } from '@/services/report.service';
import { useI18n } from '@/components/i18n/i18n-provider';

interface SpendingChartProps {
  isHidden?: boolean;
}

const CustomTooltip = ({ active, payload, label, isHidden }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(payload[0].value, 'IDR', { isHidden })}</p>
      </div>
    );
  }
  return null;
};

export function SpendingChart({ isHidden }: SpendingChartProps) {
  const { t } = useI18n();
  const { data: trends, isLoading } = useQuery<Trend[]>({
    queryKey: ['spendingTrends'],
    queryFn: () => reportService.getTrends(6),
  });

  const chartData = trends?.map(t => ({
    name: t.month,
    value: t.expense,
  })) || [];

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

  const avgExpense = trends?.length ? Math.round(trends.reduce((sum, t) => sum + t.expense, 0) / trends.length) : 0;
  const maxExpense = trends?.length ? Math.max(...trends.map(t => t.expense)) : 0;
  const minExpense = trends?.length ? Math.min(...trends.map(t => t.expense)) : 0;

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!trends?.length || chartData.every(d => d.value === 0)) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">{t('dashboard.monthlyTrend')}</CardTitle>
                <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
      <Card className="hover-lift">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{t('dashboard.monthlyTrend')}</CardTitle>
              <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary to-primary-300" />
              <span className="text-xs text-muted-foreground">{t('dashboard.expense')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary-300))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}jt`} dx={-10} />
                <Tooltip content={<CustomTooltip isHidden={isHidden} />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value === maxValue ? 'url(#colorGradient)' : 'hsl(var(--primary))'} fillOpacity={entry.value === maxValue ? 1 : 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Rata-rata</p>
              <p className="text-sm font-semibold">{formatCurrency(avgExpense, 'IDR', { isHidden })}</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground mb-1">Tertinggi</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(maxExpense, 'IDR', { isHidden })}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Terendah</p>
              <p className="text-sm font-semibold text-success">{formatCurrency(minExpense, 'IDR', { isHidden })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
