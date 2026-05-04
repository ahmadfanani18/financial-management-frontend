'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Sparkles, Edit2, Trash2, MoreVertical, Calendar, Target, Loader2, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { planService, Plan, CreatePlanInput, GeneratePlanResponse } from '@/services/plan.service';
import { goalService } from '@/services/goal.service';
import { PlanForm } from '@/components/forms/plan-form';
import { MilestoneForm } from '@/components/forms/milestone-form';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function PlansPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratePlanResponse | null>(null);
  const queryClient = useQueryClient();

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
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = async (data: CreatePlanInput) => {
    if (selectedPlan) {
      await planService.update(selectedPlan.id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedPlan(undefined);
    queryClient.invalidateQueries({ queryKey: ['plans'] });
  };

  const handleAddMilestone = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsMilestoneOpen(true);
  };

  const handleCompleteMilestone = (planId: string, milestoneId: string) => {
    completeMilestoneMutation.mutate({ planId, milestoneId });
  };

  const handleCreateGoalFromMilestone = (milestoneId: string) => {
    if (confirm('Buat goal dari milestone ini?')) {
      createGoalFromMilestoneMutation.mutate(milestoneId);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rencana ini?')) {
      deleteMutation.mutate(planId);
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

      {plans.length > 0 && (
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Progress per Plan</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={plans.map(plan => ({
                      name: plan.name.length > 15 ? plan.name.substring(0, 15) + '...' : plan.name,
                      completed: plan.milestones.filter(m => m.isCompleted).length,
                      total: plan.milestones.length,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="completed" name="Selesai" fill="#10B981" stackId="a" />
                    <Bar dataKey="total" name="Total" fill="#e5e7eb" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status Distribution</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Aktif', value: plans.filter(p => p.status === 'ACTIVE').length, color: '#10B981' },
                        { name: 'Selesai', value: plans.filter(p => p.status === 'COMPLETED').length, color: '#3b82f6' },
                        { name: 'Arsip', value: plans.filter(p => p.status === 'ARCHIVED').length, color: '#6b7280' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[
                        { name: 'Aktif', value: plans.filter(p => p.status === 'ACTIVE').length, color: '#10B981' },
                        { name: 'Selesai', value: plans.filter(p => p.status === 'COMPLETED').length, color: '#3b82f6' },
                        { name: 'Arsip', value: plans.filter(p => p.status === 'ARCHIVED').length, color: '#6b7280' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
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
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                    <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'} className={plan.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                      {plan.status === 'ACTIVE' ? 'Aktif' : plan.status === 'COMPLETED' ? 'Selesai' : 'Arsip'}
                    </Badge>
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
                        const handleMilestoneClick = () => {
                          if (milestone.targetAmount && !milestone.goalId && !milestone.isCompleted) {
                            if (confirm(`${milestone.title} memiliki target amount. Buat goal dari milestone ini?`)) {
                              createGoalFromMilestoneMutation.mutate(milestone.id);
                            }
                          } else {
                            handleCompleteMilestone(plan.id, milestone.id);
                          }
                        };
                        
                        return (
                        <div 
                          key={milestone.id} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
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
                              {Number(milestone.targetAmount).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      )})}
                      {plan.milestones.length > 3 && (
                        <p className="text-xs text-muted-foreground pl-6">
                          +{plan.milestones.length - 3} lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {plan.milestones.some(m => m.targetAmount && !m.goalId) && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      Beberapa milestone memiliki target amount. Klik milestone untuk membuat goal.
                    </div>
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
    </div>
  );
}
