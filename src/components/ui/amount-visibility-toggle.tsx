'use client';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AmountVisibilityToggleProps {
  isHidden: boolean;
  onToggle: () => void;
}

export function AmountVisibilityToggle({ isHidden, onToggle }: AmountVisibilityToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      title={isHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
      className="text-muted-foreground hover:text-foreground"
    >
      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}
