'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type Notification } from '@/services/notification.service';
import { Button } from '@/components/ui/button';
import { Check, Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';

function getNotificationIcon(type: string) {
  const icons: Record<string, typeof Bell> = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    danger: XCircle,
  };
  const Icon = icons[type] || Bell;
  return <Icon className="w-5 h-5" />;
}

function formatTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications.markedRead'));
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications.allMarkedRead'));
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('notifications.title')}</h1>
          <p className="text-muted-foreground">{t('notifications.subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              markAllReadMutation.mutate();
              toast.success(t('notifications.markAllRead'));
            }}
            disabled={markAllReadMutation.isPending}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('notifications.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`group flex items-start gap-4 p-4 rounded-lg border border-border transition-all duration-150 cursor-pointer hover:border-primary/50 ${
                notification.isRead 
                  ? 'bg-muted/30 border-l-0' 
                  : 'bg-card border-l-[3px] border-l-primary'
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  markReadMutation.mutate(notification.id);
                  toast.success(t('notifications.markedAsRead'));
                }
              }}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-success/15 text-success' :
                notification.type === 'warning' ? 'bg-warning/15 text-warning' :
                notification.type === 'danger' ? 'bg-destructive/15 text-destructive' :
                notification.type === 'info' ? 'bg-info/15 text-info' :
                'bg-primary/15 text-primary'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{notification.title}</p>
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
