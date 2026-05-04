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

const accountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi'),
  type: z.enum(['BANK', 'EWALLET', 'CASH', 'CREDIT_CARD', 'INVESTMENT']),
  balance: z.number(),
  currency: z.string(),
  icon: z.string(),
  color: z.string(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  initialData?: { id: string } & Partial<AccountFormData>;
  isLoading?: boolean;
}

export function AccountForm({ open, onOpenChange, onSubmit, initialData, isLoading }: AccountFormProps) {
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
      type: 'BANK',
      balance: 0,
      currency: 'IDR',
      icon: 'wallet',
      color: '#0EA5E9',
      ...initialData,
    },
  });

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
      return;
    }

    if (initialData?.id && accountData && !showLoading) {
      form.setValue('name', accountData.name || '');
      form.setValue('type', accountData.type || 'BANK');
      form.setValue('balance', Number(accountData.balance) || 0);
      form.setValue('currency', accountData.currency || 'IDR');
      form.setValue('icon', accountData.icon || 'wallet');
      form.setValue('color', accountData.color || '#0EA5E9');
    } else if (!initialData?.id && open) {
      form.reset({
        name: '',
        type: 'BANK',
        balance: 0,
        currency: 'IDR',
        icon: 'wallet',
        color: '#0EA5E9',
      });
    }
  }, [open, initialData, accountData, showLoading, form]);

  const handleSubmit = (data: AccountFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
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
          <DialogTitle>{isEditing ? 'Edit Akun' : 'Tambah Akun'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Akun</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="name" {...form.register('name')} placeholder="Bank BCA" />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Jenis Akun</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis akun" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Awal</Label>
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
                    placeholder="Rp 0"
                    value={field.value ? `Rp ${new Intl.NumberFormat('id-ID').format(Number(field.value) || 0)}` : 'Rp 0'}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(parseInt(num) || 0);
                    }}
                  />
                )}
              />
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
