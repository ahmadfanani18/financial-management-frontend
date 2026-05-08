'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { aiService, GeneratePlanResponse } from '@/services/ai.service';
import { planService } from '@/services/plan.service';
import { formatCurrency, parseCurrency } from '@/lib/currency';

export function GeneratePlanForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<GeneratePlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [monthlyIncomeRaw, setMonthlyIncomeRaw] = useState<number>(0);
  const [dependents, setDependents] = useState<number>(0);
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!monthlyIncomeRaw || monthlyIncomeRaw <= 0) {
      setError('Masukkan pendapatan bulanan yang valid');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.generatePlan({
        monthlyIncome: monthlyIncomeRaw,
        currency: 'IDR',
        dependents: dependents,
      });
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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Plan (50/30/20)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Pendapatan Bulanan</Label>
          <Input
            id="monthlyIncome"
            type="text"
            placeholder="Rp 0"
            value={monthlyIncomeRaw ? formatCurrency(monthlyIncomeRaw) : ''}
            onChange={(e) => {
              const parsed = parseCurrency(e.target.value);
              setMonthlyIncomeRaw(parsed);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dependents">Jumlah Tanggungan</Label>
          <Input
            id="dependents"
            type="number"
            min="0"
            value={dependents}
            onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menggenerate...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Plan
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
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Needs (50%)</p>
                <p className="font-bold">{data.summary.needs.toLocaleString('id-ID')}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Wants (30%)</p>
                <p className="font-bold">{data.summary.wants.toLocaleString('id-ID')}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Savings (20%)</p>
                <p className="font-bold">{data.summary.savings.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Pilih Milestone:</p>
              {data.milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={selectedMilestones.has(milestone.id)}
                    onCheckedChange={() => toggleMilestone(milestone.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    <p className="text-sm font-medium mt-1">
                      Target: {milestone.targetAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleCreatePlan}
              disabled={isLoading || selectedMilestones.size === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Plan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Buat Plan ({selectedMilestones.size} milestone)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}