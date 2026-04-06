'use client';

import { useForm } from 'react-hook-form';
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
      ...initialData,
    },
  });

  const handleSubmit = (data: GoalFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Target' : 'Tambah Target Tabungan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Target</Label>
            <Input id="name" {...form.register('name')} placeholder="Dana Darurat" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Jumlah</Label>
            <Input id="targetAmount" type="number" {...form.register('targetAmount', { valueAsNumber: true })} />
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
