'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Makanan', value: 1500000, color: '#F97316' },
  { name: 'Transportasi', value: 500000, color: '#3B82F6' },
  { name: 'Hiburan', value: 300000, color: '#EF4444' },
  { name: 'Belanja', value: 700000, color: '#8B5CF6' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">Analisis keuangan Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-500">Rp 35.000.000</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-500">Rp 15.000.000</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tabungan</p>
          <p className="text-2xl font-bold text-blue-500">Rp 20.000.000</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rata-rata pengeluaran bulanan</span>
              <span className="font-medium">Rp 2.500.000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Kategori terbesar</span>
              <span className="font-medium">Makanan (30%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tabungan rate</span>
              <span className="font-medium text-green-500">57%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
