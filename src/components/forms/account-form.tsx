'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/account.service';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';
import { Switch } from '@/components/ui/switch';
import { Lock } from 'lucide-react';

const accountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi'),
  accountNumber: z.string().optional(),
  type: z.enum(['BANK', 'EWALLET', 'CASH', 'CREDIT_CARD', 'INVESTMENT']),
  balance: z.number(),
  currency: z.string(),
  icon: z.string(),
  color: z.string(),
  isLocked: z.boolean(),
  lockedReason: z.string().nullable(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  initialData?: { id: string } & Partial<AccountFormData>;
  isLoading?: boolean;
}

export function AccountForm({ open, onOpenChange, onSubmit, initialData, isLoading }: AccountFormProps) {
  const { t } = useI18n();
  const isEditing = !!initialData?.id;
  const [formKey, setFormKey] = useState(0);

  const { data: accountData, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['account', initialData?.id, formKey],
    queryFn: () => accountService.getById(initialData!.id),
    enabled: !!initialData?.id && open,
  });

  const showLoading = isLoadingAccount;

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      accountNumber: '',
      type: 'BANK',
      balance: 0,
      currency: 'IDR',
      icon: 'wallet',
      color: '#0EA5E9',
      isLocked: false,
      lockedReason: null,
    },
  });

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
      return;
    }

    if (initialData?.id && accountData && !showLoading) {
      form.setValue('name', accountData.name || '');
      form.setValue('accountNumber', accountData.accountNumber || '');
      form.setValue('type', accountData.type || 'BANK');
      form.setValue('balance', Number(accountData.balance) || 0);
      form.setValue('currency', accountData.currency || 'IDR');
      form.setValue('icon', accountData.icon || 'wallet');
      form.setValue('color', accountData.color || '#0EA5E9');
      form.setValue('isLocked', !!accountData.isLocked);
      form.setValue('lockedReason', accountData.lockedReason || null);
    } else if (!initialData?.id && open) {
      form.reset({
        name: '',
        accountNumber: '',
        type: 'BANK',
        balance: 0,
        currency: 'IDR',
        icon: 'wallet',
        color: '#0EA5E9',
        isLocked: false,
        lockedReason: null,
      });
    }
  }, [open, initialData, accountData, showLoading, form]);

  const handleSubmit = (data: AccountFormData) => {
    onSubmit(data);
    form.reset();
  };

  const typeLabels: Record<string, string> = {
    BANK: 'Bank',
    EWALLET: 'E-Wallet',
    CASH: 'Tunai',
    CREDIT_CARD: 'Kartu Kredit',
    INVESTMENT: 'Investasi',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('accounts.editAccount') : t('accounts.addAccount')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('accounts.form.name')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="name" {...form.register('name')} placeholder={t('accounts.form.sampleName')} />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm dark:text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">{t('accounts.form.accountNumber') || 'Nomor Rekening'}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input
                id="accountNumber"
                {...form.register('accountNumber')}
                placeholder="Contoh: 1234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('accounts.form.type')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select
                value={form.watch('type')}
                onValueChange={(v) => form.setValue('type', v as 'BANK' | 'EWALLET' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('forms.selectAccountType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">{t('accounts.bank')}</SelectItem>
                  <SelectItem value="EWALLET">{t('accounts.ewallet')}</SelectItem>
                  <SelectItem value="CASH">{t('accounts.cash')}</SelectItem>
                  <SelectItem value="CREDIT_CARD">{t('accounts.creditCard')}</SelectItem>
                  <SelectItem value="INVESTMENT">{t('accounts.investment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.formState.errors.type && (
              <p className="text-sm dark:text-red-500">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">{t('accounts.form.balance')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Controller
                name="balance"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="balance"
                    type="text"
                    placeholder={t('common.amountPlaceholder')}
                    value={field.value ? `Rp ${new Intl.NumberFormat('id-ID').format(Number(field.value) || 0)}` : t('common.amountPlaceholder')}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(parseInt(num) || 0);
                    }}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-gray-800">Jangan Diganggu</p>
                <p className="text-xs text-gray-500">Akun ini tidak dihitung dalam AI suggestions</p>
              </div>
            </div>
            <Switch
              checked={form.watch('isLocked')}
              onCheckedChange={(checked) => form.setValue('isLocked', checked as boolean)}
            />
          </div>

          {form.watch('isLocked') && (
            <div className="space-y-2">
              <Label htmlFor="lockedReason">Alasan (opsional)</Label>
              <Input
                id="lockedReason"
                {...form.register('lockedReason')}
                onChange={(e) => form.setValue('lockedReason', e.target.value)}
                placeholder="Contoh: Tabungan Liburan"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading || showLoading}>
              {isLoading ? t('accounts.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
