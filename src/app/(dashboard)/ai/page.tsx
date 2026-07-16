'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, PiggyBank, Target, Loader2, AlertCircle, CheckCircle2, History, Plus, DollarSign, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FeatureLock } from '@/components/subscription/feature-lock';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';
import { aiService, PredictSpendingResponse, SpendingPrediction, SuggestSavingsResponse, SmartSaverResult, SmartSaverSuggestion, SmartSaverOption, GeneratePlanResponse } from '@/services/ai.service';
import { planService } from '@/services/plan.service';
import { ChatTab } from '@/components/features/ai/chat/chat-tab';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';

type Tab = 'features' | 'chat';

function LoadingDots() {
  return (
    <span className="flex gap-1">
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

function formatCurrencyID(amount: number): string {
  return amount.toLocaleString('id-ID');
}

function getTrendIcon(trend: string) {
  if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

function getConfidenceBadge(confidence: string) {
  if (confidence === 'high') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
  if (confidence === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getFeasibilityStyle(feasibility: string) {
  switch (feasibility) {
    case 'safe': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800';
    case 'tight': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800';
    case 'aggressive': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
    default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

export default function AIPage() {
  const { t } = useI18n();
  const router = useRouter();
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
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all duration-200 ${
            activeTab === 'features'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {t('ai.tabs.features')}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all duration-200 ${
            activeTab === 'chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {t('ai.tabs.chat')}
        </button>
      </div>

      {activeTab === 'features' ? (
        <FeatureLock feature="aiTips">
          <GeneratePlanSection isHidden={isHidden} />
          <div className="grid gap-6 md:grid-cols-2">
            <PredictSpendingSection />
            <SuggestSavingsSection />
          </div>
          <SmartSaverSection isHidden={isHidden} />
          <TipsSection />
        </FeatureLock>
      ) : (
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <ChatTab />
        </div>
      )}
    </div>
  );
}

function GeneratePlanSection({ isHidden }: { isHidden?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [data, setData] = useState<GeneratePlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [monthlyIncomeRaw, setMonthlyIncomeRaw] = useState<number>(0);
  const [dependents, setDependents] = useState<number>(0);
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!monthlyIncomeRaw || monthlyIncomeRaw <= 0) {
      setError(t('ai.invalidIncome'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setData(null);
    setSelectedMilestones(new Set());

    const generatePromise = aiService.generatePlan({
      monthlyIncome: monthlyIncomeRaw,
      currency: 'IDR',
      dependents: dependents,
    });
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [result] = await Promise.all([generatePromise, delayPromise]);
      setData(result);
      setSelectedMilestones(new Set(result.milestones.map(m => m.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = (id: string) => {
    const newSelected = new Set(selectedMilestones);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMilestones(newSelected);
  };

  const handleCreatePlan = async () => {
    if (!data) return;

    setIsCreating(true);
    setError(null);
    try {
      const plan = await planService.create({
        name: `Rencana Keuangan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
        description: data.message,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      const selectedMs = data.milestones.filter(m => selectedMilestones.has(m.id));
      for (const milestone of selectedMs) {
        await planService.addMilestone(plan.id, {
          title: milestone.title,
          description: milestone.description,
          targetDate: new Date(milestone.targetDate).toISOString().split('T')[0],
          targetAmount: milestone.targetAmount,
        });
      }

      router.push('/plans');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          {t('ai.generatePlanTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="monthlyIncome">{t('ai.form.monthlyIncome')}</Label>
            <Input
              id="monthlyIncome"
              type="text"
              placeholder={t('common.amountPlaceholder')}
              value={monthlyIncomeRaw ? formatCurrency(monthlyIncomeRaw, 'IDR', { isHidden }) : ''}
              onChange={(e) => setMonthlyIncomeRaw(parseCurrency(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dependents">{t('ai.form.dependents')}</Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              value={dependents}
              onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <LoadingDots />
                  {t('ai.aiAnalyzing')}
                </span>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('ai.generatePlanButton')}
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">{t('ai.needs')}</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrencyID(data.summary.needs)}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">{t('ai.wants')}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrencyID(data.summary.wants)}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">{t('ai.savings')}</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyID(data.summary.savings)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">{t('ai.selectMilestone')}</p>
              {data.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 p-3 border rounded-xl transition-colors hover:border-primary/30"
                >
                  <Checkbox
                    checked={selectedMilestones.has(milestone.id)}
                    onCheckedChange={() => toggleMilestone(milestone.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    <p className="text-sm font-semibold mt-1 text-primary">
                      {t('ai.target')} {formatCurrencyID(milestone.targetAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCreatePlan}
              disabled={isCreating || selectedMilestones.size === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('ai.creatingPlan')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('ai.createPlanButton')} ({selectedMilestones.size})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PredictSpendingSection() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PredictSpendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);

    const predictPromise = aiService.predictSpending({ months: 3 });
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [result] = await Promise.all([predictPromise, delayPromise]);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const recurringPredictions = data?.predictions.filter(p => p.expenseType === 'recurring') ?? [];
  const occasionalPredictions = data?.predictions.filter(p => p.expenseType === 'occasional') ?? [];

  return (
    <Card className="transition-shadow duration-300 hover:shadow-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t('ai.predictSpendingTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handlePredict} disabled={isLoading} className="w-full">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LoadingDots />
              {t('ai.aiAnalyzing')}
            </span>
          ) : (
            t('ai.predictSpendingButton')
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {data.insufficientDataMonths && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {data.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">{t('ai.predicted')}</p>
                <p className="text-sm font-bold">{formatCurrencyID(data.totalPredicted)}</p>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">{t('ai.budget')}</p>
                <p className="text-sm font-bold">{formatCurrencyID(data.totalBudget)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">{t('ai.spent')}</p>
                <p className="text-sm font-bold">{formatCurrencyID(data.totalSpent)}</p>
              </div>
            </div>

            {data.insufficientData ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm rounded-xl">
                {data.message}
              </div>
            ) : (
              <div className="space-y-4">
                {recurringPredictions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recurring</p>
                    <div className="space-y-2">
                      {recurringPredictions.slice(0, 5).map((pred) => (
                        <div
                          key={pred.category}
                          className={`flex items-center justify-between p-2.5 border rounded-xl transition-colors ${
                            pred.isOverBudget ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {getTrendIcon(pred.trend ?? 'stable')}
                            <span className="text-sm font-medium">{pred.category}</span>
                            {pred.isOverBudget && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">{t('ai.overBudget')}</span>
                            )}
                            {pred.trend && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getConfidenceBadge(pred.confidence)}`}>
                                {pred.confidence}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {pred.expenseType === 'occasional' ? '-' : formatCurrencyID(pred.predictedAmount)}
                            </p>
                            {pred.budgetLimit && (
                              <p className="text-xs text-muted-foreground">Budget: {formatCurrencyID(pred.budgetLimit)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {occasionalPredictions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Occasional <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full ml-1">Jarang-jarang</span>
                    </p>
                    <div className="space-y-2">
                      {occasionalPredictions.slice(0, 5).map((pred) => (
                        <div
                          key={pred.category}
                          className="flex items-center justify-between p-2.5 border rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{pred.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrencyID(pred.currentAverage)}</p>
                            <p className="text-xs text-muted-foreground">Avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestSavingsSection() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SuggestSavingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);

    const suggestPromise = aiService.suggestSavings();
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [result] = await Promise.all([suggestPromise, delayPromise]);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          {t('ai.suggestSavingsTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSuggest} disabled={isLoading} className="w-full">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LoadingDots />
              {t('ai.aiAnalyzing')}
            </span>
          ) : (
            <>
              <PiggyBank className="mr-2 h-4 w-4" />
              {t('ai.suggestSavingsButton')}
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">{t('ai.income')}</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyID(data.monthlyIncome)}</p>
              </div>
              <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">{t('ai.expense')}</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrencyID(data.monthlyExpenses)}</p>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-muted rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('ai.remainingBalance')}</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyID(data.currentBalance)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t('ai.totalAccounts')}</p>
                <p className="text-sm font-semibold">{formatCurrencyID(data.totalAccountBalance)}</p>
                {data.activeGoalsCount > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">{data.activeGoalsCount} {t('ai.activeGoals')}</p>
                )}
              </div>
            </div>

            {data.suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{t('ai.suggestionsForYou')}</p>
                {data.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{suggestion.category}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrencyID(suggestion.suggestedSaving)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-sm rounded-xl">
                {t('ai.goodFinancialHabit')}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SmartSaverSection({ isHidden }: { isHidden?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<'input' | 'result' | 'history'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [result, setResult] = useState<SmartSaverResult | null>(null);
  const [suggestions, setSuggestions] = useState<SmartSaverSuggestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<SmartSaverOption | null>(null);

  const handleAnalyze = async () => {
    if (!targetPrice || targetPrice <= 0) {
      setError('Masukkan target harga yang valid');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.smartSaverCalculate({
        itemName: itemName || undefined,
        targetPrice,
        monthlyBudget: monthlyBudget || undefined,
      });
      setResult(res);
      setMode('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.getSmartSaverSuggestions();
      setSuggestions(res.suggestions);
      setMode('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (suggestion: SmartSaverSuggestion) => {
    setItemName(suggestion.name);
    setTargetPrice(suggestion.estimatedPrice);
    setMode('input');
    handleAnalyze();
  };

  const handleSelectOption = (option: SmartSaverOption) => {
    setSelectedOption(option);
  };

  const handleCreateGoal = async () => {
    if (!result || !selectedOption) return;

    setIsCreatingGoal(true);
    setError(null);

    try {
      const targetDate = new Date(result.startDate);
      targetDate.setMonth(targetDate.getMonth() + selectedOption.estimatedMonths);

      await planService.create({
        name: itemName || 'Target Menabung',
        description: `Tabungan untuk ${itemName || 'target'}`,
        startDate: result.startDate,
        endDate: targetDate.toISOString().split('T')[0],
      });

      router.push('/goals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const handleReset = () => {
    setMode('input');
    setItemName('');
    setTargetPrice(0);
    setMonthlyBudget(0);
    setResult(null);
    setError(null);
    setSelectedOption(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          {t('ai.smartSaverTitle') || 'Rekomendasi Target Menabung'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === 'input' && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="itemName">{t('ai.smartSaver.itemName') || 'Nama Barang'}</Label>
                <Input
                  id="itemName"
                  placeholder={t('ai.smartSaver.itemPlaceholder') || 'Contoh: iPhone 16'}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetPrice">{t('ai.smartSaver.targetPrice') || 'Target Harga (Rp)'}</Label>
                <Input
                  id="targetPrice"
                  type="text"
                  placeholder={t('common.amountPlaceholder') || '0'}
                  value={targetPrice ? formatCurrency(targetPrice) : ''}
                  onChange={(e) => setTargetPrice(parseCurrency(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyBudget">{t('ai.smartSaver.monthlyBudget') || 'Tabungan/Bulan (Rp)'}</Label>
                <Input
                  id="monthlyBudget"
                  type="text"
                  placeholder={t('ai.smartSaver.optional') || 'Opsional'}
                  value={monthlyBudget ? formatCurrency(monthlyBudget) : ''}
                  onChange={(e) => setMonthlyBudget(parseCurrency(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('ai.analyzing') || 'Menganalisis...'}
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    {t('ai.analyze') || 'Analisis'}
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleShowHistory} disabled={isLoading}>
                <History className="mr-2 h-4 w-4" />
                {t('ai.fromHistory') || 'Dari Histori'}
              </Button>
            </div>
          </>
        )}

        {mode === 'history' && (
          <>
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleSelectFromHistory(suggestion)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-lg">
                        📦
                      </div>
                      <div>
                        <p className="font-semibold">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.merchant} • {formatDate(suggestion.lastTransactionDate)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      suggestion.estimatedMonths <= 2 ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}>
                      Est. {suggestion.estimatedMonths} bulan
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('ai.noSuggestions') || 'Tidak ada suggestion dari histori'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setMode('input')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('ai.inputManual') || 'Input Manual'}
              </Button>
            </div>
          </>
        )}

        {mode === 'result' && result && (
          <>
            <div className="flex items-center gap-6 pb-4 border-b">
              <div className="relative flex-shrink-0">
                <svg className="w-20 h-20" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                  <circle
                    cx="40" cy="40" r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className={selectedOption
                      ? (selectedOption.feasibility === 'safe' ? 'text-emerald-500' : selectedOption.feasibility === 'tight' ? 'text-amber-500' : 'text-red-500')
                      : 'text-primary'}
                    strokeDasharray="201"
                    strokeDashoffset={selectedOption ? 60 : 201}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{selectedOption ? selectedOption.feasibility.charAt(0).toUpperCase() + selectedOption.feasibility.slice(1) : '?'}</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{itemName || 'Target Menabung'}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: {formatCurrency(targetPrice, 'IDR', { isHidden })}
                  </p>
                </div>
                {selectedOption && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${getFeasibilityStyle(selectedOption.feasibility)}`}>
                    {selectedOption.feasibility.charAt(0).toUpperCase() + selectedOption.feasibility.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {!selectedOption && result.options && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pilih Opsi Tabungan
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {result.options.map((option) => (
                    <div
                      key={option.label.toLowerCase()}
                      onClick={() => handleSelectOption(option)}
                      className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
                        option.label.toLowerCase() === result.recommended
                          ? 'border-primary bg-primary/5 hover:border-primary/50'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      {option.label.toLowerCase() === result.recommended && (
                        <div className="text-xs text-primary font-semibold mb-2">⭐ Rekomendasi</div>
                      )}

                      <div className="text-sm font-semibold mb-1">{option.label}</div>

                      <div className="text-xl font-bold">
                        {formatCurrency(option.monthlyNeeded, 'IDR', { isHidden })}
                        <span className="text-xs font-normal text-muted-foreground ml-1">/bln</span>
                      </div>

                      <div className="text-sm text-muted-foreground mt-1">
                        {option.estimatedMonths} bulan
                      </div>

                      <div className="mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getFeasibilityStyle(option.feasibility)}`}>
                          {option.feasibility.charAt(0).toUpperCase() + option.feasibility.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOption && (
              <>
                <div className="grid grid-cols-3 gap-4 py-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Sisa Needed</p>
                    <p className="text-lg font-bold">{formatCurrency(result.remainingNeeded, 'IDR', { isHidden })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">per Bulan</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedOption.monthlyNeeded, 'IDR', { isHidden })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimasi Jadi</p>
                    <p className="text-lg font-bold text-emerald-600">{selectedOption.estimatedMonths} Bulan</p>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>📅 Mulai: {formatDate(result.startDate)}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>🎯 Target: {(() => {
                      const d = new Date(result.startDate);
                      d.setMonth(d.getMonth() + selectedOption.estimatedMonths);
                      return formatDate(d.toISOString());
                    })()}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-3">
                  <div className="flex gap-2">
                    <span>💡</span>
                    <p className="text-sm text-blue-900 dark:text-blue-100">{result.insight}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {!selectedOption ? (
                <Button
                  onClick={() => selectedOption && setSelectedOption(null)}
                  disabled={!selectedOption}
                  className="flex-1"
                >
                  Pilih Opsi
                </Button>
              ) : (
                <Button
                  onClick={handleCreateGoal}
                  disabled={isCreatingGoal}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isCreatingGoal ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {t('ai.saveAsGoal') || 'Simpan sebagai Goal'}
                </Button>
              )}

              <Button variant="outline" onClick={() => setSelectedOption(null)}>
                {selectedOption ? 'Ganti Opsi' : 'Kembali'}
              </Button>

              <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
                Reset
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TipsSection() {
  const { t } = useI18n();

  return (
    <div className="border rounded-xl p-5 bg-muted/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {t('ai.tipsTitle')}
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          {t('ai.tips.1')}
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          {t('ai.tips.2')}
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          {t('ai.tips.3')}
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          {t('ai.tips.4')}
        </li>
      </ul>
    </div>
  );
}
