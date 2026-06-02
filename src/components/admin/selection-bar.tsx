'use client';

import { Button } from '@/components/ui/button';
import { Mail, X } from 'lucide-react';

interface SelectionBarProps {
  selectedCount: number;
  onSendReminder: () => void;
  onClear: () => void;
}

export function SelectionBar({ selectedCount, onSendReminder, onClear }: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card border rounded-full px-6 py-3 shadow-lg animate-in slide-in-from-bottom-4">
      <span className="text-sm font-medium">
        {selectedCount} subscription selected
      </span>
      <div className="w-px h-6 bg-border" />
      <Button size="sm" onClick={onSendReminder}>
        <Mail className="h-4 w-4 mr-2" />
        Send Reminder
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
