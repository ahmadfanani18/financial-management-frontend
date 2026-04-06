'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
  id: string;
  name: string;
  description: string;
  type: 'short_term' | 'medium_term' | 'long_term';
  startDate: string;
  endDate: string;
  milestones: { id: string; title: string; isCompleted: boolean; order: number }[];
}

const typeLabels = {
  short_term: 'Pendek (1-3 tahun)',
  medium_term: 'Sedang (3-5 tahun)',
  long_term: 'Panjang (5+ tahun)',
};

const typeColors = {
  short_term: 'bg-green-500/10 text-green-600',
  medium_term: 'bg-yellow-500/10 text-yellow-600',
  long_term: 'bg-blue-500/10 text-blue-600',
};

const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Dana Darurat',
    description: 'Membangun dana darurat 6 bulan pengeluaran',
    type: 'short_term',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    milestones: [
      { id: '1', title: 'Set up auto-debit bulanan', isCompleted: true, order: 0 },
      { id: '2', title: 'Kumpulkan 3 bulan pengeluaran', isCompleted: true, order: 1 },
      { id: '3', title: 'Kumpulkan 6 bulan pengeluaran', isCompleted: false, order: 2 },
    ],
  },
  {
    id: '2',
    name: 'Persiapan Pensiun',
    description: 'Memulai investasi jangka panjang untuk pensiun',
    type: 'long_term',
    startDate: '2026-01-01',
    endDate: '2046-12-31',
    milestones: [
      { id: '1', title: 'Pilih produk investasi', isCompleted: true, order: 0 },
      { id: '2', title: 'Set up recurring investment', isCompleted: false, order: 1 },
      { id: '3', title: 'Review portfolio yearly', isCompleted: false, order: 2 },
    ],
  },
];

export default function PlansPage() {
  const [plans] = useState(mockPlans);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">Rencana keuangan jangka panjang dengan milestones</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const completedMilestones = plan.milestones.filter((m) => m.isCompleted).length;
          const totalMilestones = plan.milestones.length;
          const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

          return (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[plan.type]}`}>
                      {typeLabels[plan.type]}
                    </span>
                    <span className="text-xs text-muted-foreground">{plan.startDate} - {plan.endDate}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{completedMilestones}/{totalMilestones}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
