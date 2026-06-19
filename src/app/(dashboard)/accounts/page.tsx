'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountService, Account, CreateAccountInput } from '@/services/account.service';
import { AccountForm, type AccountFormData } from '@/components/forms/account-form';
import { AccountList, AccountSummary } from '@/components/features/accounts';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useI18n } from '@/components/i18n/i18n-provider';
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';

export default function AccountsPage() {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    accountId: string | null;
  }>({ open: false, accountId: null });
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, isFetching } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: totalBalance = 0, isFetching: isFetchingTotal } = useQuery({
    queryKey: ['totalBalance'],
    queryFn: () => accountService.getTotalBalance(),
  });

  const { data: editAccountData, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['account', editingAccount?.id],
    queryFn: () => accountService.getById(editingAccount!.id),
    enabled: !!editingAccount?.id && isFormOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAccountInput) => accountService.create(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAccountInput }) =>
      accountService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.delete(id),
  });

  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    
    if (activeTab === 'active') {
      filtered = filtered.filter((a) => !a.isArchived);
    } else {
      filtered = filtered.filter((a) => a.isArchived);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [accounts, activeTab, searchQuery]);

  const activeCount = accounts.filter((a) => !a.isArchived).length;
  const archivedCount = accounts.filter((a) => a.isArchived).length;

  const handleSubmit = async (data: AccountFormData) => {
    try {
      if (editingAccount) {
        await updateMutation.mutateAsync({ id: editingAccount.id, data: data as CreateAccountInput });
        toast.success('Akun berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(data as CreateAccountInput);
        toast.success('Akun berhasil dibuat');
      }
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
      setIsFormOpen(false);
      setEditingAccount(undefined);
    } catch (err) {
      toast.error('Gagal menyimpan akun');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Akun berhasil dihapus');
      setDeleteConfirm({ open: false, accountId: null });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
    } catch (err) {
      toast.error('Gagal menghapus akun');
    }
  };

  const handleDeleteClick = (accountId: string) => {
    setDeleteConfirm({ open: true, accountId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('accounts.title')}</h1>
          <p className="text-muted-foreground">{t('accounts.manage')}</p>
        </div>
        <div className="flex items-center gap-2">
          <AmountVisibilityToggle pageKey="accounts" />
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('accounts.addAccount')}
          </Button>
        </div>
      </div>

      <AccountSummary 
        totalBalance={totalBalance} 
        accountCount={activeCount}
        isLoading={isFetchingTotal}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
              <TabsTrigger value="active">
                {t('accounts.active')} ({activeCount})
              </TabsTrigger>
            </TabsList>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounts.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="active" className="mt-4">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isFetching}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isFetching}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, accountId: null })}
        onConfirm={() => {
          if (deleteConfirm.accountId) {
            handleDelete(deleteConfirm.accountId);
          }
        }}
        title={t('accounts.deleteAccount')}
        description={t('accounts.deleteConfirm')}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <AccountForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAccount(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editAccountData}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
