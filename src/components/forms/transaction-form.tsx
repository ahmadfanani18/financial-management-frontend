'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Pilih akun'),
  categoryId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Jumlah harus positif'),
  description: z.string(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'TRANSFER') {
    return data.fromAccountId && data.toAccountId;
  }
  return true;
}, {
  message: 'Pilih akun pengirim dan penerima untuk transfer',
  path: ['fromAccountId'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: { id: string } & Partial<TransactionFormData>;
  isLoading?: boolean;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
}

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  accounts,
  categories
}: TransactionFormProps) {
  const isEditing = !!initialData?.id;

  const { data: transactionData, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ['transaction', initialData?.id],
    queryFn: () => transactionService.getById(initialData!.id),
    enabled: isEditing && open,
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: '',
      type: 'EXPENSE',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open && transactionData) {
      form.reset({
        accountId: transactionData.accountId || '',
        categoryId: transactionData.categoryId || '',
        type: transactionData.type || 'EXPENSE',
        amount: Number(transactionData.amount) || 0,
        description: transactionData.description || '',
        date: transactionData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        fromAccountId: transactionData.fromAccountId || '',
        toAccountId: transactionData.toAccountId || '',
      });
    } else if (open && !isEditing) {
      form.reset({
        accountId: '',
        type: 'EXPENSE',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, transactionData, isEditing, form]);

  const transactionType = form.watch('type');
  const filteredCategories = categories.filter(c => c.type === transactionType || transactionType === 'TRANSFER');

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const formatCurrencyInput = (value: number) => {
    if (!value || value === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    return parseInt(num) || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Akun</Label>
            <Select value={form.watch('accountId')} onValueChange={(v) => form.setValue('accountId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && (
              <p className="text-sm text-destructive">{form.formState.errors.accountId.message}</p>
            )}
          </div>

          {transactionType !== 'TRANSFER' && (
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.watch('categoryId') || ''} onValueChange={(v) => form.setValue('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="text"
                  placeholder="Rp 0"
                  value={formatCurrencyInput(field.value)}
                  onChange={(e) => {
                    const num = parseCurrencyInput(e.target.value);
                    field.onChange(num);
                  }}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input id="description" {...form.register('description')} placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" {...form.register('date')} />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading || isLoadingTransaction}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
