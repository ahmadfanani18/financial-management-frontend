'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, Bell, Globe, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/services/user.service';
import { notificationService } from '@/services/notification.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function Header() {
  const { setTheme, theme } = useTheme();
  const [lang, setLang] = useState('id');

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: userService.getProfile,
    retry: 1,
  });

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 lg:px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="mr-2"><Menu className="h-5 w-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0"><Sidebar /></SheetContent>
      </Sheet>

      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari transaksi, akun, atau kategori..." className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-primary/20" />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><Globe className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setLang('id')} className={lang === 'id' ? 'bg-accent' : ''}><span className="mr-2">🇮🇩</span> Indonesia</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'bg-accent' : ''}><span className="mr-2">🇬🇧</span> English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {unreadCount}
                </motion.span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              {unreadCount > 0 && <Badge variant="secondary" size="sm">{unreadCount} baru</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Belum ada notifikasi</div>
              ) : (
                notifications.slice(0, 5).map((notification: { id: string; title: string; message: string; isRead: boolean; createdAt: string }) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">Lihat semua notifikasi</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 pl-2 pr-3 rounded-xl gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary/30">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{userData?.name || 'User'}</span>
                <span className="text-[10px] text-muted-foreground">{userData?.role || 'Member'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}><User className="mr-2 h-4 w-4" />Profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}><Settings className="mr-2 h-4 w-4" />Pengaturan</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer" 
              onClick={() => {
                authService.logout();
                useAuthStore.getState().logout();
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
