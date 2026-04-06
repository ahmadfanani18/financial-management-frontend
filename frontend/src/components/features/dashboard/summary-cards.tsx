'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon: 'income' | 'expense' | 'balance' | 'savings';
  color: 'green' | 'red' | 'blue' | 'purple';
}

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

export function SummaryCards() {
  const cards: SummaryCardProps[] = [
    { title: 'Total Saldo', value: 'Rp 12.500.000', change: 5.2, icon: 'balance', color: 'blue' },
    { title: 'Pemasukan', value: 'Rp 8.000.000', change: 12.5, icon: 'income', color: 'green' },
    { title: 'Pengeluaran', value: 'Rp 3.500.000', change: -3.2, icon: 'expense', color: 'red' },
    { title: 'Tabungan', value: 'Rp 5.000.000', change: 8.1, icon: 'savings', color: 'purple' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        return (
          <Card key={card.title} className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`rounded-full p-2 ${colors[card.color]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold">{card.value}</span>
              {card.change !== undefined && (
                <span className={`ml-2 text-xs ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
