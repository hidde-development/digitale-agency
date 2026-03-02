'use client';

import { useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { MAX_CONTEXT_TOKENS, TOKEN_WARNING_THRESHOLD, TOKEN_DANGER_THRESHOLD } from '@/lib/token-counter';

function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

export function TokenCounter() {
  const { messages } = useChat();

  const usage = useMemo(() => {
    // Sum actual input_tokens from API usage data across all messages in this conversation
    const totalUsed = messages.reduce((sum, m) => {
      if (m.usage) {
        return sum + m.usage.input_tokens + m.usage.output_tokens;
      }
      return sum;
    }, 0);

    const percentage = totalUsed / MAX_CONTEXT_TOKENS;

    let status: 'ok' | 'warning' | 'danger' = 'ok';
    if (percentage >= TOKEN_DANGER_THRESHOLD) {
      status = 'danger';
    } else if (percentage >= TOKEN_WARNING_THRESHOLD) {
      status = 'warning';
    }

    return { totalUsed, percentage, status };
  }, [messages]);

  // Don't show when no usage data yet
  if (usage.totalUsed === 0) return null;

  const colorClass =
    usage.status === 'danger'
      ? 'text-red-500'
      : usage.status === 'warning'
        ? 'text-amber-500'
        : 'text-[var(--text-secondary)]';

  const barColor =
    usage.status === 'danger'
      ? 'bg-red-500'
      : usage.status === 'warning'
        ? 'bg-amber-500'
        : 'bg-[var(--color-primary)]';

  return (
    <div
      className="flex items-center gap-2"
      title={`${formatTokenCount(usage.totalUsed)} / ${formatTokenCount(MAX_CONTEXT_TOKENS)} tokens gebruikt in dit gesprek`}
    >
      {/* Mini progress bar */}
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(usage.percentage * 100, 100)}%` }}
        />
      </div>
      {/* Token count / max */}
      <span className={`text-[11px] tabular-nums ${colorClass}`}>
        {formatTokenCount(usage.totalUsed)} / {formatTokenCount(MAX_CONTEXT_TOKENS)}
      </span>
    </div>
  );
}
