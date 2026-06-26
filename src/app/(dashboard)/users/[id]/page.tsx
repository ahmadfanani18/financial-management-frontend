'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminUserService } from '@/services/admin-user.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserProfileTab } from '@/components/admin/user-profile-tab';
import { UserSubscriptionTab } from '@/components/admin/user-subscription-tab';
import { UserActivityTab } from '@/components/admin/user-activity-tab';
import { useAuthStore } from '@/stores/auth.store';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuthStore();
  const router = useRouter();

  if (user?.role !== 'ADMIN') {
    router.push('/users');
    return null;
  }

  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminUserService.getUser(id),
  });

  if (isLoading) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">User not found</p>
        <Button asChild variant="outline">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/users">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Link>
      </Button>

      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-2xl">{user.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{user.role}</Badge>
            <Badge variant="outline">{user.subscriptionTier}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="bg-card p-6 rounded-lg border">
            <UserProfileTab user={user} />
          </div>
        </TabsContent>
        <TabsContent value="subscription" className="mt-6">
          <UserSubscriptionTab
            userId={user.id}
            currentTier={user.subscriptionTier}
            expiresAt={user.subscriptionEndAt}
          />
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <UserActivityTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
