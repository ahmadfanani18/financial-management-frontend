'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountService, Account, CreateAccountInput } from '@/services/account.service';
import { AccountForm, type AccountFormData } from '@/components/forms/account-form';
import { AccountList, AccountSummary } from '@/components/features/accounts';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function AccountsPage() {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isAmountHidden, setIsAmountHidden] = useState(false);
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
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('accounts.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('accounts.manage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAmountHidden(!isAmountHidden)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
          >
            {isAmountHidden ? (
              <>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tampilkan</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Sembunyikan</span>
              </>
            )}
          </button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('accounts.addAccount')}
          </Button>
        </div>
      </header>

      <AccountSummary 
        totalBalance={totalBalance} 
        accountCount={activeCount}
        isLoading={isFetchingTotal}
        isHidden={isAmountHidden}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-success data-[state=active]:text-white rounded-lg px-5 py-2.5"
            >
              {t('accounts.active')} 
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {activeCount}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="archived"
              className="data-[state=active]:bg-success data-[state=active]:text-white rounded-lg px-5 py-2.5"
            >
              Diarsipkan 
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted-foreground/20">
                {archivedCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounts.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-muted border-border"
            />
          </div>
        </div>

        <TabsContent value="active" className="mt-6">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isFetching}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isHidden={isAmountHidden}
            onAddAccount={() => setIsFormOpen(true)}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isFetching}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isHidden={isAmountHidden}
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
