'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExtractedItem } from '@/types/receipt';
import { transactionService, CreateTransactionInput } from '@/services/transaction.service';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';

interface FormStepProps {
  items: ExtractedItem[];
  total: number;
  description: string;
  onBack: () => void;
  onComplete: () => void;
}

export function FormStep({ items, total, description, onBack, onComplete }: FormStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState(total);
  const [desc, setDesc] = useState(description);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deductGoals, setDeductGoals] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedAccountHasGoal = accounts.find(a => a.id === accountId)?.linkedGoalId;

  const formatCurrencyInput = (value: number) => {
    if (!value || value === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    return parseInt(num) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: CreateTransactionInput = {
        accountId,
        categoryId: categoryId || undefined,
        type,
        amount,
        description: desc,
        date,
        deductGoals: type === 'EXPENSE' ? deductGoals : false,
      };

      await transactionService.create(data);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
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

      <div className="border rounded-lg bg-muted/50">
        <button
          type="button"
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Item dari Nota</span>
            <span className="text-xs text-muted-foreground">({items.length} item)</span>
          </div>
          {showItems ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showItems && (
          <div className="border-t px-3 py-2 space-y-1 max-h-40 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="truncate flex-1 mr-2">{item.name}</span>
                <span className="font-mono whitespace-nowrap">Rp {item.price.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between font-semibold px-3 py-2 border-t bg-muted/30">
          <span>Total Nota</span>
          <span className="font-mono">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={(v) => setType(v as 'INCOME' | 'EXPENSE')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              <SelectItem value="INCOME">Pemasukan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Akun</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih akun" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah</Label>
        <Input
          id="amount"
          type="text"
          value={formatCurrencyInput(amount)}
          onChange={(e) => setAmount(parseCurrencyInput(e.target.value))}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Deskripsi transaksi"
        />
      </div>

      {type === 'EXPENSE' && selectedAccountHasGoal && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Checkbox
            id="deductGoals"
            checked={deductGoals}
            onCheckedChange={(checked) => setDeductGoals(!!checked)}
          />
          <Label htmlFor="deductGoals" className="font-normal cursor-pointer text-sm">
            Kurangi dari Goals
          </Label>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Kembali
        </Button>
        <Button type="submit" disabled={loading || !accountId || amount <= 0}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Transaksi
        </Button>
      </div>
    </form>
  );
}
