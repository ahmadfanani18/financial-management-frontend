'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { transactionService, Transaction, CreateTransactionInput } from '@/services/transaction.service';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { TransactionForm } from '@/components/forms/transaction-form';

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll({
      type: filters.type === 'all' ? undefined : filters.type as 'INCOME' | 'EXPENSE',
      search: filters.search,
    }),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => transactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const handleSubmit = async (data: CreateTransactionInput) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const transactions = transactionsData?.transactions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Kelola semua transaksi Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="INCOME">Pemasukan</SelectItem>
            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada transaksi.</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarFallback style={{ backgroundColor: tx.category?.color || '#ccc' }}>
                  {tx.category?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.category?.name || 'Tanpa kategori'} • {tx.account?.name || 'Tanpa akun'} • {tx.date}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : ''}{tx.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
                <Badge variant={tx.type === 'INCOME' ? 'success' : 'warning'} className="text-xs">
                  {tx.type === 'INCOME' ? 'Masuk' : tx.type === 'EXPENSE' ? 'Keluar' : 'Transfer'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        accounts={accounts.map(a => ({ id: a.id, name: a.name }))}
        categories={categories.map(c => ({ id: c.id, name: c.name, type: c.type }))}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
