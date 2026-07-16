'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MessageSquare, Settings, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useChatStore } from '@/hooks/use-chat-store';
import { ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { QuotaIndicator } from './quota-indicator';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from './chat-sidebar';

export function ChatTab() {
  const { messages, isLoading, quota, sendMessage, clearHistory, loadQuota, loadHistory, loadConversations } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadQuota();
    loadHistory();
    loadConversations();
  }, [loadQuota, loadHistory, loadConversations]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { data: apiKeysStatus } = useQuery({
    queryKey: ['apiKeysStatus'],
    queryFn: userService.getApiKeysStatus,
    retry: false,
  });

  const hasApiKey = apiKeysStatus?.hasAnyKey ?? false;

  if (!hasApiKey) {
    return (
      <div className="border rounded-xl bg-card h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Assistant
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold">API Key Required</h3>
            <p className="text-sm text-muted-foreground">Silakan isi API key di Settings</p>
            <Button asChild size="sm">
              <Link href="/settings?tab=security">
                <Settings className="h-4 w-4 mr-1" />
                Go to Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card h-full flex overflow-hidden">
      <ChatSidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex-shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Assistant
            </h3>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearHistory} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {quota && (
          <div className="px-4 py-2 border-b flex-shrink-0">
            <QuotaIndicator />
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center text-center" style={{ minHeight: '300px' }}>
                <div>
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada percakapan.<br />
                    Tanyakan sesuatu!
                  </p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-background flex-shrink-0">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
