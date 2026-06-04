'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Akun wajib dipilih'),
  categoryId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Jumlah harus positif'),
  adminFee: z.number().min(0),
  description: z.string(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  deductGoals: z.boolean(),
}).refine((data) => {
  if (data.type === 'TRANSFER') {
    if (!data.fromAccountId || !data.toAccountId) return false;
    if (data.adminFee && data.amount && data.adminFee > data.amount) return false;
  }
  return true;
}, {
  message: 'Biaya admin tidak boleh lebih besar dari jumlah transfer',
  path: ['adminFee'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: { id: string } & Partial<TransactionFormData>;
  isLoading?: boolean;
  error?: string;
}

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  error,
}: TransactionFormProps) {
  const { t } = useI18n();
  const isEditing = !!initialData?.id;
  const [formKey, setFormKey] = useState(0);
  const [toAccountInfo, setToAccountInfo] = useState<{
    linkedGoalId?: string;
    linkedGoalName?: string;
    isLocked: boolean;
  } | null>(null);
  const [selectedAccountHasGoal, setSelectedAccountHasGoal] = useState(false);

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts', formKey],
    queryFn: () => accountService.getAll(),
    enabled: open,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', formKey],
    queryFn: () => categoryService.getAll(),
    enabled: open,
  });

  const { data: transactionData, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ['transaction', initialData?.id, formKey],
    queryFn: () => transactionService.getById(initialData!.id),
    enabled: isEditing && open,
  });

  useEffect(() => {
    if (!open) {
      setFormKey(k => k + 1);
    }
  }, [open]);

  const isLoadingDropdowns = isLoadingAccounts || isLoadingCategories;
  const isLoadingDetail = isEditing && isLoadingTransaction;
  const showLoading = isLoadingDropdowns || isLoadingDetail;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: '',
      type: 'EXPENSE',
      amount: 0,
      adminFee: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      deductGoals: false,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEditing && transactionData && !showLoading) {
      form.setValue('type', transactionData.type || 'EXPENSE');
      form.setValue('accountId', transactionData.accountId || '');
      form.setValue('amount', Number(transactionData.amount) || 0);
      form.setValue('adminFee', Number(transactionData.adminFee) || 0);
      form.setValue('description', transactionData.description || '');
      form.setValue('date', transactionData.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
      form.setValue('fromAccountId', transactionData.fromAccountId || '');
      form.setValue('toAccountId', transactionData.toAccountId || '');
      form.setValue('deductGoals', false);
      
      setTimeout(() => {
        form.setValue('categoryId', transactionData.categoryId || '');
      }, 0);
    } else if (!isEditing && !isLoadingDropdowns) {
      form.setValue('accountId', '');
      form.setValue('type', 'EXPENSE');
      form.setValue('amount', 0);
      form.setValue('description', '');
      form.setValue('date', new Date().toISOString().split('T')[0]);
    }
  }, [open, isEditing, transactionData, showLoading, isLoadingDropdowns, form]);

  const transactionType = form.watch('type');
  const toAccountId = form.watch('toAccountId');
  const amount = form.watch('amount');
  const filteredCategories = categories.filter(c => c.type === transactionType || transactionType === 'TRANSFER');

  useEffect(() => {
    if (toAccountId && transactionType === 'TRANSFER') {
      const account = accounts.find(a => a.id === toAccountId);
      if (account?.linkedGoalId) {
        setToAccountInfo({
          linkedGoalId: account.linkedGoalId,
          isLocked: account.isLocked || false,
          linkedGoalName: 'Goal',
        });
      } else {
        setToAccountInfo(null);
      }
    } else {
      setToAccountInfo(null);
    }
  }, [toAccountId, transactionType, accounts]);

  const accountId = form.watch('accountId');

  useEffect(() => {
    if (accountId && transactionType === 'EXPENSE') {
      const account = accounts.find(a => a.id === accountId);
      setSelectedAccountHasGoal(!!account?.linkedGoalId);
    } else {
      setSelectedAccountHasGoal(false);
    }
  }, [accountId, transactionType, accounts]);

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset({
      accountId: '',
      type: 'EXPENSE',
      amount: 0,
      adminFee: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      deductGoals: false,
    });
  };

  const formatCurrencyInput = (value: number) => {
    if (!value || value === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    return parseInt(num) || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('transactions.editTransaction') : t('transactions.addTransaction')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('transactions.transactionType')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">{t('transactions.income')}</SelectItem>
                  <SelectItem value="EXPENSE">{t('transactions.expense')}</SelectItem>
                  <SelectItem value="TRANSFER">{t('transactions.transfer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('transactions.account')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Select 
                  value={form.getValues('accountId') || form.watch('accountId') || ''} 
                  onValueChange={(v) => form.setValue('accountId', v)}
                >
                <SelectTrigger>
                  <SelectValue placeholder={t('transactions.selectAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.accountId && (
                <p className="text-sm text-destructive">{form.formState.errors.accountId.message}</p>
              )}
            </div>
          </div>

          {transactionType !== 'TRANSFER' && (
            <div className="space-y-2">
              <Label>{t('transactions.category')}</Label>
              <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                <Skeleton className="h-10 w-full" />
              </div>
              <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                <Select 
                  value={form.getValues('categoryId') || form.watch('categoryId') || ''} 
                  onValueChange={(v) => form.setValue('categoryId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('transactions.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {transactionType === 'TRANSFER' && (
            <>
              <div className="space-y-2">
                <Label>{t('transactions.fromAccount')}</Label>
                <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                  <Select 
                    value={form.getValues('fromAccountId') || form.watch('fromAccountId') || ''} 
                    onValueChange={(v) => form.setValue('fromAccountId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('transactions.selectAccount')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.fromAccountId && (
                    <p className="text-sm text-destructive">{form.formState.errors.fromAccountId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('transactions.toAccount')}</Label>
                <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                  <Select 
                    value={form.getValues('toAccountId') || form.watch('toAccountId') || ''} 
                    onValueChange={(v) => form.setValue('toAccountId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('transactions.selectAccount')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {toAccountInfo && toAccountInfo.isLocked && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <span>🎯</span>
                      <span>
                        <strong>Rp {new Intl.NumberFormat('id-ID').format(amount || 0)}</strong> akan otomatis 
                        ditambahkan ke goal saat transfer selesai
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('transactions.amount')}</Label>
                <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                  <Controller
                    name="amount"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="amount"
                        type="text"
                        placeholder={t('common.amountPlaceholder')}
                        value={formatCurrencyInput(field.value)}
                        onChange={(e) => {
                          const num = parseCurrencyInput(e.target.value);
                          field.onChange(num);
                        }}
                      />
                    )}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminFee">Biaya Admin</Label>
                <Controller
                  name="adminFee"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="adminFee"
                      type="text"
                      placeholder="Rp 0"
                      value={field.value ? formatCurrencyInput(field.value) : ''}
                      onChange={(e) => {
                        const num = parseCurrencyInput(e.target.value);
                        field.onChange(num);
                      }}
                    />
                  )}
                />
                {form.formState.errors.adminFee && (
                  <p className="text-sm text-destructive">{form.formState.errors.adminFee.message}</p>
                )}
              </div>

              {form.watch('adminFee') > 0 && (
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Jumlah Transfer</span>
                    <span>{formatCurrencyInput(form.watch('amount') || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Biaya Admin</span>
                    <span>{formatCurrencyInput(form.watch('adminFee') || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <span>Total Debit</span>
                    <span>
                      {formatCurrencyInput(
                        (form.watch('amount') || 0) + (form.watch('adminFee') || 0)
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Penerima akan menerima {formatCurrencyInput(form.watch('amount') || 0)}
                  </p>
                </div>
              )}
            </>
          )}

          {transactionType !== 'TRANSFER' && (
            <div className="space-y-2">
              <Label htmlFor="amount">{t('transactions.amount')}</Label>
              <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                <Skeleton className="h-10 w-full" />
              </div>
              <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                <Controller
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="amount"
                      type="text"
                      placeholder={t('common.amountPlaceholder')}
                      value={formatCurrencyInput(field.value)}
                      onChange={(e) => {
                        const num = parseCurrencyInput(e.target.value);
                        field.onChange(num);
                      }}
                    />
                  )}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
            </div>
          )}

          {transactionType === 'EXPENSE' && selectedAccountHasGoal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="deductGoals"
                  checked={form.watch('deductGoals')}
                  onCheckedChange={(checked) => form.setValue('deductGoals', !!checked)}
                />
                <Label htmlFor="deductGoals" className="font-normal cursor-pointer">
                  Kurangi dari Goals (untuk transaksi pinjam/meminjamkan)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Aktifkan jika transaksi ini mengurangi total tabungan Anda
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">{t('transactions.description')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="description" {...form.register('description')} placeholder={t('common.optional')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t('forms.date')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="date" type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading || showLoading}>
              {isLoading ? t('transactions.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}