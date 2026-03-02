'use client';

import { useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAgent } from '@/hooks/useAgent';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { BriefingPanel } from './BriefingPanel';
import type { Briefing } from '@/types/chat';

export function ChatContainer() {
  const { messages, isStreaming, sendMessage, stopStreaming, updateBriefing, activeConversation } = useChat();
  const [editValue, setEditValue] = useState<string | null>(null);
  const clearEdit = useCallback(() => setEditValue(null), []);
  const { selectedAgent, loading, selectAgent } = useAgent();

  const handleEmptySend = useCallback(
    (prompt: string, briefing?: Briefing) => {
      sendMessage(prompt, undefined, briefing);
    },
    [sendMessage]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!selectedAgent) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-secondary)]">
        Selecteer een agent om te starten.
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasMessages ? (
        <>
          <BriefingPanel
            briefing={activeConversation?.briefing}
            onUpdate={(b) => activeConversation && updateBriefing(activeConversation.id, b)}
          />
          <MessageList messages={messages} isStreaming={isStreaming} onEditMessage={setEditValue} onAgentClick={selectAgent} conversationId={activeConversation?.id} />
        </>
      ) : (
        <EmptyState onSendMessage={handleEmptySend} />
      )}
      <ChatInput onSend={sendMessage} onStop={stopStreaming} disabled={isStreaming} editValue={editValue} onEditClear={clearEdit} />
    </div>
  );
}
