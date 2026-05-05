'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Sparkles, Edit2, Trash2, MoreVertical, Calendar, Target, Loader2, LinkIcon, DollarSign, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useNotification } from '@/hooks/use-notification';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function PlansPage() {
  const { notify } = useNotification();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratePlanResponse | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'budget' | 'goal'>('budget');
  const [selectedPlanForLink, setSelectedPlanForLink] = useState<Plan | null>(null);
  const [isMilestoneGoalModalOpen, setIsMilestoneGoalModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{planId: string; milestoneId: string; title: string; targetAmount?: number} | null>(null);
  const [isAllMilestonesModalOpen, setIsAllMilestonesModalOpen] = useState(false);
  const [selectedPlanForMilestones, setSelectedPlanForMilestones] = useState<Plan | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<{planId: string; id: string; title: string; description?: string; targetDate?: string; targetAmount?: number} | null>(null);
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => planService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => planService.generatePlan(),
    onSuccess: (data) => {
      setGeneratedPlan(data);
      setIsGenerateModalOpen(true);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: ({ planId, milestoneId }: { planId: string; milestoneId: string }) =>
      planService.completeMilestone(planId, milestoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const createGoalFromMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => goalService.createFromMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsMilestoneGoalModalOpen(false);
      setSelectedMilestone(null);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const linkMilestoneToGoalMutation = useMutation({
    mutationFn: ({ planId, milestoneId, goalId }: { planId: string; milestoneId: string; goalId: string }) =>
      planService.updateMilestone(planId, milestoneId, { goalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsMilestoneGoalModalOpen(false);
      setSelectedMilestone(null);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const createBudgetsFromMilestonesMutation = useMutation({
    mutationFn: (planId: string) => planService.createBudgetsFromMilestones(planId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      alert(data.message);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ planId, milestoneId, data }: { planId: string; milestoneId: string; data: { title: string; description?: string; targetDate?: string; targetAmount?: number } }) =>
      planService.updateMilestone(planId, milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingMilestone(null);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async ({ planId, milestoneId }: { planId: string; milestoneId: string }) => {
      await fetch(`/api/plans/${planId}/milestones/${milestoneId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const linkBudgetMutation = useMutation({
    mutationFn: ({ planId, budgetId }: { planId: string; budgetId: string }) =>
      planService.linkBudget(planId, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsLinkModalOpen(false);
    },
  });

  const unlinkBudgetMutation = useMutation({
    mutationFn: ({ planId, budgetId }: { planId: string; budgetId: string }) =>
      planService.unlinkBudget(planId, budgetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const linkGoalMutation = useMutation({
    mutationFn: ({ planId, goalId }: { planId: string; goalId: string }) =>
      planService.linkGoal(planId, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsLinkModalOpen(false);
    },
  });

  const unlinkGoalMutation = useMutation({
    mutationFn: ({ planId, goalId }: { planId: string; goalId: string }) =>
      planService.unlinkGoal(planId, goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const handleSubmit = async (data: CreatePlanInput) => {
    try {
      if (selectedPlan) {
        notify.promise(
          planService.update(selectedPlan.id, data),
          notify.update('Rencana')
        );
      } else {
        notify.promise(
          createMutation.mutateAsync(data),
          notify.create('Rencana')
        );
      }
      setIsFormOpen(false);
      setSelectedPlan(undefined);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (err) {
      // Error handled by toast
    }
  };

  const handleAddMilestone = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsMilestoneOpen(true);
  };

  const handleCompleteMilestone = (planId: string, milestoneId: string) => {
    completeMilestoneMutation.mutate({ planId, milestoneId });
  };

  const handleCreateGoalFromMilestone = (milestoneId: string) => {
    notify.promise(
      createGoalFromMilestoneMutation.mutateAsync(milestoneId),
      {
        loading: 'Membuat goal dari milestone...',
        success: 'Goal berhasil dibuat dari milestone',
        error: (err) => err.message || 'Gagal membuat goal',
      }
    );
  };

  const handleCreateGoalClick = (milestoneId: string) => {
    setConfirmState({ type: 'createGoal', id: milestoneId, open: true });
  };

  const handleOpenLinkModal = (plan: Plan, type: 'budget' | 'goal') => {
    setSelectedPlanForLink(plan);
    setLinkType(type);
    setIsLinkModalOpen(true);
  };

  const handleLinkItem = (itemId: string) => {
    if (!selectedPlanForLink) return;

    if (linkType === 'budget') {
      linkBudgetMutation.mutate({
        planId: selectedPlanForLink.id,
        budgetId: itemId
      });
    } else {
      linkGoalMutation.mutate({
        planId: selectedPlanForLink.id,
        goalId: itemId
      });
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleSaveMilestone = async () => {
    if (editingMilestone) {
        notify.promise(
        updateMilestoneMutation.mutateAsync({
          planId: editingMilestone.planId,
          milestoneId: editingMilestone.id,
          data: {
            title: editingMilestone.title,
            description: editingMilestone.description,
            targetDate: editingMilestone.targetDate,
            targetAmount: editingMilestone.targetAmount
          }
        }),
        notify.update('Milestone')
      );
    }
  };

  const handleDeletePlan = (planId: string) => {
    notify.promise(
      deleteMutation.mutateAsync(planId),
      notify.delete('Rencana')
    );
  };

  const handleDeletePlanClick = (planId: string) => {
    setConfirmState({ type: 'deletePlan', id: planId, open: true });
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
        alert('Terjadi kesalahan saat menyimpan rencana');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rencana</h1>
          <p className="text-muted-foreground">Rencana keuangan jangka panjang Anda</p>
        </div>
        <div className="flex gap-2">
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
            Generate Plan
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rencana
          </Button>
        </div>
      </div>

      {!isLoading && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Plans</p>
            <p className="text-2xl font-bold">{plans.length}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Milestones</p>
            <p className="text-2xl font-bold text-green-500">
              {plans.reduce((sum, p) => sum + p.milestones.length, 0)}
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="text-2xl font-bold text-blue-500">
              {plans.reduce((sum, p) => sum + p.milestones.filter(m => m.isCompleted).length, 0)}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Belum ada rencana. Buat rencana pertama Anda.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const completedMilestones = plan.milestones.filter(m => m.isCompleted).length;
            const progress = plan.milestones.length > 0 
              ? Math.round((completedMilestones / plan.milestones.length) * 100) 
              : 0;
            
            return (
              <Card key={plan.id} className="group relative overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between pr-12">
                    <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                    <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'} className={plan.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                      {plan.status === 'ACTIVE' ? 'Aktif' : plan.status === 'COMPLETED' ? 'Selesai' : 'Arsip'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePlan(plan.id)} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(plan.startDate).toLocaleDateString('id-ID')} - {new Date(plan.endDate).toLocaleDateString('id-ID')}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Milestones
                      </p>
                      <span className="text-xs text-muted-foreground">{completedMilestones}/{plan.milestones.length}</span>
                    </div>
                    <div className="space-y-1">
                      {plan.milestones.slice(0, 3).map((milestone) => {
                        const isUnlinkedWithTarget = milestone.targetAmount && !milestone.goalId && !milestone.isCompleted;
                        const handleMilestoneClick = () => {
                          if (milestone.isCompleted) {
                            return;
                          }
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
                          className={`flex items-center gap-2 p-2 rounded-md transition-colors ${!milestone.isCompleted ? 'cursor-pointer hover:bg-accent/50' : ''}`}
                          onClick={handleMilestoneClick}
                        >
                          {milestone.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className={`text-sm truncate ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </span>
                            {milestone.goalId && (
                              <LinkIcon className="h-3 w-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                          {milestone.targetAmount && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatCurrency(Number(milestone.targetAmount))}
                            </span>
                          )}
                          {!milestone.isCompleted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                className="p-1 hover:bg-accent rounded"
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
                                <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                              </button>
                              <button
                                className="p-1 hover:bg-accent rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmState({ type: 'deleteMilestone', id: `${plan.id}|${milestone.id}`, open: true });
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                      )})}
                      {plan.milestones.length > 3 && (
                        <button 
                          className="text-xs text-muted-foreground pl-6 hover:text-primary"
                          onClick={() => {
                            setSelectedPlanForMilestones(plan);
                            setIsAllMilestonesModalOpen(true);
                          }}
                        >
                          +{plan.milestones.length - 3} lainnya
                        </button>
                      )}
                    </div>
                  </div>

                  {plan.milestones.some(m => m.targetAmount && !m.goalId) && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      Beberapa milestone memiliki target amount. Klik milestone untuk membuat goal.
                    </div>
                  )}

                  {(plan as any).planBudgets && (plan as any).planBudgets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Budgets
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleOpenLinkModal(plan, 'budget')}
                        >
                          + Tambah
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(plan as any).planBudgets.map((pb: any) => (
                          <Badge key={pb.budgetId} variant="outline" className="flex items-center gap-1">
                            {pb.budget?.category?.name || 'Budget'}
                            <button
                              onClick={() => unlinkBudgetMutation.mutate({
                                planId: plan.id,
                                budgetId: pb.budgetId
                              })}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(plan as any).planGoals && (plan as any).planGoals.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Goals
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleOpenLinkModal(plan, 'goal')}
                        >
                          + Tambah
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(plan as any).planGoals.map((pg: any) => (
                          <Badge key={pg.goalId} variant="outline" className="flex items-center gap-1">
                            {pg.goal?.name || 'Goal'}
                            <button
                              onClick={() => unlinkGoalMutation.mutate({
                                planId: plan.id,
                                goalId: pg.goalId
                              })}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.milestones.some(m => m.goalId && m.targetAmount) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => createBudgetsFromMilestonesMutation.mutate(plan.id)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Buat Budget dari Milestone
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddMilestone(plan)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Milestone
                  </Button>
                </CardContent>
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
        isLoading={createMutation.isPending}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Input
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Tanggal</Label>
                <Input
                  type="date"
                  value={editingMilestone.targetDate || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Jumlah</Label>
                <Input
                  type="text"
                  placeholder="Rp 0"
                  value={editingMilestone.targetAmount ? formatCurrency(editingMilestone.targetAmount) : ''}
                  onChange={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    setEditingMilestone({ ...editingMilestone, targetAmount: isNaN(parsed) ? undefined : parsed });
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMilestone(null)}>Batal</Button>
            <Button onClick={handleSaveMilestone} disabled={updateMilestoneMutation.isPending}>
              {updateMilestoneMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Rencana yang Dihasilkan
            </DialogTitle>
          </DialogHeader>
          {generatedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h3 className="font-semibold">{generatedPlan.plan.name}</h3>
                <p className="text-sm text-muted-foreground">{generatedPlan.plan.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Saldo Total:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.totalBalance}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pendapatan/Bulan:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.monthlyIncome}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pengeluaran/Bulan:</span>
                    <span className="ml-2 font-medium">{generatedPlan.summary.monthlyExpense}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sisa:</span>
                    <span className={`ml-2 font-medium ${generatedPlan.summary.savings.startsWith('Terjadi') ? 'text-red-500' : ''}`}>
                      {generatedPlan.summary.savings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Milestones yang Direkomendasikan:</h4>
                {generatedPlan.plan.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
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
              Batal
            </Button>
            <Button onClick={handleConfirmGeneratedPlan} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Rencana'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkType === 'budget' ? 'Tambah Budget' : 'Tambah Goal'} ke Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {linkType === 'budget'
              ? budgets
                  .filter((b: Budget) => !(selectedPlanForLink as any)?.planBudgets?.some((pb: any) => pb.budgetId === b.id))
                  .map((budget: Budget) => (
                    <div
                      key={budget.id}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
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
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hubungkan ke Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Milestone: <span className="font-medium">{selectedMilestone?.title}</span>
              {selectedMilestone?.targetAmount && (
                <span className="ml-2">(Target: {Number(selectedMilestone.targetAmount).toLocaleString('id-ID')})</span>
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
              Buat Goal Baru
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">atau</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Pilih Goal yang Sudah Ada:</p>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada goal. Buat goal baru dari milestone di atas.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-accent"
                      onClick={() => {
                        if (selectedMilestone) {
                          linkMilestoneToGoalMutation.mutate({
                            planId: selectedMilestone.planId,
                            milestoneId: selectedMilestone.milestoneId,
                            goalId: goal.id
                          });
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Semua Milestone - {selectedPlanForMilestones?.name}</DialogTitle>
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
                  className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors ${
                    milestone.isCompleted 
                      ? 'bg-muted/50' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={handleClick}
                >
                  {milestone.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : milestone.goalId ? (
                    <LinkIcon className="h-5 w-5 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {milestone.title}
                    </p>
                    {milestone.targetAmount && (
                      <p className="text-xs text-muted-foreground">
                        Target: {Number(milestone.targetAmount).toLocaleString('id-ID')}
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
        title="Buat Goal"
        description="Buat goal dari milestone ini?"
        confirmText="Buat"
      />

      <ConfirmDialog
        open={confirmState.open && confirmState.type === 'deletePlan'}
        onOpenChange={(open) => setConfirmState({ type: null, id: null, open })}
        onConfirm={() => {
          if (confirmState.id) {
            handleDeletePlan(confirmState.id);
          }
        }}
        title="Hapus Rencana"
        description="Apakah Anda yakin ingin menghapus rencana ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmState.open && confirmState.type === 'deleteMilestone'}
        onOpenChange={(open) => setConfirmState({ type: null, id: null, open })}
        onConfirm={() => {
          if (confirmState.id) {
            const [planId, milestoneId] = confirmState.id.split('|');
            notify.promise(
              deleteMilestoneMutation.mutateAsync({ planId, milestoneId }),
              {
                loading: 'Menghapus milestone...',
                success: 'Milestone berhasil dihapus',
                error: (err) => err.message || 'Gagal menghapus milestone',
              }
            );
          }
        }}
        title="Hapus Milestone"
        description="Hapus milestone ini?"
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}
