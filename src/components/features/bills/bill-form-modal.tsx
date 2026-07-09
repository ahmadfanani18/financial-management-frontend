'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billService } from '@/services/bill.service';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import type { CreateBillInput } from '@/types/bill';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';

interface BillFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId?: string | null;
  onSuccess: () => void;
}

export function BillFormModal({ open, onOpenChange, billId, onSuccess }: BillFormModalProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState('');
  const [formData, setFormData] = useState<CreateBillInput>({
    name: '',
    amount: '',
    amountType: 'FIXED',
    mode: 'AUTO_DEDUCT',
    dueDate: 20,
    executionDate: 19,
    accountId: '',
    categoryId: '',
    isActive: true,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  useEffect(() => {
    if (!open) {
      setAmountDisplay('');
      setFormData({
        name: '',
        amount: '',
        amountType: 'FIXED',
        mode: 'AUTO_DEDUCT',
        dueDate: 20,
        executionDate: 19,
        accountId: '',
        categoryId: '',
        isActive: true,
      });
    }
  }, [open]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const { data: bill, isLoading: isLoadingBill } = useQuery({
    queryKey: ['bills', billId],
    queryFn: async () => {
      if (!billId) return null;
      return billService.getById(billId);
    },
    enabled: !!billId,
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount,
        amountType: bill.amountType,
        mode: bill.mode,
        dueDate: bill.dueDate,
        executionDate: bill.executionDate,
        accountId: bill.accountId,
        categoryId: bill.categoryId,
        description: bill.description,
        isActive: bill.isActive,
      });
      setAmountDisplay(formatAmount(bill.amount));
    }
  }, [bill]);

  const formatAmount = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    if (!num || num === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
  };

  const parseAmount = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseAmount(raw);
    setFormData({ ...formData, amount: parsed });
    setAmountDisplay(formatAmount(parsed));
  };

  const handleAmountFocus = () => {
    if (formData.amount) {
      setAmountDisplay(formatAmount(formData.amount));
    }
  };

  const handleAmountBlur = () => {
    if (formData.amount) {
      setAmountDisplay(formatAmount(formData.amount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (billId) {
        await billService.update(billId, formData);
      } else {
        await billService.create(formData);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save bill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBill && billId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('bills.editBill')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{billId ? t('bills.editBill') : t('bills.addBill')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('bills.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('bills.namePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('bills.amountType')}</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.amountType === 'FIXED'}
                    onChange={() => setFormData({ ...formData, amountType: 'FIXED' })}
                  />
                  <span className="text-sm">{t('bills.fixed')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.amountType === 'VARIABLE'}
                    onChange={() => setFormData({ ...formData, amountType: 'VARIABLE' })}
                  />
                  <span className="text-sm">{t('bills.variable')}</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.amountType === 'FIXED'
                  ? t('bills.fixedDesc')
                  : t('bills.variableDesc')}
              </p>
            </div>
            <div>
              <Label>{t('bills.mode')}</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.mode === 'AUTO_DEDUCT'}
                    onChange={() => setFormData({ ...formData, mode: 'AUTO_DEDUCT' })}
                  />
                  <span className="text-sm">{t('bills.autoDeduct')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.mode === 'REMINDER_ONLY'}
                    onChange={() => setFormData({ ...formData, mode: 'REMINDER_ONLY' })}
                  />
                  <span className="text-sm">{t('bills.reminderOnly')}</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.mode === 'AUTO_DEDUCT'
                  ? t('bills.autoDeductDesc')
                  : t('bills.reminderOnlyDesc')}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">{t('bills.amount')}</Label>
            <Input
              id="amount"
              value={amountDisplay}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              placeholder={t('bills.amountPlaceholder')}
              required
            />
            {formData.amountType === 'VARIABLE' && (
              <p className="text-xs text-amber-600 mt-1 dark:text-amber-500">
                {t('bills.variableEstimateNote')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="executionDate">{t('bills.executionDate')}</Label>
              <select
                id="executionDate"
                className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-gray-900"
                value={String(formData.executionDate || '')}
                onChange={(e) => setFormData({ ...formData, executionDate: parseInt(e.target.value) })}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>{t('bills.dateOf', { date: d })}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dueDate">{t('bills.dueDate')}</Label>
              <select
                id="dueDate"
                className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-gray-900"
                value={String(formData.dueDate || '')}
                onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>{t('bills.dateOf', { date: d })}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountId">{t('bills.account')}</Label>
              <select
                id="accountId"
                className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-gray-900"
                value={formData.accountId || ''}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                <option value="">{t('bills.selectAccount')}</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="categoryId">{t('bills.category')}</Label>
              <select
                id="categoryId"
                className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-gray-900"
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">{t('bills.selectCategory')}</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('bills.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('bills.saving') : t('bills.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
