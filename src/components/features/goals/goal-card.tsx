'use client';

import { 
  Plus, 
  History, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/services/goal.service';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GoalCardProps {
  goal: Goal;
  onAddContribution: () => void;
  onViewHistory: () => void;
  onToggleLock: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CircularProgress({ 
  progress, 
  color, 
  size = 72 
}: { 
  progress: number; 
  color?: string; 
  size?: number;
}) {
  const data = [
    { name: 'progress', value: Math.min(progress, 100) },
    { name: 'remaining', value: Math.max(0, 100 - progress) },
  ];
  const progressColor = color || (progress >= 100 ? '#10b981' : progress > 50 ? '#8b5cf6' : '#f59e0b');
  const trackColor = 'var(--muted)';
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={size * 0.35}
            outerRadius={size * 0.48}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={progressColor} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-sm font-bold",
          progress >= 100 ? "text-emerald-500" : "text-foreground"
        )}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ goal }: { goal: Goal }) {
  if (goal.isCompleted) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        <Target className="w-3 h-3 mr-1" />
        Selesai
      </Badge>
    );
  }
  
  if (goal.isOverdue && !goal.isCompleted) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Terlambat
      </Badge>
    );
  }
  
  if (goal.isLocked) {
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 gap-1">
        <Lock className="w-3 h-3" />
        Terkunci
      </Badge>
    );
  }
  
  if (goal.source === 'AUTO_GENERATED') {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
        Milestone
      </Badge>
    );
  }
  
  return null;
}

export function GoalCard({
  goal,
  onAddContribution,
  onViewHistory,
  onToggleLock,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const daysRemaining = goal.daysRemaining;
  const deadlineText = daysRemaining > 0 
    ? `${daysRemaining} hari tersisa`
    : daysRemaining === 0 
      ? 'Hari ini deadline'
      : `Terlambat ${Math.abs(daysRemaining)} hari`;

  return (
    <Card 
      variant="feature" 
      className="group overflow-hidden"
    >
      {/* Header */}
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">
              {goal.name}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge goal={goal} />
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-5 pb-5 pt-0">
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <CircularProgress 
            progress={goal.percentage} 
            color={goal.color} 
            size={80} 
          />
          
          {/* Amount Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(goal.currentAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Target: {formatCurrency(goal.targetAmount)}
              </p>
            </div>
            
            {/* Deadline */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{deadlineText}</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {new Date(goal.deadline).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-border/50">
          {/* Primary Action - Add Contribution */}
          <Button 
            variant="default" 
            size="sm" 
            className={cn(
              "flex-1 gap-1.5 font-medium",
              "bg-primary hover:bg-primary/90",
              "transition-all duration-200 hover:scale-[1.02]"
            )}
            onClick={onAddContribution}
            disabled={goal.isCompleted}
          >
            <Plus className="w-4 h-4" />
            Kontribusi
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-muted transition-colors"
              onClick={onViewHistory}
              title="Riwayat Kontribusi"
            >
              <History className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-muted transition-colors"
              onClick={onToggleLock}
              title={goal.isLocked ? 'Buka Kunci' : 'Kunci Goal'}
            >
              {goal.isLocked ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              onClick={onEdit}
              disabled={goal.isLocked}
              title={goal.isLocked ? 'Goal terkunci' : 'Edit Goal'}
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
              onClick={onDelete}
              disabled={goal.isLocked}
              title={goal.isLocked ? 'Goal terkunci' : 'Hapus Goal'}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}