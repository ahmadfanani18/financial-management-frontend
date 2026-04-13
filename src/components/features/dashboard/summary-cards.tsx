'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export function SummaryCards({ totalBalance, totalIncome, totalExpense }: SummaryCardsProps) {
  const cards = [
    { title: 'Total Saldo', value: formatCurrency(totalBalance), icon: 'balance' as const, color: 'blue' as const },
    { title: 'Pemasukan', value: formatCurrency(totalIncome), icon: 'income' as const, color: 'green' as const },
    { title: 'Pengeluaran', value: formatCurrency(totalExpense), icon: 'expense' as const, color: 'red' as const },
  ];

  const icons = {
    income: TrendingUp,
    expense: TrendingDown,
    balance: Wallet,
    savings: PiggyBank,
  };

  const colors = {
    green: 'text-green-500 bg-green-500/10',
    red: 'text-red-500 bg-red-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        return (
          <Card key={card.title}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[card.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
