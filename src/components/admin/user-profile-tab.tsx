'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService, type AdminUser } from '@/services/admin-user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { toast } from 'sonner';
import { Key } from 'lucide-react';

interface UserProfileTabProps {
  user: AdminUser;
}

export function UserProfileTab({ user }: UserProfileTabProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AdminUser>) => adminUserService.updateUser(user.id, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const resetMutation = useMutation({
    mutationFn: () => adminUserService.resetPassword(user.id),
    onSuccess: () => toast.success('Reset email sent'),
    onError: () => toast.error('Failed to send reset'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={formData.role} onValueChange={(v) => setFormData(f => ({ ...f, role: v as AdminUser['role'] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
          <Key className="h-4 w-4 mr-2" />Reset Password
        </Button>
      </div>
    </form>
  );
}