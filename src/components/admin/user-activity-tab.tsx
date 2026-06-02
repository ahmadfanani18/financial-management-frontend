'use client';

import { useQuery } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin-user.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserActivityTabProps {
  userId: string;
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-activity', userId],
    queryFn: () => adminUserService.getUserActivity(userId),
  });

  if (isLoading) return <div className="h-32 bg-muted animate-pulse rounded-lg" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Login History</CardTitle></CardHeader>
        <CardContent>
          {data?.logins?.length ? (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Timestamp</TableHead><TableHead>IP</TableHead><TableHead>Device</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.logins.map((l: any, i: number) => (
                  <TableRow key={i}><TableCell>{new Date(l.timestamp).toLocaleString('id-ID')}</TableCell><TableCell>{l.ip}</TableCell><TableCell>{l.device}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-muted-foreground">No login history</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Action Log</CardTitle></CardHeader>
        <CardContent>
          {data?.actions?.length ? (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Details</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.actions.map((a: any, i: number) => (
                  <TableRow key={i}><TableCell>{new Date(a.time).toLocaleString('id-ID')}</TableCell><TableCell>{a.type}</TableCell><TableCell>{a.details}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-muted-foreground">No action history</p>}
        </CardContent>
      </Card>
    </div>
  );
}