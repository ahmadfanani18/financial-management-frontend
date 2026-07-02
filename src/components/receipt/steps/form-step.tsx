'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExtractedItem } from '@/types/receipt';

interface FormStepProps {
  items: ExtractedItem[];
  total: number;
  description: string;
  onBack: () => void;
  onSubmit: (data: { description: string; amount: number; type: string; categoryId: string; accountId: string; date: string }) => void;
}

export function FormStep({ items, total, description, onBack, onSubmit }: FormStepProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: description,
    amount: total,
    type: 'EXPENSE',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Buat Transaksi</h2>
        <p className="text-sm text-muted-foreground">
          Lengkapi detail transaksi dari nota
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Deskripsi transaksi"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipe</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div className="border rounded-lg p-3 bg-muted/50">
        <p className="text-sm font-medium mb-2">Item dari Nota:</p>
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-mono">Rp {item.price.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
          <span>Total</span>
          <span className="font-mono">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Transaksi
        </Button>
      </div>
    </form>
  );
}
