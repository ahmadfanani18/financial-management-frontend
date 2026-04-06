'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, Smartphone, TrendingUp } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'BANK' | 'EWALLET' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
  balance: number;
  currency: string;
  color: string;
  isArchived: boolean;
}

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

const mockAccounts: Account[] = [
  { id: '1', name: 'Bank BCA', type: 'BANK', balance: 5000000, currency: 'IDR', color: '#3B82F6', isArchived: false },
  { id: '2', name: 'GoPay', type: 'EWALLET', balance: 1500000, currency: 'IDR', color: '#10B981', isArchived: false },
  { id: '3', name: 'OVO', type: 'EWALLET', balance: 500000, currency: 'IDR', color: '#8B5CF6', isArchived: false },
  { id: '4', name: 'Tunai', type: 'CASH', balance: 200000, currency: 'IDR', color: '#F59E0B', isArchived: false },
  { id: '5', name: 'Kartu Kredit BRI', type: 'CREDIT_CARD', balance: -1500000, currency: 'IDR', color: '#EF4444', isArchived: false },
];

export default function AccountsPage() {
  const [accounts] = useState(mockAccounts);
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Akun</h1>
          <p className="text-muted-foreground">Kelola akun bank, e-wallet, dan cash Anda</p>
        </div>
        <Button>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map((account) => {
              const Icon = iconMap[account.type];
              return (
                <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {account.balance.toLocaleString('id-ID', { style: 'currency', currency: account.currency, minimumFractionDigits: 0 })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
