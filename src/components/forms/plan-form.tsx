'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services/plan.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const planSchema = z.object({
  name: z.string().min(1, 'Nama rencana wajib diisi'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlanFormData) => void;
  initialData?: { id: string } & Partial<PlanFormData>;
  isLoading?: boolean;
}

export function PlanForm({ open, onOpenChange, onSubmit, initialData, isLoading }: PlanFormProps) {
  const isEditing = !!initialData?.id;
  const [formKey, setFormKey] = useState(0);

  const { data: planData, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['plan', initialData?.id, formKey],
    queryFn: () => planService.getById(initialData!.id),
    enabled: isEditing && open,
  });

  const showLoading = isLoadingPlan;

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      ...initialData,
    },
  });

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
      return;
    }

    if (isEditing && planData && !showLoading) {
      form.setValue('name', planData.name || '');
      form.setValue('description', planData.description || '');
      form.setValue('startDate', planData.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
      form.setValue('endDate', planData.endDate?.split('T')[0] || '');
    } else if (!isEditing && open) {
      form.reset({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    }
  }, [open, isEditing, planData, showLoading, form]);

  const handleSubmit = (data: PlanFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rencana' : 'Tambah Rencana Keuangan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Rencana</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="name" {...form.register('name')} placeholder="Liburan Keluarga" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-20 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Textarea id="description" {...form.register('description')} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                <Skeleton className="h-10 w-full" />
              </div>
              <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                <Input id="startDate" type="date" {...form.register('startDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                <Skeleton className="h-10 w-full" />
              </div>
              <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                <Input id="endDate" type="date" {...form.register('endDate')} />
              </div>
            </div>
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
