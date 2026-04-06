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

const budgetSchema = z.object({
  categoryId: z.string().uuid('Pilih kategori'),
  amount: z.number().positive('Jumlah anggaran harus positif'),
  period: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY']).default('MONTHLY'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid').optional(),
  warningThreshold: z.number().default(80),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BudgetFormData) => void;
  initialData?: Partial<BudgetFormData>;
  isLoading?: boolean;
  categories: { id: string; name: string }[];
}

export function BudgetForm({ open, onOpenChange, onSubmit, initialData, isLoading, categories }: BudgetFormProps) {
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      warningThreshold: 80,
      ...initialData,
    },
  });

  const handleSubmit = (data: BudgetFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const periodLabels: Record<string, string> = {
    MONTHLY: 'Bulanan',
    WEEKLY: 'Mingguan',
    YEARLY: 'Tahunan',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={form.watch('categoryId')} onValueChange={(v) => form.setValue('categoryId', v)}>
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
            <Input id="amount" type="number" {...form.register('amount', { valueAsNumber: true })} />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
