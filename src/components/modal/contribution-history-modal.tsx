'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import type { Contribution } from '@/services/goal.service';

interface ContributionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  contributions: Contribution[];
  isLoading?: boolean;
}

export function ContributionHistoryModal({
  open,
  onOpenChange,
  goalName,
  contributions,
  isLoading,
}: ContributionHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Riwayat Kontribusi - {goalName}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Belum ada kontribusi
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
                    {new Date(contribution.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {contribution.note && (
                    <p className="text-xs text-muted-foreground mt-1">{contribution.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}