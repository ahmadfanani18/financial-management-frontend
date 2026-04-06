'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: { name: string; color: string };
  account: { name: string };
}

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Gaji Bulanan', amount: 8000000, date: '2026-04-01', type: 'income', category: { name: 'Gaji', color: '#10B981' }, account: { name: 'Bank BCA' } },
  { id: '2', description: 'Makan Siang', amount: -45000, date: '2026-04-02', type: 'expense', category: { name: 'Makanan', color: '#F97316' }, account: { name: 'GoPay' } },
  { id: '3', description: 'Grab ke Kantor', amount: -25000, date: '2026-04-02', type: 'expense', category: { name: 'Transportasi', color: '#3B82F6' }, account: { name: 'OVO' } },
  { id: '4', description: 'Netflix', amount: -149000, date: '2026-04-03', type: 'expense', category: { name: 'Hiburan', color: '#EF4444' }, account: { name: 'Bank BCA' } },
  { id: '5', description: 'Freelance', amount: 2500000, date: '2026-04-04', type: 'income', category: { name: 'Gaji', color: '#10B981' }, account: { name: 'Bank BCA' } },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Kelola semua transaksi Anda</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {typeFilter !== 'all' && <Badge className="ml-2">{typeFilter === 'income' ? 'Masuk' : 'Keluar'}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="grid gap-2">
              <button onClick={() => setTypeFilter('all')} className={`px-3 py-2 text-sm rounded-md hover:bg-accent ${typeFilter === 'all' ? 'bg-accent' : ''}`}>Semua</button>
              <button onClick={() => setTypeFilter('income')} className={`px-3 py-2 text-sm rounded-md hover:bg-accent ${typeFilter === 'income' ? 'bg-accent' : ''}`}>Pemasukan</button>
              <button onClick={() => setTypeFilter('expense')} className={`px-3 py-2 text-sm rounded-md hover:bg-accent ${typeFilter === 'expense' ? 'bg-accent' : ''}`}>Pengeluaran</button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {filteredTransactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={tx.category.color}>{tx.category.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.category.name} • {tx.account.name} • {tx.date}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </p>
              <Badge variant={tx.type === 'income' ? 'success' : 'warning'} className="text-xs">
                {tx.type === 'income' ? 'Masuk' : 'Keluar'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
