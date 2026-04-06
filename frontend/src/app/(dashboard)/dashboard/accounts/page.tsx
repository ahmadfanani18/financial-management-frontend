'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, Smartphone, TrendingUp } from 'lucide-react';
import { accountService, Account, CreateAccountInput } from '@/services/account.service';
import { AccountForm } from '@/components/forms/account-form';

const iconMap = {
  BANK: Banknote,
  EWALLET: Smartphone,
  CASH: Wallet,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
};

const typeLabels = {
  BANK: 'Bank',
  EWALLET: 'E-Wallet',
  CASH: 'Tunai',
  CREDIT_CARD: 'Kartu Kredit',
  INVESTMENT: 'Investasi',
};

export default function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAccountInput) => accountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
    },
  });

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  const handleSubmit = async (data: CreateAccountInput) => {
    if (editingAccount) {
      await accountService.update(editingAccount.id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingAccount(undefined);
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus akun ini?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Akun</h1>
          <p className="text-muted-foreground">Kelola akun bank, e-wallet, dan cash Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      <div className="bg-primary/10 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Total Saldo</p>
        <p className="text-3xl font-bold">{totalBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Aktif ({activeAccounts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : activeAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada akun. Tambahkan akun pertama Anda.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeAccounts.map((account) => {
                const Icon = iconMap[account.type];
                return (
                  <Card 
                    key={account.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEdit(account)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: account.color + '20' }}>
                          <Icon className="h-5 w-5" style={{ color: account.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">{typeLabels[account.type]}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-bold">
                          {account.balance.toLocaleString('id-ID', { style: 'currency', currency: account.currency, minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(account.id);
                        }}
                      >
                        Hapus
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AccountForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAccount(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingAccount}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
