'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Sparkles, Edit2, Trash2, MoreVertical, Calendar, Target, Loader2, LinkIcon, DollarSign, Pencil, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { planService, Plan, CreatePlanInput, GeneratePlanResponse } from '@/services/plan.service';
import { budgetService, Budget } from '@/services/budget.service';
import { goalService, Goal } from '@/services/goal.service';
import { PlanForm } from '@/components/forms/plan-form';
import { MilestoneForm } from '@/components/forms/milestone-form';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

export default function PlansPage() {
  const { t } = useI18n();
  const { isHidden, toggle } = useAmountVisibility('plans');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratePlanResponse | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'budget' | 'goal'>('budget');
  const [selectedPlanForLink, setSelectedPlanForLink] = useState<Plan | null>(null);
  const [isMilestoneGoalModalOpen, setIsMilestoneGoalModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{planId: string; milestoneId: string; title: string; targetAmount?: number | string} | null>(null);
  const [isAllMilestonesModalOpen, setIsAllMilestonesModalOpen] = useState(false);
  const [selectedPlanForMilestones, setSelectedPlanForMilestones] = useState<Plan | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<{planId: string; id: string; title: string; description?: string; targetDate?: string; targetAmount?: number | string} | null>(null);
  const [confirmState, setConfirmState] = useState<{
    type: 'deletePlan' | 'deleteMilestone' | 'createGoal' | null;
    id: string | null;
    open: boolean;
  }>({ type: null, id: null, open: false });
  const queryClient = useQueryClient();

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll(),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanInput) => planService.create(data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePlanInput }) =>
      planService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => planService.delete(id),
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => planService.generatePlan(),
    onSuccess: (data) => {
      setGeneratedPlan(data);
      setIsGenerateModalOpen(true);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('common.error'));
    },
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: ({ planId, milestoneId }: { planId: string; milestoneId: string }) =>
      planService.completeMilestone(planId, milestoneId),
  });

  const createGoalFromMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => goalService.createFromMilestone(milestoneId),
  });

  const linkMilestoneToGoalMutation = useMutation({
    mutationFn: ({ planId, milestoneId, goalId }: { planId: string; milestoneId: string; goalId: string }) =>
      planService.updateMilestone(planId, milestoneId, { goalId }),
  });

  const createBudgetsFromMilestonesMutation = useMutation({
    mutationFn: (planId: string) => planService.createBudgetsFromMilestones(planId),
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ planId, milestoneId, data }: { planId: string; milestoneId: string; data: { title: string; description?: string; targetDate?: string; targetAmount?: number | string } }) =>
      planService.updateMilestone(planId, milestoneId, data),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async ({ planId, milestoneId }: { planId: string; milestoneId: string }) => {
      await fetch(`/api/plans/${planId}/milestones/${milestoneId}`, { method: 'DELETE' });
    },
  });

  const linkBudgetMutation = useMutation({
    mutationFn: ({ planId, budgetId }: { planId: string; budgetId: string }) =>
      planService.linkBudget(planId, budgetId),
  });

  const unlinkBudgetMutation = useMutation({
    mutationFn: ({ planId, budgetId }: { planId: string; budgetId: string }) =>
      planService.unlinkBudget(planId, budgetId),
  });

  const linkGoalMutation = useMutation({
    mutationFn: ({ planId, goalId }: { planId: string; goalId: string }) =>
      planService.linkGoal(planId, goalId),
  });

  const unlinkGoalMutation = useMutation({
    mutationFn: ({ planId, goalId }: { planId: string; goalId: string }) =>
      planService.unlinkGoal(planId, goalId),
  });

  const handleSubmit = async (data: CreatePlanInput) => {
    try {
      if (selectedPlan) {
        await updateMutation.mutateAsync({ id: selectedPlan.id, data });
        toast.success(t('plans.planUpdated'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('plans.planCreated'));
      }
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsFormOpen(false);
      setSelectedPlan(undefined);
    } catch (err) {
      toast.error(t('plans.failedSavePlan'));
    }
  };

  const handleAddMilestone = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsMilestoneOpen(true);
  };

  const handleCompleteMilestone = async (planId: string, milestoneId: string) => {
    try {
      await completeMilestoneMutation.mutateAsync({ planId, milestoneId });
      toast.success(t('plans.milestoneCompleted'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (err) {
      toast.error(t('plans.failedCompleteMilestone'));
    }
  };

  const handleCreateGoalFromMilestone = async (milestoneId: string) => {
    try {
      await createGoalFromMilestoneMutation.mutateAsync(milestoneId);
      toast.success(t('plans.goalCreatedFromMilestone'));
      setConfirmState({ type: null, id: null, open: false });
      setIsMilestoneGoalModalOpen(false);
      setSelectedMilestone(null);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (err: unknown) {
      toast.error((err as Error).message || t('common.error'));
    }
  };

  const handleCreateGoalClick = (milestoneId: string) => {
    setConfirmState({ type: 'createGoal', id: milestoneId, open: true });
  };

  const handleOpenLinkModal = (plan: Plan, type: 'budget' | 'goal') => {
    setSelectedPlanForLink(plan);
    setLinkType(type);
    setIsLinkModalOpen(true);
  };

  const handleLinkItem = async (itemId: string) => {
    if (!selectedPlanForLink) return;

    try {
      if (linkType === 'budget') {
        await linkBudgetMutation.mutateAsync({
          planId: selectedPlanForLink.id,
          budgetId: itemId
        });
        toast.success(t('plans.budgetConnected'));
      } else {
        await linkGoalMutation.mutateAsync({
          planId: selectedPlanForLink.id,
          goalId: itemId
        });
        toast.success(t('plans.goalConnected'));
      }
      setIsLinkModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (err) {
      toast.error(t('plans.failedConnect'));
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleSaveMilestone = async () => {
    if (editingMilestone) {
      try {
        await updateMilestoneMutation.mutateAsync({
          planId: editingMilestone.planId,
          milestoneId: editingMilestone.id,
          data: {
            title: editingMilestone.title,
            description: editingMilestone.description,
            targetDate: editingMilestone.targetDate,
            targetAmount: editingMilestone.targetAmount
          }
        });
        toast.success(t('plans.savingMilestone'));
        setEditingMilestone(null);
      } catch (err) {
        toast.error(t('plans.failedSaveMilestone'));
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteMutation.mutateAsync(planId);
      toast.success(t('plans.planDeleted'));
      setConfirmState({ type: null, id: null, open: false });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (err) {
      toast.error(t('plans.failedDeletePlan'));
    }
  };

  const handleDeletePlanClick = (planId: string) => {
    setConfirmState({ type: 'deletePlan', id: planId, open: true });
  };

  const handleDeleteMilestone = async () => {
    if (!confirmState.id) return;
    try {
      const [planId, milestoneId] = confirmState.id.split('|');
      await deleteMilestoneMutation.mutateAsync({ planId, milestoneId });
      toast.success(t('plans.milestoneDeleted'));
      setConfirmState({ type: null, id: null, open: false });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (err: unknown) {
      toast.error((err as Error).message || t('plans.failedDeleteMilestone'));
    }
  };

  const handleConfirmGeneratedPlan = async () => {
    if (generatedPlan?.plan) {
      try {
        const newPlan = await createMutation.mutateAsync({
          name: generatedPlan.plan.name,
          description: generatedPlan.plan.description,
          startDate: new Date(generatedPlan.plan.startDate).toISOString().split('T')[0],
          endDate: new Date(generatedPlan.plan.endDate).toISOString().split('T')[0],
        });

        for (const milestone of generatedPlan.plan.milestones) {
          await planService.addMilestone(newPlan.id, {
            title: milestone.title,
            description: milestone.description,
            targetDate: new Date(milestone.targetDate).toISOString().split('T')[0],
            targetAmount: milestone.targetAmount,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['plans'] });
        setIsGenerateModalOpen(false);
        setGeneratedPlan(null);
      } catch (error) {
        toast.error('Terjadi kesalahan saat menyimpan rencana');
      }
    }
  };

  const totalMilestones = plans.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedMilestones = plans.reduce((sum, p) => sum + p.milestones.filter(m => m.isCompleted).length, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('plans.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('plans.manage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
          >
            {isHidden ? (
              <>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.showAmount')}</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.hideAmount')}</span>
              </>
            )}
          </button>
          <Button
            variant="outline"
            onClick={() => generatePlanMutation.mutate()}
            disabled={generatePlanMutation.isPending}
          >
            {generatePlanMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {t('plans.generate')}
          </Button>
          <Button onClick={() => { setSelectedPlan(undefined); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('plans.addPlan')}
          </Button>
        </div>
      </header>

      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl p-5 border group hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-muted-foreground mb-1">{t('plans.totalPlans')}</p>
            <p className="text-3xl font-bold">{plans.length}</p>
          </Card>
          <Card className="rounded-2xl p-5 border bg-gradient-to-br from-green-500/10 to-green-500/5 group hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-muted-foreground mb-1">{t('plans.totalMilestones')}</p>
            <p className="text-3xl font-bold text-green-500">{totalMilestones}</p>
          </Card>
          <Card className="rounded-2xl p-5 border bg-gradient-to-br from-blue-500/10 to-blue-500/5 group hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-muted-foreground mb-1">{t('plans.completed')}</p>
            <p className="text-3xl font-bold text-blue-500">{completedMilestones}</p>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
      ) : plans.length === 0 ? (
        <Card className="rounded-2xl p-12 border text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t('plans.noPlans')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const completedCount = plan.milestones.filter(m => m.isCompleted).length;
            const progress = plan.milestones.length > 0
              ? Math.round((completedCount / plan.milestones.length) * 100)
              : 0;

            return (
              <Card
                key={plan.id}
                className="rounded-2xl border group relative overflow-hidden border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-5 pb-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={plan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                      >
                        {plan.status === 'ACTIVE' ? t('plans.active') : plan.status === 'COMPLETED' ? t('plans.completed') : t('plans.archived')}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePlanClick(plan.id)} className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{plan.description}</p>
                  )}
                </div>

                <div className="px-5 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">{t('plans.progress')}</span>
                    <span className="text-sm font-semibold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="px-5 pb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(plan.startDate).toLocaleDateString('id-ID')} - {new Date(plan.endDate).toLocaleDateString('id-ID')}</span>
                </div>

                <div className="px-5 pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {t('plans.milestones')}
                    </p>
                    <span className="text-xs text-muted-foreground">{completedCount}/{plan.milestones.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {plan.milestones.slice(0, 3).map((milestone) => {
                      const handleMilestoneClick = () => {
                        if (milestone.isCompleted) return;
                        if (milestone.goalId) {
                          handleCompleteMilestone(plan.id, milestone.id);
                        } else {
                          setSelectedMilestone({
                            planId: plan.id,
                            milestoneId: milestone.id,
                            title: milestone.title,
                            targetAmount: milestone.targetAmount
                          });
                          setIsMilestoneGoalModalOpen(true);
                        }
                      };

                      return (
                        <div
                          key={milestone.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-background transition-colors ${!milestone.isCompleted ? 'cursor-pointer hover:bg-muted' : 'opacity-70'}`}
                          onClick={handleMilestoneClick}
                        >
                          {milestone.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className={`text-sm truncate ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </span>
                            {milestone.goalId && (
                              <LinkIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                          {milestone.targetAmount != null && milestone.targetAmount !== '' && !isNaN(Number(milestone.targetAmount)) && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {isHidden ? '••••••' : formatCurrency(Number(milestone.targetAmount))}
                            </span>
                          )}
                          {!milestone.isCompleted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMilestone({
                                    planId: plan.id,
                                    id: milestone.id,
                                    title: milestone.title,
                                    description: milestone.description || '',
                                    targetDate: milestone.targetDate ? new Date(milestone.targetDate).toISOString().split('T')[0] : undefined,
                                    targetAmount: milestone.targetAmount ? Number(milestone.targetAmount) : undefined
                                  });
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmState({ type: 'deleteMilestone', id: `${plan.id}|${milestone.id}`, open: true });
                                }}
                              >
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {plan.milestones.length > 3 && (
                      <button
                        className="text-xs text-muted-foreground hover:text-emerald-500 transition-colors text-left pl-2"
                        onClick={() => {
                          setSelectedPlanForMilestones(plan);
                          setIsAllMilestonesModalOpen(true);
                        }}
                      >
                        {t('plans.moreMilestones', { count: plan.milestones.length - 3 })}
                      </button>
                    )}
                  </div>
                </div>

                {plan.milestones.some(m => m.targetAmount && !m.goalId) && (
                  <div className="mx-5 mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm">
                    {t('plans.hasTargetAmountWarning')}
                  </div>
                )}

                {(plan as any).planBudgets && (plan as any).planBudgets.length > 0 && (
                  <div className="px-5 pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {t('plans.budgets')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleOpenLinkModal(plan, 'budget')}
                      >
                        {t('plans.addBudget')}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(plan as any).planBudgets.map((pb: any) => (
                        <Badge key={pb.budgetId} variant="outline" className="flex items-center gap-1.5 py-1">
                          {pb.budget?.category?.name || 'Budget'}
                          <button
                            onClick={() => {
                              unlinkBudgetMutation.mutate({
                                planId: plan.id,
                                budgetId: pb.budgetId
                              });
                              toast.success(t('plans.budgetDisconnected'));
                            }}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(plan as any).planGoals && (plan as any).planGoals.length > 0 && (
                  <div className="px-5 pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        {t('plans.goals')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleOpenLinkModal(plan, 'goal')}
                      >
                        {t('plans.addGoal')}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(plan as any).planGoals.map((pg: any) => (
                        <Badge key={pg.goalId} variant="outline" className="flex items-center gap-1.5 py-1">
                          {pg.goal?.name || 'Goal'}
                          <button
                            onClick={() => {
                              unlinkGoalMutation.mutate({
                                planId: plan.id,
                                goalId: pg.goalId
                              });
                              toast.success(t('plans.goalDisconnected'));
                            }}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {plan.milestones.some(m => m.goalId && m.targetAmount) && (
                  <div className="px-5 pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        createBudgetsFromMilestonesMutation.mutate(plan.id);
                        toast.success(t('plans.budgetCreatedFromMilestone'));
                      }}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {t('plans.createBudgetFromMilestone')}
                    </Button>
                  </div>
                )}

                <div className="px-5 pb-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddMilestone(plan)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('plans.addMilestone')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PlanForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedPlan(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedPlan}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <MilestoneForm
        open={isMilestoneOpen}
        onOpenChange={setIsMilestoneOpen}
        onSubmit={async (data) => {
          if (selectedPlan) {
            await planService.addMilestone(selectedPlan.id, data);
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            setIsMilestoneOpen(false);
          }
        }}
      />

      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              {t('plans.editMilestone')}
            </DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4">
              <div>
                <Label>{t('plans.milestoneForm.title')}</Label>
                <Input
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{t('transactions.description')}</Label>
                <Input
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{t('plans.targetDate')}</Label>
                <Input
                  type="date"
                  value={editingMilestone.targetDate || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, targetDate: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{t('goals.target')}</Label>
                <Input
                  type="text"
                  placeholder={t('common.amountPlaceholder')}
                  value={editingMilestone.targetAmount ? formatCurrency(editingMilestone.targetAmount) : ''}
                  onChange={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    setEditingMilestone({ ...editingMilestone, targetAmount: isNaN(parsed) ? undefined : parsed });
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMilestone(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveMilestone} disabled={updateMilestoneMutation.isPending}>
              {updateMilestoneMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              {t('plans.generatedPlan')}
            </DialogTitle>
          </DialogHeader>
          {generatedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl space-y-3">
                <h3 className="font-semibold">{generatedPlan.plan.name}</h3>
                <p className="text-sm text-muted-foreground">{generatedPlan.plan.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('plans.totalBalance')}:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.totalBalance}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('plans.monthlyIncome')}:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.monthlyIncome}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('plans.monthlyExpense')}:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.monthlyExpense}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('plans.remaining')}:</span>
                    <span className={`ml-2 font-medium ${generatedPlan.summary.savings.startsWith('Terjadi') ? 'text-red-500' : ''}`}>
                      {generatedPlan.summary.savings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('plans.recommendedMilestones')}:</h4>
                {generatedPlan.plan.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border border-border rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-medium shrink-0 text-emerald-500">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      {milestone.targetAmount && (
                        <p className="text-xs font-medium mt-1">
                          Target: {Number(milestone.targetAmount).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmGeneratedPlan} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('plans.saving') : t('plans.savePlan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {linkType === 'budget' ? t('budgets.addBudget') : t('goals.addGoal')} {t('plans.toPlan')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {linkType === 'budget'
              ? budgets
                  .filter((b: Budget) => !(selectedPlanForLink as any)?.planBudgets?.some((pb: any) => pb.budgetId === b.id))
                  .map((budget: Budget) => (
                    <div
                      key={budget.id}
                      className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleLinkItem(budget.id)}
                    >
                      <span>{budget.category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {budget.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
              : goals
                  .filter((g: Goal) => !(selectedPlanForLink as any)?.planGoals?.some((pg: any) => pg.goalId === g.id))
                  .map((goal: Goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleLinkItem(goal.id)}
                    >
                      <span>{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.targetAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
            }
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMilestoneGoalModalOpen} onOpenChange={setIsMilestoneGoalModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('plans.linkToGoal')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Milestone: <span className="font-medium">{selectedMilestone?.title}</span>
              {selectedMilestone?.targetAmount && (
                <span className="ml-2">({t('plans.target')}: {Number(selectedMilestone.targetAmount).toLocaleString('id-ID')})</span>
              )}
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (selectedMilestone) {
                  createGoalFromMilestoneMutation.mutate(selectedMilestone.milestoneId);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('plans.createNewGoal')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t('plans.or')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('plans.selectExistingGoal')}</p>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('plans.noGoalsCreateNew')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        if (selectedMilestone) {
                          linkMilestoneToGoalMutation.mutate({
                            planId: selectedMilestone.planId,
                            milestoneId: selectedMilestone.milestoneId,
                            goalId: goal.id
                          });
                          toast.success(t('plans.milestoneLinkedToGoal'));
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.color || '#10B981' }}
                        />
                        <span className="font-medium">{goal.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {Number(goal.currentAmount).toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-muted-foreground"> / {Number(goal.targetAmount).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAllMilestonesModalOpen} onOpenChange={setIsAllMilestonesModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('plans.allMilestones')} - {selectedPlanForMilestones?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedPlanForMilestones?.milestones.map((milestone) => {
              const handleClick = () => {
                if (milestone.isCompleted) return;
                if (milestone.goalId) {
                  handleCompleteMilestone(selectedPlanForMilestones!.id, milestone.id);
                } else {
                  setSelectedMilestone({
                    planId: selectedPlanForMilestones!.id,
                    milestoneId: milestone.id,
                    title: milestone.title,
                    targetAmount: milestone.targetAmount
                  });
                  setIsMilestoneGoalModalOpen(true);
                }
              };

              return (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer transition-colors ${
                    milestone.isCompleted
                      ? 'bg-muted/50'
                      : 'hover:bg-muted'
                  }`}
                  onClick={handleClick}
                >
                  {milestone.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : milestone.goalId ? (
                    <LinkIcon className="h-5 w-5 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {milestone.title}
                    </p>
                    {typeof milestone.targetAmount === 'number' && !isNaN(milestone.targetAmount) && (
                      <p className="text-xs text-muted-foreground">
                        {t('plans.target')}: {Number(milestone.targetAmount).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  {milestone.goalId && (
                    <LinkIcon className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmState.open && confirmState.type === 'createGoal'}
        onOpenChange={(open) => setConfirmState({ type: null, id: null, open })}
        onConfirm={() => {
          if (confirmState.id) {
            handleCreateGoalFromMilestone(confirmState.id);
          }
        }}
        title={t('goals.addGoal')}
        description={t('plans.createGoalFromMilestone')}
        confirmText={t('common.add')}
        isLoading={createGoalFromMilestoneMutation.isPending}
      />

      <ConfirmDialog
        open={confirmState.open && confirmState.type === 'deletePlan'}
        onOpenChange={(open) => setConfirmState({ type: null, id: null, open })}
        onConfirm={() => {
          if (confirmState.id) {
            handleDeletePlan(confirmState.id);
          }
        }}
        title={t('plans.deletePlan')}
        description={t('messages.confirmDelete')}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={confirmState.open && confirmState.type === 'deleteMilestone'}
        onOpenChange={(open) => setConfirmState({ type: null, id: null, open })}
        onConfirm={handleDeleteMilestone}
        isLoading={deleteMilestoneMutation.isPending}
        title={t('plans.deleteMilestone')}
        description={t('messages.confirmDelete')}
        confirmText={t('common.delete')}
        variant="destructive"
      />
    </div>
  );
}
