'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/services/goal.service';
import { accountService } from '@/services/account.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { useI18n } from '@/components/i18n/i18n-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2 } from 'lucide-react';

const goalSchema = z.object({
  name: z.string().min(1, 'Nama target wajib diisi'),
  targetAmount: z.number().positive('Target harus positif'),
  deadline: z.string().min(1, 'Tanggal wajib diisi'),
  icon: z.string(),
  color: z.string(),
  linkedAccountId: z.string().optional(),
  createBudget: z.boolean().optional(),
  monthlyAmount: z.number().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => void;
  initialData?: { id: string } & Partial<GoalFormData>;
  isLoading?: boolean;
}

export function GoalForm({ open, onOpenChange, onSubmit, initialData, isLoading }: GoalFormProps) {
  const { t } = useI18n();
  const isEditing = !!initialData?.id;
  const [showBudgetOption, setShowBudgetOption] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<number>(0);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      deadline: '',
      icon: 'target',
      color: '#10B981',
      linkedAccountId: '',
      createBudget: false,
      monthlyAmount: 0,
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
    enabled: open,
  });

  const { data: goalData, isLoading: isLoadingGoal } = useQuery({
    queryKey: ['goalData', initialData?.id],
    queryFn: () => goalService.getById(initialData!.id),
    enabled: !!initialData?.id && open,
  });

  const showLoading = isLoadingGoal;

  useEffect(() => {
    if (!open) {
      setSelectedAccountId('');
      setInitialBalance(0);
      return;
    }

    if (isEditing && goalData) {
      form.reset({
        name: goalData.name || '',
        targetAmount: Number(goalData.targetAmount) || 0,
        deadline: goalData.deadline?.split('T')[0] || '',
        icon: goalData.icon || 'target',
        color: goalData.color || '#10B981',
        linkedAccountId: goalData.linkedAccountId || '',
        createBudget: false,
        monthlyAmount: 0,
      });
      if (goalData.linkedAccountId) {
        setSelectedAccountId(goalData.linkedAccountId);
        setInitialBalance(Number(goalData.currentAmount) || 0);
      }
    } else if (!isEditing) {
      form.reset({
        name: '',
        targetAmount: 0,
        deadline: '',
        icon: 'target',
        color: '#10B981',
        linkedAccountId: '',
        createBudget: false,
        monthlyAmount: 0,
      });
      setSelectedAccountId('');
      setInitialBalance(0);
    }
  }, [open, isEditing, goalData, form, accounts]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    form.setValue('linkedAccountId', accountId);
    const account = accounts.find(a => a.id === accountId);
    setInitialBalance(account ? Number(account.balance) : 0);
  };

  const handleClearAccount = () => {
    setSelectedAccountId('');
    form.setValue('linkedAccountId', '');
    setInitialBalance(0);
  };

  const handleBudgetToggle = (checked: boolean) => {
    form.setValue('createBudget', checked);
    setShowBudgetOption(checked);
  };

  const handleSubmit = (data: GoalFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('goals.editGoal') : t('goals.addGoal')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('goals.form.name')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="name" {...form.register('name')} placeholder={t('goals.form.sampleName')} />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">{t('goals.form.targetAmount')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Controller
                name="targetAmount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="targetAmount"
                    type="text"
                    placeholder={t('common.amountPlaceholder')}
                    value={field.value ? formatCurrency(field.value) : ''}
                    onChange={(e) => {
                      const parsed = parseCurrency(e.target.value);
                      field.onChange(parsed);
                    }}
                  />
                )}
              />
            </div>
            {form.formState.errors.targetAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">{t('goals.form.deadline')}</Label>
            <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
              <Skeleton className="h-10 w-full" />
            </div>
            <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
              <Input id="deadline" type="date" {...form.register('deadline')} />
            </div>
            {form.formState.errors.deadline && (
              <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-green-600" />
                <Label className="text-sm font-medium text-gray-800">Saldo Awal dari Akun</Label>
              </div>
              
              <div className="space-y-2">
                <div data-loading={showLoading} className="data-[loading=true]:block data-[loading=false]:hidden">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div data-loading={showLoading} className="data-[loading=true]:hidden data-[loading=false]:block">
                  <Select value={selectedAccountId} onValueChange={handleAccountChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih akun untuk saldo awal" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {formatCurrency(account.balance, account.currency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedAccountId && selectedAccount && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="text-xs text-gray-500">Initial Balance dari {selectedAccount.name}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(initialBalance)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Auto-terisi
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAccount}
                      className="text-xs text-muted-foreground hover:text-destructive underline"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createBudget"
                checked={form.watch('createBudget')}
                onCheckedChange={handleBudgetToggle}
              />
              <Label htmlFor="createBudget" className="text-sm font-medium">
                {t('goals.createMonthlyBudget')}
              </Label>
            </div>

            {showBudgetOption && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="monthlyAmount">{t('goals.form.monthlyAmount')}</Label>
                <Controller
                  name="monthlyAmount"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="monthlyAmount"
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
                <p className="text-xs text-muted-foreground">
                  {t('goals.budgetWillBeCreated')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading || showLoading}>
              {isLoading ? t('goals.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
