'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n/i18n-provider';

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransfer?: number;
  incomeChange?: number;
  expenseChange?: number;
  isHidden?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

function SummaryCard({ title, value, icon, trend, trendLabel, gradient, index }: any) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
      <Card className="group relative overflow-hidden hover-lift border-0 shadow-card bg-gradient-to-br from-card to-card/50 min-h-[140px]">
        <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500', gradient)} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', gradient)}>{icon}</div>
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend !== undefined ? (
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
                    isPositive && 'bg-success/10 text-success',
                    isNegative && 'bg-destructive/10 text-destructive',
                    !isPositive && !isNegative && 'bg-muted text-muted-foreground'
                  )}>
                    {isPositive && <ArrowUpRight className="h-3 w-3" />}
                    {isNegative && <ArrowDownRight className="h-3 w-3" />}
                    <span>{Math.abs(trend)}%</span>
                  </div>
                  {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
                </div>
              ) : (
                <div className="h-5" />
              )}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className={cn('h-24 w-24 rounded-full blur-2xl', gradient)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SummaryCards({ totalBalance, totalIncome, totalExpense, totalTransfer = 0, incomeChange = 12.5, expenseChange = -5.2, isHidden }: SummaryCardsProps) {
  const { t } = useI18n();
  const cards = [
    { title: t('dashboard.totalBalance'), value: formatCurrency(totalBalance, 'IDR', { isHidden }), icon: <Wallet className="h-6 w-6 text-white" />, gradient: 'bg-gradient-to-br from-primary to-primary-600' },
    { title: `${t('dashboard.income')} ${t('dashboard.thisMonth')}`, value: formatCurrency(totalIncome, 'IDR', { isHidden }), icon: <TrendingUp className="h-6 w-6 text-white" />, trend: incomeChange, trendLabel: t('dashboard.lastMonth'), gradient: 'bg-gradient-to-br from-success to-emerald-600' },
    { title: `${t('dashboard.expense')} ${t('dashboard.thisMonth')}`, value: formatCurrency(totalExpense, 'IDR', { isHidden }), icon: <TrendingDown className="h-6 w-6 text-white" />, trend: expenseChange, trendLabel: t('dashboard.lastMonth'), gradient: 'bg-gradient-to-br from-destructive to-red-600' },
    { title: `Transfer ${t('dashboard.thisMonth')}`, value: formatCurrency(totalTransfer, 'IDR', { isHidden }), icon: <ArrowRight className="h-6 w-6 text-white" />, gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => <SummaryCard key={card.title} index={index} {...card} />)}
    </div>
  );
}
