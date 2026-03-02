'use client';

import { useState, useCallback } from 'react';
import { useDashboard } from '@/hooks/useDashboard';

interface MessageActionsProps {
  content: string;
  role: 'user' | 'assistant';
  onEdit?: (content: string) => void;
  messageId?: string;
  conversationId?: string;
  agentId?: string;
}

export function MessageActions({ content, role, onEdit, messageId, conversationId, agentId }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const { addFeedback, getFeedbackForMessage } = useDashboard();

  const existingFeedback = messageId ? getFeedbackForMessage(messageId) : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleFeedback = useCallback(
    (rating: 'positive' | 'negative') => {
      if (!messageId || !conversationId || existingFeedback) return;

      if (rating === 'negative') {
        setShowFeedbackInput(true);
        return;
      }

      addFeedback({
        messageId,
        conversationId,
        rating,
        agentId: agentId || '',
      });
    },
    [messageId, conversationId, agentId, existingFeedback, addFeedback]
  );

  const submitNegativeFeedback = useCallback(() => {
    if (!messageId || !conversationId) return;
    addFeedback({
      messageId,
      conversationId,
      rating: 'negative',
      comment: feedbackComment.trim() || undefined,
      agentId: agentId || '',
    });
    setShowFeedbackInput(false);
    setFeedbackComment('');
  }, [messageId, conversationId, agentId, feedbackComment, addFeedback]);

  return (
    <div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Copy button — shown for all messages */}
        <button
          onClick={handleCopy}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]"
          title="Kopieer naar klembord"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-green-500">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <span className="text-green-500">Gekopieerd</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
              </svg>
              <span>Kopieer</span>
            </>
          )}
        </button>

        {/* Edit button — only for user messages */}
        {role === 'user' && onEdit && (
          <button
            onClick={() => onEdit(content)}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]"
            title="Bewerk bericht"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
            <span>Bewerk</span>
          </button>
        )}

        {/* Feedback buttons — only for assistant messages */}
        {role === 'assistant' && messageId && (
          <>
            <button
              onClick={() => handleFeedback('positive')}
              disabled={!!existingFeedback}
              className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs transition-colors ${
                existingFeedback?.rating === 'positive'
                  ? 'text-green-500'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)] hover:text-green-500'
              } disabled:cursor-default`}
              title="Goed antwoord"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974 1.749 1.749 0 0 1-1.6 1.029H12.5a.25.25 0 0 1-.177-.073l-2.396-2.396A3.502 3.502 0 0 1 9 10.958V5.5a3.5 3.5 0 0 1 2-3.163V3Z" />
              </svg>
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              disabled={!!existingFeedback}
              className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs transition-colors ${
                existingFeedback?.rating === 'negative'
                  ? 'text-red-500'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)] hover:text-red-500'
              } disabled:cursor-default`}
              title="Kan beter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M19 11.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 1 1 2.5 0v7.5ZM9 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 6 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.242 0-2.26-1.01-2.146-2.247.193-2.08.652-4.082 1.341-5.974A1.749 1.749 0 0 1 4.044 3.75H7.5a.25.25 0 0 1 .177.073l2.396 2.396A3.502 3.502 0 0 1 11 9.042V14.5a3.5 3.5 0 0 1-2 3.163V17Z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Inline feedback comment */}
      {showFeedbackInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Wat kan beter? (optioneel)"
            className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitNegativeFeedback();
              if (e.key === 'Escape') setShowFeedbackInput(false);
            }}
            autoFocus
          />
          <button
            onClick={submitNegativeFeedback}
            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
          >
            Verstuur
          </button>
          <button
            onClick={() => setShowFeedbackInput(false)}
            className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)]"
          >
            Annuleer
          </button>
        </div>
      )}
    </div>
  );
}
