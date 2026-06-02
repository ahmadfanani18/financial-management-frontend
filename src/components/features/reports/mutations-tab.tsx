'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/report.service';
import { accountService } from '@/services/account.service';
import { MutationsSummary } from './mutations-summary';
import { MutationsTable } from './mutations-table';
import { toast } from 'sonner';

export function MutationsTab() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });

  const { data: mutationsData, isLoading, isFetching } = useQuery({
    queryKey: ['mutations', selectedAccountId, startDate, endDate, searchQuery],
    queryFn: () => reportService.getMutations({
      accountId: selectedAccountId,
      startDate,
      endDate,
      search: searchQuery || undefined,
    }),
    enabled: !!selectedAccountId && !!startDate && !!endDate,
  });

  const handleDownload = async () => {
    if (!selectedAccountId) return;
    try {
      const response = await reportService.downloadMutations(selectedAccountId, startDate, endDate);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mutasi_${startDate}_${endDate}.csv`;
      a.click();
      toast.success('Laporan berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh laporan');
    }
  };

  const datePresets = [
    { label: '7 Hari', days: 7 },
    { label: '30 Hari', days: 30 },
    { label: 'Bulan Ini', days: 0 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    setEndDate(end.toISOString().split('T')[0]);
    if (days === 0) {
      const start = new Date();
      start.setDate(1);
      setStartDate(start.toISOString().split('T')[0]);
    } else {
      const start = new Date();
      start.setDate(start.getDate() - days);
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end">
        {isFetching && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-primary/30 overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}
        <div className="w-full md:w-[200px]">
          <label className="text-sm font-medium mb-1 block">Akun</label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih akun" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((acc: any) => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {datePresets.map(p => (
            <Button key={p.label} variant="outline" size="sm" onClick={() => applyPreset(p.days)}>
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Dari</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Sampai</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Cari</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder="Cari deskripsi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Button onClick={handleDownload} disabled={!selectedAccountId || isFetching}>
          {isFetching ? (
            <span className="animate-spin mr-2">⟳</span>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download CSV
        </Button>
      </div>

      {!selectedAccountId && (
        <div className="text-center py-12 text-muted-foreground">
          Pilih akun untuk melihat mutasi
        </div>
      )}

      {selectedAccountId && mutationsData && (
        <>
          <MutationsSummary
            totalIncome={mutationsData.totalIncome}
            totalExpense={mutationsData.totalExpense}
            totalTransfer={mutationsData.totalTransfer}
            startingBalance={mutationsData.startingBalance}
            endingBalance={mutationsData.endingBalance}
            isLoading={isLoading}
          />
          <MutationsTable transactions={mutationsData.transactions} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}