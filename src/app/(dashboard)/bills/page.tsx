'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billService } from '@/services/bill.service';
import { BillFormModal } from '@/components/features/bills/bill-form-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/ui/motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function BillsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<string | null>(null);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => billService.getAll(),
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tagihan ini?')) return;
    await billService.delete(id);
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
  };

  const handleMarkPaid = async (id: string) => {
    await billService.markAsPaid(id);
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('bills.title')}</h1>
          <p className="text-muted-foreground">{t('bills.subtitle') || 'Kelola tagihan bulanan'}</p>
        </div>
        <Button onClick={() => { setEditingBill(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> {t('bills.addBill') || 'Tambah Tagihan'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('bills.noBills')}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 dark:bg-muted/20 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.name') || 'Nama'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.amount') || 'Jumlah'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.date') || 'Tanggal'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.mode') || 'Mode'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.account') || 'Akun'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.category') || 'Kategori'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('bills.status') || 'Status'}</th>
                <th className="text-left px-4 py-3 text-sm font-medium">{t('common.actions') || 'Aksi'}</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b border-border hover:bg-muted/30 dark:hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{bill.name}</td>
                  <td className="px-4 py-3">Rp {Number(bill.amount).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">{bill.executionDate} / {bill.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${bill.mode === 'AUTO_DEDUCT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                      {bill.mode === 'AUTO_DEDUCT' ? t('bills.auto') : t('bills.reminder')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{bill.account?.name}</td>
                  <td className="px-4 py-3">{bill.category?.name}</td>
                  <td className="px-4 py-3">
                    {bill.isActive ? (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">{t('bills.active') || 'Aktif'}</span>
                    ) : (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">{t('bills.inactive') || 'Nonaktif'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {bill.mode === 'REMINDER_ONLY' && bill.isActive && (
                        <Button size="sm" variant="ghost" onClick={() => handleMarkPaid(bill.id)}>
                          {t('bills.markAsPaid')}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setEditingBill(bill.id); setIsModalOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(bill.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BillFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        billId={editingBill}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bills'] });
          queryClient.invalidateQueries({ queryKey: ['bills', 'current-month'] });
        }}
      />
    </PageTransition>
  );
}
