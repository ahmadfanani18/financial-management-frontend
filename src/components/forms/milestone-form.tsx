'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { useI18n } from '@/components/i18n/i18n-provider';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  targetAmount: z.number().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MilestoneFormData) => void;
  initialData?: Partial<MilestoneFormData>;
  isLoading?: boolean;
}

export function MilestoneForm({ open, onOpenChange, onSubmit, initialData, isLoading }: MilestoneFormProps) {
  const { t } = useI18n();
  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: '',
      ...initialData,
    },
  });

  const handleSubmit = (data: MilestoneFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? t('plans.editMilestone') : t('plans.addMilestone')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('plans.milestoneForm.title')}</Label>
            <Input id="title" {...form.register('title')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('plans.milestoneForm.description')}</Label>
            <Textarea id="description" {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">{t('plans.milestoneForm.targetDate')}</Label>
            <Input id="targetDate" type="date" {...form.register('targetDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">{t('plans.milestoneForm.targetAmount')}</Label>
            <Controller
              name="targetAmount"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="targetAmount"
                  type="text"
                  placeholder={t('common.amountPlaceholder')}
                  value={field.value ? formatCurrency(field.value) : ''}
                  onChange={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    field.onChange(parsed || undefined);
                  }}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('transactions.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
