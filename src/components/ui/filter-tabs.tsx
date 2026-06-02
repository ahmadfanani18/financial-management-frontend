'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FilterTab {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: 'default' | 'success' | 'warning' | 'destructive';
}

interface FilterTabsProps {
  tabs: FilterTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const FilterTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  FilterTabsProps
>(({ tabs, defaultValue, value, onValueChange, className }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || tabs[0]?.value);
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'destructive':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <TabsPrimitive.Root
      ref={ref}
      value={activeTab}
      onValueChange={handleValueChange}
      className={cn('w-full', className)}
    >
      <TabsPrimitive.List
        className={cn(
          'inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1.5',
          'w-full sm:w-auto overflow-x-auto scrollbar-hide'
        )}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium',
              'rounded-lg transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
              'disabled:pointer-events-none disabled:opacity-50',
              'whitespace-nowrap',
              'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted',
              'data-[state=active]:text-foreground'
            )}
          >
            {activeTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-white dark:bg-card shadow-sm border border-border/50"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                    activeTab === tab.value
                      ? getBadgeStyles(tab.badge)
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
});
FilterTabs.displayName = 'FilterTabs';

export { FilterTabs };
export type { FilterTab, FilterTabsProps };