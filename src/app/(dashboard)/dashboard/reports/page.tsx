'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reportService } from '@/services/report.service';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/currency';

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['monthlyReport', year, month],
    queryFn: () => reportService.getMonthlyReport(parseInt(year), parseInt(month)),
  });

  const { data: trends = [] } = useQuery({
    queryKey: ['trends'],
    queryFn: () => reportService.getTrends(6),
  });

  const { data: netWorth } = useQuery({
    queryKey: ['netWorth'],
    queryFn: () => reportService.getNetWorth(),
  });

  const downloadMutation = useMutation({
    mutationFn: () => reportService.downloadMonthlyTransactions(parseInt(year), parseInt(month)),
  });

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">Analisis keuangan Anda</p>
      </div>

      <div className="flex gap-4">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={downloadMutation.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(report?.summary?.totalIncome ?? 0) || 'Rp 0'}
          </p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(report?.summary?.totalExpense ?? 0) || 'Rp 0'}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tabungan</p>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(report?.summary?.balance ?? 0) || 'Rp 0'}
          </p>
        </div>
      </div>

      {reportLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {(report?.expenseByCategory?.length ?? 0) > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={report!.expenseByCategory} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={100} 
                        paddingAngle={2} 
                        dataKey="amount"
                        nameKey="name"
                      >
                        {report!.expenseByCategory!.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Tidak ada data pengeluaran
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tren Keuangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {trends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10B981" name="Pemasukan" />
                      <Line type="monotone" dataKey="expense" stroke="#EF4444" name="Pengeluaran" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Tidak ada data tren
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {netWorth && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Aset</p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(netWorth.totalAssets)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Liabilitas</p>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(netWorth.totalLiabilities)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Investasi</p>
              <p className="text-xl font-bold text-blue-500">
                {formatCurrency(netWorth.investments)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Net Worth</p>
              <p className="text-xl font-bold">
                {formatCurrency(netWorth.netWorth)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
