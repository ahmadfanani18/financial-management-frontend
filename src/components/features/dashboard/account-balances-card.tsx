'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/account.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';
import Link from 'next/link';

interface AccountBalancesCardProps {
  isHidden: boolean;
}

export function AccountBalancesCard({ isHidden }: AccountBalancesCardProps) {
  const { t } = useI18n();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" />
            {t('accountBalances.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('accountBalances.noAccounts')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" />
            {t('accountBalances.title')}
          </CardTitle>
          <Link href="/accounts" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-500">{account.name.substring(0, 3).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{account.name}</p>
                <p className="text-xs text-muted-foreground">
                  {account.accountNumber || `**** ${account.id.slice(-4)}`}
                </p>
              </div>
            </div>
            <span className="font-semibold text-sm">
              {isHidden ? '••••••••' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(account.balance)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
