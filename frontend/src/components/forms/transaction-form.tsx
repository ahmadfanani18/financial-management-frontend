'use client';

import { useForm } from 'react-hook-form';
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

const transactionSchema = z.object({
  accountId: z.string().uuid('Pilih akun'),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Jumlah harus positif'),
  description: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  fromAccountId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
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
  initialData?: Partial<TransactionFormData>;
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
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: '',
      type: 'EXPENSE',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      ...initialData,
    },
  });

  const transactionType = form.watch('type');
  const filteredCategories = categories.filter(c => c.type === transactionType || transactionType === 'TRANSFER');

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
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
            <Input
              id="amount"
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="0"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
