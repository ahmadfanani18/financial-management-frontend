'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminUserService } from '@/services/admin-user.service';
import { UserTable } from '@/components/admin/user-table';
import { UserFilters } from '@/components/admin/user-filters';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    tier: 'all',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, filters],
    queryFn: () => adminUserService.listUsers({
      page,
      limit: 20,
      search: filters.search || undefined,
      role: filters.role !== 'all' ? filters.role : undefined,
      tier: filters.tier !== 'all' ? filters.tier : undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminUserService.deleteUser,
    onSuccess: () => {
      toast.success('User deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to deactivate user'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <UserFilters
        search={filters.search}
        role={filters.role}
        tier={filters.tier}
        onSearchChange={(v) => { setFilters(f => ({ ...f, search: v })); setPage(1); }}
        onRoleChange={(v) => { setFilters(f => ({ ...f, role: v })); setPage(1); }}
        onTierChange={(v) => { setFilters(f => ({ ...f, tier: v })); setPage(1); }}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <UserTable
            users={data?.users || []}
            onDelete={(id) => deleteMutation.mutate(id)}
          />

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
