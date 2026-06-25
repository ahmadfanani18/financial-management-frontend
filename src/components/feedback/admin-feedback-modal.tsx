'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { AdminFeedback } from '@/types/feedback';

interface AdminFeedbackModalProps {
  feedback: AdminFeedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminFeedbackModal({ feedback, open, onOpenChange }: AdminFeedbackModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; adminNote?: string }) =>
      fetch(`/api/admin/feedback/${feedback?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast.success('Status feedback diupdate');
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      onOpenChange(false);
    },
    onError: () => toast.error('Gagal update feedback'),
  });

  const handleSubmit = () => {
    updateMutation.mutate({
      status: status || undefined,
      adminNote: adminNote || undefined,
    });
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">User</p>
              <p className="font-medium">{feedback.user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{feedback.user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{feedback.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal</p>
              <p className="font-medium">{new Date(feedback.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">Subject</p>
            <p className="font-medium">{feedback.subject}</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{feedback.description}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Update Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={feedback.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Admin Note</label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Catatan internal (opsional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}