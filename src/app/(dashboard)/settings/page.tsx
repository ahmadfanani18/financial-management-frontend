'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { Globe, Moon, Sun, Monitor, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function SettingsPage() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('id');
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userService.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(t('settings.profileSuccess'));
    },
    onError: () => {
      toast.error(t('settings.profileFailed'));
    },
  });

  const { data: notificationPrefs, isLoading: loadingPrefs } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: userService.getNotificationPreferences,
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async (key: keyof import('@/services/user.service').NotificationPreferences) => {
      const newValue = !notificationPrefs?.[key];
      return userService.updateNotificationPreferences({ [key]: newValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success(t('settings.preferencesSaved'));
    },
    onError: () => {
      toast.error(t('settings.preferencesFailed'));
    },
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('settings.securitySection.success'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('settings.securitySection.failed'));
    },
  });

  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const themes = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const languages = [
    { code: 'id', label: t('settings.indonesian'), flag: '🇮🇩' },
    { code: 'en', label: t('settings.english'), flag: '🇺🇸' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.securityTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse" />
                    <div className="h-3 w-48 bg-muted animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileSection.title')}</CardTitle>
                <CardDescription>{t('settings.profileSection.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || '-'}</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('settings.profileSection.name')}</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('settings.profileSection.name')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('settings.profileSection.email')}</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">{t('settings.profileSection.emailCannotChange')}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    updateMutation.mutate({ name });
                    toast.success(t('settings.profileSection.nameSuccess'));
                  }}
                  disabled={updateMutation.isPending || name === user?.name}
                >
                  {updateMutation.isPending ? t('common.saving') : t('settings.profileSection.saveChanges')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.themeTitle')}</CardTitle>
              <CardDescription>{t('settings.themeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                        theme === t.value ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.languageTitle')}
              </CardTitle>
              <CardDescription>{t('settings.languageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-colors',
                      language === lang.code ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {loadingPrefs ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center justify-between h-12">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse" />
                      <div className="h-3 w-48 bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('settings.notificationsTitle')}
                </CardTitle>
                <CardDescription>{t('settings.notificationsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'budgetWarning' as const, labelKey: 'budgetWarning', descKey: 'budgetWarningDesc' },
                  { key: 'goalMilestone' as const, labelKey: 'goalMilestone', descKey: 'goalMilestoneDesc' },
                  { key: 'planReminder' as const, labelKey: 'planReminder', descKey: 'planReminderDesc' },
                  { key: 'accountAlert' as const, labelKey: 'accountAlert', descKey: 'accountAlertDesc' },
                  { key: 'dailySummary' as const, labelKey: 'dailySummary', descKey: 'dailySummaryDesc' },
                  { key: 'recurringTransaction' as const, labelKey: 'recurringTransaction', descKey: 'recurringTransactionDesc' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t(`settings.notificationSettings.${item.labelKey}`)}</p>
                      <p className="text-sm text-muted-foreground">{t(`settings.notificationSettings.${item.descKey}`)}</p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.[item.key] ?? true}
                      onCheckedChange={() => {
                      updatePrefsMutation.mutate(item.key);
                      toast.success(t('settings.preferencesSaved'));
                    }}
                      disabled={updatePrefsMutation.isPending}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('settings.securitySection.title')}
              </CardTitle>
              <CardDescription>{t('settings.securitySection.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.securitySection.changePassword')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.securitySection.changePasswordDesc')}</p>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>{t('settings.securitySection.change')}</Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings.securitySection.changePassword')}</DialogTitle>
                <DialogDescription>{t('settings.securitySection.changePasswordDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('settings.securitySection.currentPassword')}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('settings.securitySection.enterCurrentPassword')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('settings.securitySection.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settings.securitySection.enterNewPassword')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('settings.securitySection.confirmNewPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('settings.securitySection.enterConfirmPassword')}
                  />
                </div>
                {newPassword !== confirmPassword && newPassword && confirmPassword && (
                  <p className="text-sm text-destructive">{t('settings.securitySection.passwordNotMatch')}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>{t('common.cancel')}</Button>
                <Button
                  onClick={() => {
                    changePasswordMutation.mutate({ currentPassword, newPassword });
                    toast.success(t('settings.passwordChanged'));
                  }}
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 6 || changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
