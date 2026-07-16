'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useChatStore } from '@/hooks/use-chat-store';
import type { ConversationSummary } from '@/services/ai.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChatSidebarProps {
  isOpen: boolean;
}

function groupConversationsByDate(conversations: ConversationSummary[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { [key: string]: ConversationSummary[] } = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Older': [],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.updatedAt);
    const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

    if (convDay.getTime() >= today.getTime()) {
      groups['Today'].push(conv);
    } else if (convDay.getTime() >= yesterday.getTime()) {
      groups['Yesterday'].push(conv);
    } else if (convDay.getTime() >= thisWeek.getTime()) {
      groups['This Week'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  });

  return groups;
}

export function ChatSidebar({ isOpen }: ChatSidebarProps) {
  const { conversations, conversationId, selectConversation, startNewChat, deleteConversation } = useChatStore();
  const groups = groupConversationsByDate(conversations);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isOpen) {
    return (
      <div className="w-16 border-r flex flex-col">
        <div className="p-2 border-b dark:border-neutral-800 flex flex-col gap-2">
          <button
            onClick={startNewChat}
            className="w-10 h-10 mx-auto bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          <div className="space-y-1">
            {conversations.slice(0, 5).map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                  conv.id === conversationId
                    ? 'bg-primary/20'
                    : 'hover:bg-muted-foreground/20 dark:hover:bg-neutral-700'
                }`}
                title={conv.title}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-muted border-r flex flex-col dark:bg-neutral-900">
      <div className="p-3 border-b dark:border-neutral-800 flex gap-2">
        <button
          onClick={startNewChat}
          className="flex-1 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No conversations yet</p>
        ) : (
          Object.entries(groups).map(( [groupName, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={groupName} className="mb-3">
                <p className="text-xs text-muted-foreground uppercase font-semibold px-2 py-1">
                  {groupName}
                </p>
                <div className="space-y-1">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        conv.id === conversationId
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'hover:bg-muted-foreground/10 text-foreground dark:hover:bg-neutral-700'
                      }`}
                    >
                      <button
                        onClick={() => selectConversation(conv.id)}
                        className="flex-1 truncate"
                      >
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">{conv.messageCount} messages</p>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus percakapan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Aksi ini tidak dapat dibatalkan. Semua pesan dalam percakapan ini akan dihapus.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (deleteId) {
                                  deleteConversation(deleteId);
                                  setDeleteId(null);
                                }
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
