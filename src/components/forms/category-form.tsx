'use client';

import { useEffect } from 'react';
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
  icon: z.string(),
  color: z.string(),
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
const iconPresets = ['🍔', '🚗', '🏠', '🛒', '💊', '✈️', '🎬', '📱', '💰', '🎓', '🎁', '⚽'];

export function CategoryForm({ open, onOpenChange, onSubmit, initialData, isLoading }: CategoryFormProps) {
  const isEditing = !!initialData?.name;
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      icon: '📁',
      color: '#8B5CF6',
      ...initialData,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: '', type: 'EXPENSE', icon: '📁', color: '#8B5CF6' });
      }
    }
  }, [open, isEditing, initialData, form]);

  const iconValue = form.watch('icon');
  const nameValue = form.watch('name');

  const getInitial = () => {
    if (nameValue?.trim()) {
      return nameValue.trim()[0].toUpperCase();
    }
    return '📁';
  };

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
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
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: form.watch('color') + '30' }}
              >
                {iconValue || getInitial()}
              </div>
              <div className="flex gap-1 flex-wrap max-w-[280px]">
                {iconPresets.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg ${form.watch('icon') === icon ? 'ring-2 ring-primary' : 'hover:bg-muted'}`}
                    onClick={() => form.setValue('icon', icon)}
                  >
                    {icon}
                  </button>
                ))}
                <button
                  type="button"
                  className={`w-8 h-8 rounded flex items-center justify-center text-lg ${!iconPresets.includes(iconValue as any) ? 'ring-2 ring-primary bg-muted' : 'hover:bg-muted'}`}
                  onClick={() => form.setValue('icon', getInitial())}
                  title="Huruf awal"
                >
                  {getInitial()}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${form.watch('color') === color ? 'border-black dark:border-white' : 'border-transparent'}`}
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
