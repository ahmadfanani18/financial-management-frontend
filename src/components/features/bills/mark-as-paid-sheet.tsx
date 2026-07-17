'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billService } from '@/services/bill.service';
import { accountService } from '@/services/account.service';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { useI18n } from '@/components/i18n/i18n-provider';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import type { Bill } from '@/types/bill';
import { AlertTriangle } from 'lucide-react';

interface MarkAsPaidSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}

export function MarkAsPaidSheet({ open, onOpenChange, bill }: MarkAsPaidSheetProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });

  const [createTransaction, setCreateTransaction] = useState(true);
  const [amount, setAmount] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrencyInput = (value: number) => {
    if (!value || value === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    return parseInt(num) || 0;
  };

  const resetForm = () => {
    if (bill) {
      setAmount(Number(bill.amount));
      setSelectedAccountId(bill.accountId);
    }
    setCreateTransaction(true);
  };

  if (open && bill && amount === 0 && selectedAccountId === '') {
    resetForm();
  }

  const handleSubmit = async () => {
    if (!bill) return;

    setIsSubmitting(true);
    try {
      const finalAmount = createTransaction ? String(amount || bill.amount) : undefined;
      await billService.markAsPaid(bill.id, finalAmount, createTransaction);

      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
      queryClient.invalidateQueries({ queryKey: ['bills', 'summary'] });

      if (createTransaction) {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      }

      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('bills.markPaidError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bill) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('bills.markAsPaid') || 'Tandai Lunas'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <p className="font-semibold text-lg">{bill.name}</p>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(bill.amount), 'IDR')}
            </p>
            <p className="text-sm text-muted-foreground">{bill.account?.name}</p>
          </div>

          {bill.mode === 'AUTO_DEDUCT' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                Bill ini akan dieksekusi otomatis pada tanggal pelaksanaan.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createTransaction"
              checked={createTransaction}
              onCheckedChange={(checked) => setCreateTransaction(checked as boolean)}
            />
            <Label htmlFor="createTransaction" className="text-sm font-normal">
              {t('bills.createTransactionAlso') || 'Buat transaksi juga'}
            </Label>
          </div>

          {createTransaction && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('bills.amount') || 'Jumlah'}</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyInput(amount)}
                    onChange={(e) => setAmount(parseCurrencyInput(e.target.value))}
                    placeholder={formatCurrencyInput(Number(bill.amount))}
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="account">{t('bills.account') || 'Akun'}</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bills.selectAccount') || 'Pilih akun'} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('common.loading') || 'Memuat...'
              : t('common.confirm') || 'Konfirmasi'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
