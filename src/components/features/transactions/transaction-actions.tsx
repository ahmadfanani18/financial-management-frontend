'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TransactionActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionActions({ onEdit, onDelete }: TransactionActionsProps) {
  const { t } = useI18n();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">{t('transactions.actionMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          {t('transactions.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="dark:text-red-500 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('transactions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
