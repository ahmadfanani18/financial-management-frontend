'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { transactionService, Transaction, CreateTransactionInput } from '@/services/transaction.service';
import { reportService } from '@/services/report.service';
import { TransactionForm } from '@/components/forms/transaction-form';
import { TransactionList, TransactionSummary } from '@/components/features/transactions';

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const itemsPerPage = 12;
  const queryClient = useQueryClient();

  const { data: transactionsData, isFetching, isRefetching } = useQuery({
    queryKey: ['transactions', { page: currentPage, limit: itemsPerPage }],
    queryFn: () =>
      transactionService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        type: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined,
      }),
  });

  const { data: monthlySummary, isFetching: isSummaryFetching, isRefetching: isSummaryRefetching } = useQuery({
    queryKey: ['monthlySummary', selectedYear, selectedMonth],
    queryFn: () =>
      reportService.getMonthlyReport(selectedYear, selectedMonth),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => transactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', selectedYear, selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', selectedYear, selectedMonth] });
    },
  });

  const isLoading = isFetching;

  const downloadMutation = useMutation({
    mutationFn: () => reportService.downloadMonthlyTransactions(selectedYear, selectedMonth),
  });

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.category?.name?.toLowerCase().includes(query) ||
          t.account?.name?.toLowerCase().includes(query)
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter((t) => t.type === activeTab);
    }

    return filtered;
  }, [transactions, searchQuery, activeTab]);

  const incomeCount = transactions.filter((t) => t.type === 'INCOME').length;
  const expenseCount = transactions.filter((t) => t.type === 'EXPENSE').length;
  const transferCount = transactions.filter((t) => t.type === 'TRANSFER').length;

  const handleSubmit = async (data: CreateTransactionInput) => {
    setFormError(undefined);
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingTransaction(undefined);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = [2024, 2025, 2026];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Kelola semua transaksi Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <TransactionSummary
        totalIncome={monthlySummary?.summary?.totalIncome || 0}
        totalExpense={monthlySummary?.summary?.totalExpense || 0}
        transactionCount={transactions.length}
        isLoading={isSummaryFetching}
      />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1); }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="INCOME">
              Pemasukan ({incomeCount})
            </TabsTrigger>
            <TabsTrigger value="EXPENSE">
              Pengeluaran ({expenseCount})
            </TabsTrigger>
            <TabsTrigger value="TRANSFER">
              Transfer ({transferCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
                <SelectTrigger className="w-[130px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                title="Download CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="INCOME" className="mt-4">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="EXPENSE" className="mt-4">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="TRANSFER" className="mt-4">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingTransaction(undefined);
            setFormError(undefined);
          }
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        initialData={editingTransaction}
        error={formError}
      />
    </div>
  );
}
