'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { AdminUser } from '@/services/admin-user.service';

interface UserTableProps {
  users: AdminUser[];
  onDelete?: (id: string) => void;
}

export function UserTable({ users, onDelete }: UserTableProps) {
  const getBadgeColor = (value: string, type: 'role' | 'tier' | 'status') => {
    if (type === 'role') return value === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
    if (type === 'tier') {
      if (value === 'PRO') return 'bg-purple-100 text-purple-800';
      if (value === 'TRIAL') return 'bg-yellow-100 text-yellow-800';
      return 'bg-gray-100 text-gray-800';
    }
    if (type === 'status') {
      if (value === 'ACTIVE') return 'bg-green-100 text-green-800';
      if (value === 'SUSPENDED') return 'bg-red-100 text-red-800';
      return 'bg-gray-100 text-gray-800';
    }
    return '';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tier</TableHead>
            
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge className={getBadgeColor(user.role, 'role')}>{user.role}</Badge></TableCell>
              <TableCell><Badge className={getBadgeColor(user.subscriptionTier, 'tier')}>{user.subscriptionTier}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/users/${user.id}`}><Eye className="h-4 w-4 mr-2" />View</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/users/${user.id}?tab=profile`}><Edit className="h-4 w-4 mr-2" />Edit</Link></DropdownMenuItem>
                    <DropdownMenuItem className="dark:text-red-500" onClick={() => onDelete?.(user.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}