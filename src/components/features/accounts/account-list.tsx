'use client';

import { Account } from '@/services/account.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { AccountCard } from './account-card';

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  isCreating?: boolean;
}

function AccountSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-6 w-24 rounded bg-muted mb-2" />
        <div className="h-4 w-16 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function CreatingPlaceholder() {
  return (
    <Card className="opacity-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Wallet className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-400">Membuat akun...</p>
            <p className="text-xs text-gray-400">Menyimpan data</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-gray-400">Rp -</p>
      </CardContent>
    </Card>
  );
}

export function AccountList({
  accounts,
  isLoading,
  onEdit,
  onDelete,
  isCreating,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <AccountSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Wallet className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Belum ada akun</p>
        <p className="text-sm">Tambahkan akun pertama Anda untuk mulai mencatat transaksi.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {isCreating && <CreatingPlaceholder />}
    </div>
  );
}
