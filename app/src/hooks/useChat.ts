'use client';

import { useCallback } from 'react';
import { useChatContext } from '@/providers/ChatProvider';
import { useAgent } from './useAgent';
import { useRules } from './useRules';
import type { Attachment, Briefing } from '@/types/chat';

export function useChat() {
  const {
    isStreaming,
    sendMessage,
    stopStreaming,
    createConversation,
    setActiveConversation,
    deleteConversation,
    updateTitle,
    updateBriefing,
    togglePin,
    getAllConversations,
    activeConversation,
  } = useChatContext();
  const { selectedAgentId } = useAgent();
  const { rules } = useRules();

  const messages = activeConversation?.messages ?? [];
  const allConversations = getAllConversations();

  const send = useCallback(
    async (content: string, attachments?: Attachment[], briefing?: Briefing) => {
      if (!selectedAgentId) return;
      await sendMessage(content, selectedAgentId, undefined, attachments, rules || undefined, briefing);
    },
    [selectedAgentId, sendMessage, rules]
  );

  const newConversation = useCallback(() => {
    if (!selectedAgentId) return;
    createConversation(selectedAgentId);
  }, [selectedAgentId, createConversation]);

  return {
    messages,
    isStreaming,
    sendMessage: send,
    stopStreaming,
    newConversation,
    setActiveConversation,
    deleteConversation,
    updateTitle,
    updateBriefing,
    togglePin,
    allConversations,
    activeConversation,
    activeConversationId: activeConversation?.id ?? null,
  };
}
