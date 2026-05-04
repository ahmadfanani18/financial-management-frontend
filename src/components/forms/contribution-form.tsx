'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { accountService, Account } from '@/services/account.service';
import { categoryService, Category } from '@/services/category.service';

const contributionSchema = z.object({
  amount: z.number().positive('Jumlah harus positif'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  note: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContributionFormData) => void;
  isLoading?: boolean;
}

export function ContributionForm({ open, onOpenChange, onSubmit, isLoading }: ContributionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
      accountId: '',
      categoryId: '',
    },
  });

  useEffect(() => {
    if (open) {
      accountService.getAll().then(setAccounts).catch(console.error);
      categoryService.getAll().then((cats) => {
        const expenseCategories = cats.filter((c) => c.type === 'EXPENSE');
        setCategories(expenseCategories);
      }).catch(console.error);
    }
  }, [open]);

  const handleSubmit = (data: ContributionFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kontribusi</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Akun Pengeluaran</Label>
            <Select
              value={form.watch('accountId') || ''}
              onValueChange={(v) => form.setValue('accountId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(Number(account.balance))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <Select
              value={form.watch('categoryId') || ''}
              onValueChange={(v) => form.setValue('categoryId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="amount"
                  type="text"
                  placeholder="Rp 0"
                  value={field.value ? formatCurrency(field.value) : ''}
                  onChange={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    field.onChange(parsed);
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" {...form.register('date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Input id="note" {...form.register('note')} placeholder="Optional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading || !form.watch('accountId')}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}