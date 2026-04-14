'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Account } from '@/services/account.service';
import { formatCurrency } from '@/lib/currency';
import { getAccountTypeLabel } from '@/lib/account';
import { AccountIcon } from './account-icon';
import { AccountActions } from './account-actions';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <AccountIcon type={account.type} color={account.color} />
          <div>
            <h3 className="font-semibold">{account.name}</h3>
            <Badge variant="secondary" className="text-xs mt-0.5">
              {getAccountTypeLabel(account.type)}
            </Badge>
          </div>
        </div>
        <AccountActions
          onEdit={() => onEdit(account)}
          onDelete={() => onDelete(account.id)}
        />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </CardContent>
    </Card>
  );
}
