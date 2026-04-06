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

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().default('tag'),
  color: z.string().default('#8B5CF6'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Partial<CategoryFormData>;
  isLoading?: boolean;
}

const colorPresets = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899', '#6B7280'];

export function CategoryForm({ open, onOpenChange, onSubmit, initialData, isLoading }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      icon: 'tag',
      color: '#8B5CF6',
      ...initialData,
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input id="name" {...form.register('name')} placeholder="Makanan" />
          </div>

          <div className="space-y-2">
            <Label>Jenis</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as 'INCOME' | 'EXPENSE')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${form.watch('color') === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color)}
                />
              ))}
            </div>
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
