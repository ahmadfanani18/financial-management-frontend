'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { investmentService, type Holding, type CreateHoldingInput } from '@/services/investment.service';
import { accountService, type Account } from '@/services/account.service';
import { PortfolioSummary, HoldingsList, AddHoldingModal } from '@/components/features/investment';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

export default function InvestmentsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isHidden, toggle } = useAmountVisibility('investments');

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    holding: Holding | null;
  }>({ open: false, holding: null });

  const { data: accounts = [], isFetching: isFetchingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const investmentAccounts = useMemo(
    () => accounts.filter((a: Account) => a.type === 'INVESTMENT'),
    [accounts]
  );

  const currentAccount = useMemo(
    () => investmentAccounts.find((a: Account) => a.id === selectedAccountId),
    [investmentAccounts, selectedAccountId]
  );

  useEffect(() => {
    if (investmentAccounts.length === 1 && !selectedAccountId) {
      setSelectedAccountId(investmentAccounts[0].id);
    }
  }, [investmentAccounts, selectedAccountId]);

  const { data: portfolio, isFetching: isFetchingPortfolio } = useQuery({
    queryKey: ['investments', 'holdings', selectedAccountId],
    queryFn: () => investmentService.getHoldings(selectedAccountId!),
    enabled: !!selectedAccountId,
  });

  const isFetching = isFetchingAccounts || isFetchingPortfolio;

  const createMutation = useMutation({
    mutationFn: (data: CreateHoldingInput) => investmentService.createHolding(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { accountId: string; shares?: string; avgBuyPrice?: string } }) =>
      investmentService.updateHolding(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => investmentService.deleteHolding(id),
  });

  const handleAddAsset = () => {
    setEditingHolding(null);
    setIsModalOpen(true);
  };

  const handleEditHolding = (holding: Holding) => {
    setEditingHolding(holding);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (holding: Holding) => {
    setDeleteConfirm({ open: true, holding });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.holding) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.holding.id);
      toast.success(t('investment.holdingDeleted'));
      queryClient.invalidateQueries({ queryKey: ['investments', 'holdings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setDeleteConfirm({ open: false, holding: null });
    } catch {
      toast.error(t('investment.deleteFailed'));
    }
  };

  const handleSubmit = async (data: CreateHoldingInput) => {
    try {
      if (editingHolding) {
        await updateMutation.mutateAsync({ id: editingHolding.id, data });
        toast.success(t('investment.holdingUpdated'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('investment.holdingAdded'));
      }
      queryClient.invalidateQueries({ queryKey: ['investments', 'holdings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsModalOpen(false);
      setEditingHolding(null);
    } catch (err: any) {
      toast.error(err?.message || t('investment.saveFailed'));
    }
  };

  if (isFetchingAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="h-48 bg-card rounded-lg border animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (investmentAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-muted-foreground mb-4">{t('investment.noAccounts')}</p>
        <Button onClick={() => router.push('/accounts')}>
          {t('investment.goToAccounts')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('investment.title')}</h1>
          <p className="text-muted-foreground">{t('investment.subtitle')}</p>
        </div>
        <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
      </div>

      {investmentAccounts.length > 1 && (
        <div className="flex gap-2">
          {investmentAccounts.map((account: Account) => (
            <Button
              key={account.id}
              variant={selectedAccountId === account.id ? 'default' : 'outline'}
              onClick={() => setSelectedAccountId(account.id)}
            >
              {account.name}
            </Button>
          ))}
        </div>
      )}

      {selectedAccountId && (
        <>
          <PortfolioSummary
            totalPortfolioValue={portfolio ? Number(portfolio.totalPortfolioValue) : 0}
            totalUninvested={portfolio ? Number(portfolio.totalUninvested) : 0}
            totalHoldingsValue={portfolio ? Number(portfolio.totalHoldingsValue) : 0}
            totalPnL={portfolio ? Number(portfolio.totalPnL) : 0}
            isLoading={isFetching}
            isHidden={isHidden}
          />

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('investment.holdings')}</h2>
            <Button onClick={handleAddAsset}>
              <Plus className="mr-2 h-4 w-4" />
              {t('investment.addAsset')}
            </Button>
          </div>

          <HoldingsList
            holdings={portfolio?.holdings || []}
            isHidden={isHidden}
            isLoading={isFetching}
            onEdit={handleEditHolding}
            onDelete={handleDeleteClick}
          />
        </>
      )}

      <AddHoldingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingHolding ? {
          accountId: selectedAccountId!,
          symbol: editingHolding.symbol,
          shares: editingHolding.shares,
          avgBuyPrice: editingHolding.avgBuyPrice,
        } : { accountId: selectedAccountId! } as CreateHoldingInput}
        availableBalance={currentAccount ? Number(currentAccount.balance) : 0}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, holding: null })}
        onConfirm={handleDeleteConfirm}
        title={t('investment.deleteTitle')}
        description={t('investment.deleteConfirm')}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
