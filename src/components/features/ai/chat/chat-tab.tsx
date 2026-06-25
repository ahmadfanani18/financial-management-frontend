'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useChatStore } from '@/hooks/use-chat-store';
import { ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { QuotaIndicator } from './quota-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChatTab() {
  const { messages, isLoading, quota, sendMessage, clearHistory, loadQuota } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearHistory}
              disabled={isLoading}
              title="Hapus riwayat"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        {quota && <QuotaIndicator />}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-2">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Belum ada percakapan.<br />
                  Tanyakan sesuatu tentang keuanganmu!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
          )}
        </div>

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
