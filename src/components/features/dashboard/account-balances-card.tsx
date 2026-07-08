'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/account.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountBalancesCardProps {
  isHidden: boolean;
}

export function AccountBalancesCard({ isHidden }: AccountBalancesCardProps) {
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
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
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
            Akun Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Anda belum memiliki akun</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" />
          Akun Saya
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between">
            <span className="text-sm font-medium">{account.name}</span>
            <span className="text-sm font-semibold">
              {isHidden ? '••••••••' : `Rp ${account.balance.toLocaleString('id-ID')}`}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}