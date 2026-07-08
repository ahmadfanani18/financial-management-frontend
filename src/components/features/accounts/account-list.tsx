'use client';

import { Account } from '@/services/account.service';
import { Wallet, Plus } from 'lucide-react';
import { AccountCard } from './account-card';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  isCreating?: boolean;
  isHidden?: boolean;
  onAddAccount?: () => void;
}

function AccountSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

function CreatingPlaceholder() {
  const { t } = useI18n();
  
  return (
    <div className="rounded-2xl bg-card border border-dashed border-border p-5 opacity-50">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 pt-2">
          <p className="font-semibold text-muted-foreground">{t('accounts.creatingAccount')}</p>
          <p className="text-sm text-muted-foreground">{t('accounts.savingData')}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-muted-foreground">Rp -</p>
    </div>
  );
}

export function AccountList({
  accounts,
  isLoading,
  onEdit,
  onDelete,
  isCreating,
  isHidden,
  onAddAccount,
}: AccountListProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <AccountSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="p-6 rounded-full bg-muted mb-4">
          <Wallet className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('accounts.noAccounts')}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {t('accounts.noAccountsDesc')}
        </p>
        {onAddAccount && (
          <button
            onClick={onAddAccount}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success hover:bg-success/90 text-success-foreground font-semibold transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t('accounts.emptyAddAccount')}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
          isHidden={isHidden}
        />
      ))}
      {isCreating && <CreatingPlaceholder />}
    </div>
  );
}
