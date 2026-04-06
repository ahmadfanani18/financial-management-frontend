'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  categoryColor: string;
}

const transactions: Transaction[] = [
  { id: '1', description: 'Gaji Bulanan', category: 'Income', amount: 8000000, date: '2026-04-01', type: 'income', categoryColor: 'bg-green-500' },
  { id: '2', description: 'Makan Siang', category: 'Food', amount: -45000, date: '2026-04-02', type: 'expense', categoryColor: 'bg-orange-500' },
  { id: '3', description: 'Grab ke Kantor', category: 'Transport', amount: -25000, date: '2026-04-02', type: 'expense', categoryColor: 'bg-blue-500' },
  { id: '4', description: 'Netflix Subscription', category: 'Entertainment', amount: -149000, date: '2026-04-03', type: 'expense', categoryColor: 'bg-red-500' },
  { id: '5', description: 'Freelance Project', category: 'Income', amount: 2500000, date: '2026-04-04', type: 'income', categoryColor: 'bg-green-500' },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaksi Terbaru</CardTitle>
        <Badge variant="outline" className="text-xs">Lihat semua</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={tx.categoryColor}>
                {tx.category.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
            </div>
            <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
