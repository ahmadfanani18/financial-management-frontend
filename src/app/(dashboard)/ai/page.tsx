'use client';

import { Sparkles } from 'lucide-react';
import { PredictSpendingCard, SuggestSavingsCard, GeneratePlanForm } from '@/components/features/ai';

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Dapatkan rekomendasi keuangan berbasis AI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <GeneratePlanForm />
          <PredictSpendingCard />
        </div>
        <div className="space-y-6">
          <SuggestSavingsCard />

          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tips Keuangan
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Gunakan aturan 50/30/20 untuk mengalokasikan pendapatan</li>
              <li>• Prioritaskan dana darurat sebelum investasi</li>
              <li>• Review pengeluaran bulanan secara berkala</li>
              <li>• Otomatiskan menabung dengan standing instruction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}