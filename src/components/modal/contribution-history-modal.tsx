'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import type { Contribution } from '@/services/goal.service';
import { useI18n } from '@/components/i18n/i18n-provider';
import { goalService } from '@/services/goal.service';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContributionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  goalId: string;
  contributions: Contribution[];
  onContributionDeleted?: () => void;
  isLoading?: boolean;
}

export function ContributionHistoryModal({
  open,
  onOpenChange,
  goalName,
  goalId,
  contributions,
  onContributionDeleted,
  isLoading,
}: ContributionHistoryModalProps) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateLocale = mounted ? (typeof window !== 'undefined' ? localStorage.getItem('locale') || 'id-ID' : 'id-ID') : 'id-ID';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('goals.contributionHistory')} - {goalName}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">{t('common.loading')}</div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {t('goals.noContributions')}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{formatCurrency(Number(contribution.amount))}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(contribution.date).toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {contribution.note && (
                    <p className="text-xs text-muted-foreground mt-1">{contribution.note}</p>
                  )}
                </div>
                {contribution.type !== 'INITIAL' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Contribution?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ini akan menghapus contribution sebesar {formatCurrency(Number(contribution.amount))} dari {goalName}.
                          Budget transaksi juga akan di-refund.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await goalService.deleteContribution(goalId, contribution.id);
                              onContributionDeleted?.();
                            } catch (error) {
                              console.error('Failed to delete contribution:', error);
                            }
                          }}
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}