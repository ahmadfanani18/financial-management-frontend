'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { categoryService, Category } from '@/services/category.service';
import { budgetService, Budget } from '@/services/budget.service';
import { Skeleton } from '@/components/ui/skeleton';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Pilih kategori'),
  amount: z.number().positive('Jumlah anggaran harus positif'),
  period: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM']),
  startDate: z.string().min(1, 'Tanggal wajib diisi'),
  endDate: z.string().optional(),
  warningThreshold: z.number(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BudgetFormData) => void;
  initialData?: Budget;
  isLoading?: boolean;
  error?: string;
}

const periodLabels: Record<string, string> = {
  MONTHLY: 'Bulanan',
  WEEKLY: 'Mingguan',
  YEARLY: 'Tahunan',
  CUSTOM: 'Kustom',
};

export function BudgetForm({ open, onOpenChange, onSubmit, initialData, isLoading, error }: BudgetFormProps) {
  const isEditing = !!initialData?.id;
  const [formKey, setFormKey] = useState(0);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', formKey],
    queryFn: () => categoryService.getAll(),
    enabled: open,
  });

  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: ['budget', initialData?.id, formKey],
    queryFn: async () => {
      const res = await budgetService.getById(initialData!.id);
      return res.budget;
    },
    enabled: isEditing && open,
  });

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
    }
  }, [open]);

  const showLoading = isLoadingCategories || isLoadingBudget;

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      period: 'MONTHLY' as const,
      startDate: new Date().toISOString().split('T')[0],
      warningThreshold: 80,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEditing && budgetData && !showLoading) {
      const amountVal = typeof budgetData.amount === 'string' ? parseInt(budgetData.amount) : (budgetData.amount || 0);
      form.setValue('categoryId', budgetData.categoryId || '');
      form.setValue('amount', amountVal);
      form.setValue('period', budgetData.period || 'MONTHLY');
      form.setValue('startDate', budgetData.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
      form.setValue('endDate', budgetData.endDate?.split('T')[0] || '');
      form.setValue('warningThreshold', budgetData.warningThreshold || 80);
    } else if (!isEditing && !showLoading) {
      form.reset({
        categoryId: '',
        amount: 0,
        period: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        warningThreshold: 80,
      });
    }
  }, [open, isEditing, budgetData, showLoading, form]);

  const formatCurrencyInput = (value: number) => {
    if (!value || value === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    return parseInt(num) || 0;
  };

  const handleSubmit = (data: BudgetFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const period = form.watch('period');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  const calculatedEndDate = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    switch (period) {
      case 'MONTHLY':
        return new Date(start.getFullYear(), start.getMonth() + 1, 0);
      case 'WEEKLY': {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return end;
      }
      case 'YEARLY': {
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        return end;
      }
      case 'CUSTOM':
        return endDate ? new Date(endDate) : null;
      default:
        return null;
    }
  }, [startDate, period, endDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select
                value={form.watch('categoryId')}
                onValueChange={(v) => form.setValue('categoryId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Anggaran</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
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
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Periode</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select value={form.watch('period')} onValueChange={(v) => form.setValue('period', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="startDate" type="date" {...form.register('startDate')} />
              {calculatedEndDate && (
                <div className="text-sm text-muted-foreground">
                  Periode: {period === 'CUSTOM' ? 'Kustom' : periodLabels[period]} ({new Date(startDate).toLocaleDateString('id-ID')} - {calculatedEndDate.toLocaleDateString('id-ID')})
                </div>
              )}
              {period === 'CUSTOM' && !endDate && (
                <div className="text-sm text-muted-foreground">
                  Untuk periode kustom, masukkan tanggal selesai
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading || showLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
