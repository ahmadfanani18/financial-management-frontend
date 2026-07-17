'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/report.service';
import { accountService } from '@/services/account.service';
import { MutationsSummary } from './mutations-summary';
import { MutationsTable } from './mutations-table';
import { toast } from 'sonner';

interface MutationsTabProps {
  isHidden?: boolean;
}

export function MutationsTab({ isHidden }: MutationsTabProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });

  const { data: mutationsData, isLoading, isFetching } = useQuery({
    queryKey: ['mutations', selectedAccountId, startDate, endDate, searchQuery, page],
    queryFn: () => reportService.getMutations({
      accountId: selectedAccountId,
      startDate,
      endDate,
      search: searchQuery || undefined,
      page,
      limit: 50,
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
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end p-4 bg-muted/50 dark:bg-zinc-800/50 rounded-xl">
        {isFetching && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-primary/30 overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}
        <div className="w-full md:w-[200px]">
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Akun</label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
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
            <Button key={p.label} variant="outline" size="sm" className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700" onClick={() => applyPreset(p.days)}>
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Dari</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Sampai</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700" />
          </div>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Cari</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari deskripsi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-card dark:bg-zinc-900 border-border dark:border-zinc-700"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!selectedAccountId || isFetching}
          className="bg-muted dark:bg-zinc-800 border-border dark:border-zinc-700"
        >
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
            isHidden={isHidden}
          />
          <MutationsTable transactions={mutationsData.transactions} isLoading={isLoading} isHidden={isHidden} />
          {mutationsData.pagination && mutationsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {mutationsData.pagination.page} dari {mutationsData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(mutationsData.pagination.totalPages, p + 1))}
                disabled={page === mutationsData.pagination.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}