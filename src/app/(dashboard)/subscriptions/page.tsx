'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSubscriptionService } from '@/services/admin-subscription.service';
import { StatsCards } from '@/components/admin/stats-cards';
import { SubscriptionTable } from '@/components/admin/subscription-table';
import { CollapsibleSection } from '@/components/ui/collapsible';
import { SelectionBar } from '@/components/admin/selection-bar';
import { ConfirmationModal } from '@/components/admin/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptionsPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: adminSubscriptionService.getOverview,
  });

  const sendReminderMutation = useMutation({
    mutationFn: (userIds: string[]) => adminSubscriptionService.sendReminders(userIds),
    onSuccess: (result) => {
      const { sent, failed } = result;

      if (failed === 0) {
        toast.success(`Reminder berhasil dikirim ke ${sent} subscriber`);
      } else {
        const errors = result.results
          .filter((r) => r.status === 'failed')
          .map((r) => r.error)
          .join(', ');
        toast.warning(`Reminder dikirim ke ${sent} subscriber, ${failed} gagal${errors ? `: ${errors}` : ''}`);
      }

      setSelectedIds(new Set());
      setShowConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
    onError: (error) => {
      toast.error(`Gagal mengirim reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleSendReminder = () => {
    sendReminderMutation.mutate(Array.from(selectedIds));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {data && (
        <>
          <StatsCards stats={data.overview} />
          <div className="space-y-4">
            <CollapsibleSection title={`Active Subscriptions (${data.active.length})`} defaultOpen={true}>
              <SubscriptionTable
                title=""
                items={data.active}
                type="active"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </CollapsibleSection>

            <CollapsibleSection title={`Pending Payments (${data.pending.length})`} defaultOpen={false}>
              <SubscriptionTable
                title=""
                items={data.pending}
                type="pending"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </CollapsibleSection>

            <CollapsibleSection title={`Expiring Soon (30 days) (${data.expiring.length})`} defaultOpen={false}>
              <SubscriptionTable
                title=""
                items={data.expiring}
                type="expiring"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </CollapsibleSection>
          </div>
        </>
      )}

      <SelectionBar
        selectedCount={selectedIds.size}
        onSendReminder={() => setShowConfirmModal(true)}
        onClear={() => setSelectedIds(new Set())}
      />

      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Kirim Renewal Reminder"
        description={`Kirim email reminder ke ${selectedIds.size} subscriber?`}
        onConfirm={handleSendReminder}
        isLoading={sendReminderMutation.isPending}
      />
    </div>
  );
}
