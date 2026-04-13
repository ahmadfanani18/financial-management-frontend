'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Utensils, Car, Home, Gamepad2, MoreHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Makanan': <Utensils className="h-4 w-4" />,
  'Belanja': <ShoppingBag className="h-4 w-4" />,
  'Transportasi': <Car className="h-4 w-4" />,
  'Rumah': <Home className="h-4 w-4" />,
  'Hiburan': <Gamepad2 className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  'Makanan': 'bg-orange-500/10 text-orange-500',
  'Belanja': 'bg-pink-500/10 text-pink-500',
  'Transportasi': 'bg-blue-500/10 text-blue-500',
  'Rumah': 'bg-green-500/10 text-green-500',
  'Hiburan': 'bg-purple-500/10 text-purple-500',
  'default': 'bg-muted text-muted-foreground',
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
  };
  const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
      <Card className="hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Transaksi Terbaru</CardTitle>
              <CardDescription>5 transaksi terakhir</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/transactions" className="gap-1">Lihat semua <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const icon = categoryIcons[transaction.category] || <MoreHorizontal className="h-4 w-4" />;
              const colorClass = categoryColors[transaction.category] || categoryColors.default;

              return (
                <motion.div key={transaction.id} variants={itemVariants} className={cn('flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-muted/50 group cursor-pointer')}>
                  <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110', colorClass)}>{icon}</div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="ghost" size="sm" className="font-normal">{transaction.category}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1 text-sm font-semibold', isIncome ? 'text-success' : 'text-destructive')}>
                    {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    {formatCurrency(transaction.amount)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3"><MoreHorizontal className="h-6 w-6 text-muted-foreground" /></div>
              <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
              <Button variant="outline" size="sm" className="mt-3">Tambah transaksi</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
