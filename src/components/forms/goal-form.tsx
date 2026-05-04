'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/services/goal.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

const goalSchema = z.object({
  name: z.string().min(1, 'Nama target wajib diisi'),
  targetAmount: z.number().positive('Target harus positif'),
  deadline: z.string().min(1, 'Tanggal wajib diisi'),
  icon: z.string(),
  color: z.string(),
  createBudget: z.boolean().optional(),
  monthlyAmount: z.number().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => void;
  initialData?: { id: string } & Partial<GoalFormData>;
  isLoading?: boolean;
}

export function GoalForm({ open, onOpenChange, onSubmit, initialData, isLoading }: GoalFormProps) {
  const isEditing = !!initialData?.id;
  const [formKey, setFormKey] = useState(0);

  const { data: goalData, isLoading: isLoadingGoal } = useQuery({
    queryKey: ['goal', initialData?.id, formKey],
    queryFn: () => goalService.getById(initialData!.id),
    enabled: isEditing && open,
  });

  const showLoading = isLoadingGoal;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      deadline: '',
      icon: 'target',
      color: '#10B981',
    },
  });

  const [showBudgetOption, setShowBudgetOption] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
      return;
    }

    if (isEditing && goalData && !showLoading) {
      form.setValue('name', goalData.name || '');
      form.setValue('targetAmount', Number(goalData.targetAmount) || 0);
      form.setValue('deadline', goalData.deadline?.split('T')[0] || '');
      form.setValue('icon', goalData.icon || 'target');
      form.setValue('color', goalData.color || '#10B981');
    } else if (!isEditing && open) {
      form.reset({
        name: '',
        targetAmount: 0,
        deadline: '',
        icon: 'target',
        color: '#10B981',
      });
    }
  }, [open, isEditing, goalData, showLoading, form]);

  const handleSubmit = (data: GoalFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Target' : 'Tambah Target Tabungan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Target</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="name" {...form.register('name')} placeholder="Dana Darurat" />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Jumlah</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Controller
                name="targetAmount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="targetAmount"
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
            {form.formState.errors.targetAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Tanggal</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="deadline" type="date" {...form.register('deadline')} />
            </div>
            {form.formState.errors.deadline && (
              <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
            )}
          </div>

          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createBudget"
                checked={form.watch('createBudget')}
                onCheckedChange={(checked) => {
                  form.setValue('createBudget', checked as boolean);
                  setShowBudgetOption(checked as boolean);
                }}
              />
              <Label htmlFor="createBudget" className="text-sm font-medium">
                Buat budget tabungan bulanan
              </Label>
            </div>

            {showBudgetOption && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="monthlyAmount">Jumlah per bulan</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  placeholder="Contoh: 500000"
                  {...form.register('monthlyAmount', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Budget ini akan dibuat untuk kategori "Tabungan - [nama goal]"
                </p>
              </div>
            )}
          </div>

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