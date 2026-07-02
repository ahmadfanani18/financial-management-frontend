'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, Calendar, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, List, Wallet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { transactionService, Transaction, CreateTransactionInput } from '@/services/transaction.service';
import { accountService } from '@/services/account.service';
import { reportService } from '@/services/report.service';
import { TransactionForm } from '@/components/forms/transaction-form';
import { TransactionList, TransactionSummary, TransactionDetail } from '@/components/features/transactions';
import { useNotification } from '@/hooks/use-notification';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';
import { ReceiptWizardModal } from '@/components/receipt/wizard-modal';

export default function TransactionsPage() {
  const { t } = useI18n();
  const { notify } = useNotification();
  const { isHidden, toggle } = useAmountVisibility('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    transactionId: string | null;
  }>({ open: false, transactionId: null });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<{ amount?: number; description?: string } | undefined>();
  const itemsPerPage = 12;
  const queryClient = useQueryClient();

  const { data: transactionsData, isFetching, isRefetching } = useQuery({
    queryKey: ['transactions', { page: currentPage, limit: itemsPerPage, activeTab, searchQuery, selectedMonth, selectedYear, selectedAccountId }],
    queryFn: () =>
      transactionService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        type: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined,
        startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
        endDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`,
        accountId: selectedAccountId,
      }),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const { data: monthlySummary, isFetching: isSummaryFetching, isRefetching: isSummaryRefetching } = useQuery({
    queryKey: ['monthlySummary', selectedYear, selectedMonth, selectedAccountId],
    queryFn: () =>
      reportService.getMonthlyReport(selectedYear, selectedMonth, selectedAccountId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => transactionService.create(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionInput> }) =>
      transactionService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
  });

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const isLoading = isFetching;

  const downloadMutation = useMutation({
    mutationFn: () => reportService.downloadMonthlyTransactions(selectedYear, selectedMonth),
  });

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;

  const incomeCount = transactions.filter((t) => t.type === 'INCOME').length;
  const expenseCount = transactions.filter((t) => t.type === 'EXPENSE').length;
  const transferCount = transactions.filter((t) => t.type === 'TRANSFER').length;

  const handleSubmit = async (data: CreateTransactionInput) => {
    setFormError(undefined);
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, data });
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Transaksi berhasil dibuat');
      }
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', selectedYear, selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setIsFormOpen(false);
      setEditingTransaction(undefined);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Transaksi berhasil dihapus');
      setDeleteConfirm({ open: false, transactionId: null });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', selectedYear, selectedMonth] });
    } catch (err) {
      toast.error('Gagal menghapus transaksi');
    }
  };

  const handleDeleteClick = (transactionId: string) => {
    setDeleteConfirm({ open: true, transactionId });
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleDownload = () => {
    downloadMutation.mutate();
    toast.success('Laporan transaksi akan diunduh');
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
          <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
          <p className="text-muted-foreground">{t('transactions.manage')}</p>
        </div>
        <div className="flex items-center gap-2">
          <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
          <Button variant="outline" onClick={() => setIsWizardOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Nota
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('transactions.addTransaction')}
          </Button>
        </div>
      </div>

      <TransactionSummary
        totalIncome={monthlySummary?.report?.summary?.totalIncome || 0}
        totalExpense={monthlySummary?.report?.summary?.totalExpense || 0}
        totalTransfer={monthlySummary?.report?.summary?.totalTransfer || 0}
        balance={monthlySummary?.report?.summary?.balance}
        transactionCount={monthlySummary?.report?.transactions?.length || 0}
        isLoading={isSummaryFetching}
        isHidden={isHidden}
      />

      <div className="flex flex-col gap-4">
          <FilterTabs
            tabs={[
              {
                value: 'all',
                label: t('common.all'),
                icon: <List className="w-4 h-4" />,
              },
              {
                value: 'INCOME',
                label: t('transactions.income'),
                icon: <ArrowUpCircle className="w-4 h-4 text-emerald-500" />,
                count: incomeCount,
                badge: 'success',
              },
              {
                value: 'EXPENSE',
                label: t('transactions.expense'),
                icon: <ArrowDownCircle className="w-4 h-4 text-rose-500" />,
                count: expenseCount,
                badge: 'destructive',
              },
              {
                value: 'TRANSFER',
                label: t('transactions.transfer'),
                icon: <ArrowLeftRight className="w-4 h-4 text-blue-500" />,
                count: transferCount,
                badge: 'default',
              },
            ]}
            value={activeTab}
            onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1); }}
          />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('transactions.search')}
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

              <Select value={selectedAccountId || 'all'} onValueChange={(v) => { setSelectedAccountId(v === 'all' ? undefined : v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <Wallet className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Semua Akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Akun</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
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

        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleViewTransaction}
            isHidden={isHidden}
          />
        </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, transactionId: null })}
        onConfirm={() => {
          if (deleteConfirm.transactionId) {
            handleDelete(deleteConfirm.transactionId);
          }
        }}
        title={t('transactions.deleteTransaction')}
        description={t('transactions.deleteConfirm')}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {t('common.previous')}
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
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
            setPrefillData(undefined);
          }
        }}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
        prefillData={prefillData}
        isLoading={isFormLoading}
        error={formError}
      />

      <ReceiptWizardModal
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={(data) => {
          setPrefillData({ amount: data.total, description: data.description });
          setIsWizardOpen(false);
          setIsFormOpen(true);
        }}
      />

      <TransactionDetail
        transaction={selectedTransaction}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={(transaction) => {
          setIsDetailOpen(false);
          handleEdit(transaction);
        }}
      />
    </div>
  );
}
