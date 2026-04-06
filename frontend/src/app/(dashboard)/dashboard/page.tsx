import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions';
import { SpendingChart } from '@/components/features/dashboard/spending-chart';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan keuangan Anda bulan ini</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Catat Transaksi
        </Button>
      </div>

      <SummaryCards />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTransactions />
        <SpendingChart />
      </div>
    </div>
  );
}
