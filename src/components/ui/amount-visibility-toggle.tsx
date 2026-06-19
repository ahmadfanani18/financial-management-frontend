'use client';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';

interface AmountVisibilityToggleProps {
  pageKey: string;
}

export function AmountVisibilityToggle({ pageKey }: AmountVisibilityToggleProps) {
  const { isHidden, toggle } = useAmountVisibility(pageKey);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      title={isHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
      className="text-muted-foreground hover:text-foreground"
    >
      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}
