'use client';

import { useEffect } from 'react';
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
import { formatCurrency, parseCurrency } from '@/lib/currency';

const goalSchema = z.object({
  name: z.string().min(1, 'Nama target wajib diisi'),
  targetAmount: z.number().positive('Target harus positif'),
  deadline: z.string().min(1, 'Tanggal wajib diisi'),
  icon: z.string(),
  color: z.string(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => void;
  initialData?: Partial<GoalFormData>;
  isLoading?: boolean;
}

export function GoalForm({ open, onOpenChange, onSubmit, initialData, isLoading }: GoalFormProps) {
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

  useEffect(() => {
    if (open) {
      if (initialData?.targetAmount) {
        form.setValue('targetAmount', initialData.targetAmount);
      } else {
        form.setValue('targetAmount', 0);
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: GoalFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.name ? 'Edit Target' : 'Tambah Target Tabungan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Target</Label>
            <Input id="name" {...form.register('name')} placeholder="Dana Darurat" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Jumlah</Label>
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
            {form.formState.errors.targetAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Tanggal</Label>
            <Input id="deadline" type="date" {...form.register('deadline')} />
            {form.formState.errors.deadline && (
              <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
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