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
}

const periodLabels: Record<string, string> = {
  MONTHLY: 'Bulanan',
  WEEKLY: 'Mingguan',
  YEARLY: 'Tahunan',
};

export function BudgetForm({ open, onOpenChange, onSubmit, initialData, isLoading }: BudgetFormProps) {
  const isEditing = !!initialData?.id;

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    enabled: open,
  });

  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: ['budget', initialData?.id],
    queryFn: async () => {
      const res = await budgetService.getById(initialData!.id);
      return res.budget;
    },
    enabled: isEditing && open,
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      warningThreshold: 80,
    },
  });

  useEffect(() => {
    if (open && budgetData) {
      form.reset({
        categoryId: budgetData.categoryId || '',
        amount: Number(budgetData.amount) || 0,
        period: budgetData.period || 'MONTHLY',
        startDate: budgetData.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: budgetData.endDate?.split('T')[0] || '',
        warningThreshold: budgetData.warningThreshold || 80,
      });
    } else if (open && !isEditing) {
      form.reset({
        categoryId: '',
        amount: 0,
        period: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        warningThreshold: 80,
      });
    }
  }, [open, budgetData, isEditing, form]);

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

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
        </DialogHeader>
        {isLoadingBudget && isEditing ? (
          renderSkeleton()
        ) : isLoadingCategories ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.watch('categoryId')}
                onValueChange={(v) => form.setValue('categoryId', v)}
                disabled={isEditing}
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

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Anggaran</Label>
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
              <Label>Periode</Label>
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

            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" {...form.register('startDate')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading || isLoadingBudget || isLoadingCategories}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
