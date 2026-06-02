'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>
        <CollapsiblePrimitive.Trigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
          {title}
          <ChevronDown className="h-4 w-4 text-muted-foreground data-[state=open]:rotate-180 transition-transform" />
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {children}
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </div>
  );
}
