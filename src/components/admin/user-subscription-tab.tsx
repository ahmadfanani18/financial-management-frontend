'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin-user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Snowflake, XCircle } from 'lucide-react';

interface UserSubscriptionTabProps {
  userId: string;
  currentTier: string;
  expiresAt?: string;
}

export function UserSubscriptionTab({ userId, currentTier, expiresAt }: UserSubscriptionTabProps) {
  const queryClient = useQueryClient();
  const [extendDays, setExtendDays] = useState('');

  const extendMutation = useMutation({
    mutationFn: (days: number) => adminUserService.extendSubscription(userId, days),
    onSuccess: () => { toast.success('Extended'); setExtendDays(''); queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }); },
    onError: () => toast.error('Failed'),
  });

  const tierMutation = useMutation({
    mutationFn: (tier: string) => adminUserService.changeTier(userId, tier),
    onSuccess: () => { toast.success('Tier changed'); queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }); },
    onError: () => toast.error('Failed'),
  });

  const freezeMutation = useMutation({
    mutationFn: (reason: string) => adminUserService.freezeAccount(userId, reason),
    onSuccess: () => { toast.success('Account frozen'); queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }); },
    onError: () => toast.error('Failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => adminUserService.cancelSubscription(userId),
    onSuccess: () => { toast.success('Cancelled'); queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }); },
    onError: () => toast.error('Failed'),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Current Subscription</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <p className="text-xl font-bold">{currentTier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="text-xl font-bold">{expiresAt ? new Date(expiresAt).toLocaleDateString('id-ID') : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Manage Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Extend (days)</Label>
              <Input type="number" placeholder="e.g. 30" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
            </div>
            <Button onClick={() => extendDays && extendMutation.mutate(parseInt(extendDays))} disabled={!extendDays || extendMutation.isPending}>
              <Calendar className="h-4 w-4 mr-2" />Extend
            </Button>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Change Tier</Label>
              <Select value={currentTier} onValueChange={(tier) => tierMutation.mutate(tier)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { const r = window.prompt('Reason:'); if (r) freezeMutation.mutate(r); }} disabled={freezeMutation.isPending}>
              <Snowflake className="h-4 w-4 mr-2" />Freeze
            </Button>
            <Button variant="outline" className="dark:text-red-500" onClick={() => { if (window.confirm('Cancel?')) cancelMutation.mutate(); }} disabled={cancelMutation.isPending}>
              <XCircle className="h-4 w-4 mr-2" />Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}