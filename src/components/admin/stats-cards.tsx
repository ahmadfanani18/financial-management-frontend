'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, CreditCard, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    pendingPayments: number;
    expiringSoon: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Free Users', value: stats.freeUsers, icon: Users, color: 'text-gray-500' },
    { title: 'Pro Users', value: stats.proUsers, icon: Crown, color: 'text-purple-500' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, color: 'text-yellow-500' },
    { title: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}