'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeReceipt } from '@/services/receipt.service';
import { ExtractedItem } from '@/types/receipt';

interface ReviewStepProps {
  imageBase64: string;
  onNext: (items: ExtractedItem[], total: number) => void;
  onBack: () => void;
}

export function ReviewStep({ imageBase64, onNext, onBack }: ReviewStepProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const extractData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeReceipt(imageBase64);
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        setError('Gagal menganalisis nota. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    extractData();
  }, [imageBase64]);

  const handleConfirm = () => {
    onNext(items, total);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Menganalisis nota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error}</p>
        </div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Upload Ulang
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Review Data</h2>
        <p className="text-sm text-muted-foreground">
          Periksa hasil ekstraksi data dari nota
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-right p-3 font-medium">Harga</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{item.name}</td>
                <td className="p-3 text-right">Rp {formatCurrency(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <Label htmlFor="total">Total</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rp</span>
          <Input
            id="total"
            type="text"
            value={formatCurrency(total)}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/\D/g, '')) || 0;
              setTotal(num);
            }}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Upload Ulang
        </Button>
        <Button onClick={handleConfirm}>
          Konfirmasi
        </Button>
      </div>
    </div>
  );
}
