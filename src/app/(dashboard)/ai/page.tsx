'use client';

import { Sparkles } from 'lucide-react';
import { PredictSpendingCard, SuggestSavingsCard, GeneratePlanForm, SmartSaverCard } from '@/components/features/ai';
import { FeatureLock } from '@/components/subscription/feature-lock';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

export default function AIPage() {
  const { t } = useI18n();
  const { isHidden } = useAmountVisibility('ai');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('ai.title')}</h1>
        <p className="text-muted-foreground">
          {t('ai.subtitle')}
        </p>
      </div>

      <FeatureLock feature="aiTips">
        {/* Generate Plan - Full Width */}
        <GeneratePlanForm isHidden={isHidden} />

        {/* 2 Column Grid: Saran Tabungan, Prediksi Pengeluaran */}
        <div className="grid gap-6 md:grid-cols-2">
          <PredictSpendingCard />
          <SuggestSavingsCard />
        </div>

        <SmartSaverCard isHidden={isHidden} />

        {/* Tips Keuangan - Full Width di bawah */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t('ai.tipsTitle')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('ai.tips.1')}</li>
            <li>• {t('ai.tips.2')}</li>
            <li>• {t('ai.tips.3')}</li>
            <li>• {t('ai.tips.4')}</li>
          </ul>
        </div>
      </FeatureLock>
    </div>
  );
}