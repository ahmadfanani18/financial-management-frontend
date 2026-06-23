'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceData } from '@/services/report.service';

interface PerformanceChartProps {
  data: PerformanceData[];
  isLoading?: boolean;
}

export function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Nilai']} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}