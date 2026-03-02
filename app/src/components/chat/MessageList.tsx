'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';
import { useAgent } from '@/hooks/useAgent';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onEditMessage?: (content: string) => void;
  onAgentClick?: (agentId: string) => void;
  conversationId?: string;
}

function AgentSwitchIndicator({ agentName, avatar }: { agentName: string; avatar: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-px flex-1 bg-[var(--primary-light)]" />
      <span className="flex items-center gap-1.5 rounded-full bg-[var(--primary-light)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-primary)]">
        {avatar} {agentName}
      </span>
      <div className="h-px flex-1 bg-[var(--primary-light)]" />
    </div>
  );
}

export function MessageList({ messages, isStreaming, onEditMessage, onAgentClick, conversationId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { agents } = useAgent();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const lastMessage = messages[messages.length - 1];
  const isLastAssistantStreaming =
    isStreaming && lastMessage?.role === 'assistant';

  // Track which agent was last active to detect switches
  let lastAgentId: string | undefined;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        {messages.map((message, index) => {
          const isStreamingMsg =
            isLastAssistantStreaming && index === messages.length - 1;

          // Show agent-switch indicator when agent changes
          let switchIndicator = null;
          if (message.role === 'assistant' && message.agentId && message.agentId !== lastAgentId) {
            const agent = agents.find((a) => a.id === message.agentId);
            if (agent && lastAgentId !== undefined) {
              switchIndicator = (
                <AgentSwitchIndicator
                  key={`switch-${message.id}`}
                  agentName={agent.name}
                  avatar={agent.avatar}
                />
              );
            }
          }
          if (message.role === 'assistant' && message.agentId) {
            lastAgentId = message.agentId;
          }

          if (isStreamingMsg) {
            return (
              <div key={message.id}>
                {switchIndicator}
                <StreamingMessage content={message.content} agentId={message.agentId} />
              </div>
            );
          }

          return (
            <div key={message.id}>
              {switchIndicator}
              <MessageBubble message={message} onEditMessage={onEditMessage} onAgentClick={onAgentClick} conversationId={conversationId} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
