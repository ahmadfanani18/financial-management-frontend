'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PredictSpendingCard, SuggestSavingsCard, GeneratePlanForm, SmartSaverCard } from '@/components/features/ai';
// import { ChatTab } from '@/components/features/ai/chat/chat-tab';
import { FeatureLock } from '@/components/subscription/feature-lock';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

type Tab = 'features' | 'chat';

export default function AIPage() {
  const { t } = useI18n();
  const { isHidden } = useAmountVisibility('ai');
  const [activeTab, setActiveTab] = useState<Tab>('features');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('ai.title')}</h1>
        <p className="text-muted-foreground">
          {t('ai.subtitle')}
        </p>
      </div>

      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'features'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {t('ai.tabs.features')}
        </button>
        {/* <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {t('ai.tabs.chat')}
        </button> */}
      </div>

      {activeTab === 'features' ? (
        <FeatureLock feature="aiTips">
          <GeneratePlanForm isHidden={isHidden} />

          <div className="grid gap-6 md:grid-cols-2">
            <PredictSpendingCard />
            <SuggestSavingsCard />
          </div>

          <SmartSaverCard isHidden={isHidden} />

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
      ) : (
        // <ChatTab />
      )}
    </div>
  );
}