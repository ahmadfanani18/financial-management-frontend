'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtractedItem } from '@/types/receipt';

interface ConfirmationStepProps {
  items: ExtractedItem[];
  total: number;
  onComplete: () => void;
}

export function ConfirmationStep({ items, total, onComplete }: ConfirmationStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
        <h2 className="text-lg font-semibold">Berhasil!</h2>
        <p className="text-sm text-muted-foreground">
          Data nota berhasil diekstrak
        </p>
      </div>

      <div className="bg-muted rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Jumlah Item</span>
          <span className="font-medium">{items.length} item</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">Rp {formatCurrency(total)}</span>
        </div>
      </div>

      <Button onClick={onComplete} className="w-full">
        Buka Form Transaksi
      </Button>
    </div>
  );
}
