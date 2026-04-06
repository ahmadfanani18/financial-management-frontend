'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const accountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi'),
  type: z.enum(['BANK', 'EWALLET', 'CASH', 'CREDIT_CARD', 'INVESTMENT']),
  balance: z.number().default(0),
  currency: z.string().default('IDR'),
  icon: z.string().default('wallet'),
  color: z.string().default('#0EA5E9'),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  initialData?: Partial<AccountFormData>;
  isLoading?: boolean;
}

export function AccountForm({ open, onOpenChange, onSubmit, initialData, isLoading }: AccountFormProps) {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'BANK',
      balance: 0,
      currency: 'IDR',
      icon: 'wallet',
      color: '#0EA5E9',
      ...initialData,
    },
  });

  const handleSubmit = (data: AccountFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const typeLabels: Record<string, string> = {
    BANK: 'Bank',
    EWALLET: 'E-Wallet',
    CASH: 'Tunai',
    CREDIT_CARD: 'Kartu Kredit',
    INVESTMENT: 'Investasi',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Akun' : 'Tambah Akun'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Akun</Label>
            <Input id="name" {...form.register('name')} placeholder="Bank BCA" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Jenis Akun</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis akun" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Awal</Label>
            <Input 
              id="balance" 
              type="number"
              {...form.register('balance', { valueAsNumber: true })} 
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
