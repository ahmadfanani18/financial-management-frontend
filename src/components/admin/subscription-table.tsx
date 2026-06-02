'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface SubscriptionTableProps {
  title: string;
  items: any[];
  type: 'active' | 'pending' | 'expiring';
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  isSelectionEnabled?: boolean;
  isCollapsed?: boolean;
}

export function SubscriptionTable({ 
  title, 
  items, 
  type, 
  selectedIds,
  onSelectionChange,
  isSelectionEnabled = true,
  isCollapsed = false,
}: SubscriptionTableProps) {
  const getBadge = (item: any) => {
    if (type === 'pending') return <Badge variant="warning">Pending</Badge>;
    if (type === 'expiring') {
      const expirationDate = item.subscriptionEndAt || item.subscriptionExpiresAt;
      const daysLeft = expirationDate
        ? Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      return <Badge variant="destructive">{daysLeft} days</Badge>;
    }
    return <Badge>Active</Badge>;
  };

  const getItemId = (item: any) => item.id || item.userId;

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(getItemId(item)));

  const toggleAll = () => {
    if (allSelected) {
      const newIds = new Set(selectedIds);
      items.forEach((item) => newIds.delete(getItemId(item)));
      onSelectionChange(newIds);
    } else {
      const newIds = new Set(selectedIds);
      items.forEach((item) => newIds.add(getItemId(item)));
      onSelectionChange(newIds);
    }
  };

  const toggleItem = (item: any) => {
    const id = getItemId(item);
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {!isCollapsed && (
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionEnabled && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>{type !== 'pending' ? 'Expires' : 'Created'}</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const itemId = getItemId(item);
              return (
                <TableRow key={item.id || item.userId}>
                  {isSelectionEnabled && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(itemId)}
                        onCheckedChange={() => toggleItem(item)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{item.name || item.user?.name || '-'}</TableCell>
                  <TableCell>{item.email || item.user?.email || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.subscriptionEndAt
                      ? new Date(item.subscriptionEndAt).toLocaleDateString('id-ID')
                      : item.subscriptionExpiresAt
                      ? new Date(item.subscriptionExpiresAt).toLocaleDateString('id-ID')
                      : item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell>{getBadge(item)}</TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSelectionEnabled ? 5 : 4} className="text-center py-8 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
