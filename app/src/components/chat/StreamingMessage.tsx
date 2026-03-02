'use client';

import { useAgent } from '@/hooks/useAgent';
import { MarkdownRenderer } from './MarkdownRenderer';

interface StreamingMessageProps {
  content: string;
  agentId?: string;
}

function isStructuredContent(content: string): boolean {
  const headingCount = (content.match(/^#{1,3}\s/gm) || []).length;
  const hasMultipleHeadings = headingCount >= 2;
  const isLong = content.length > 600;
  const hasListsAndHeadings =
    headingCount >= 1 && (content.match(/^[-*]\s/gm) || []).length >= 3;

  return (hasMultipleHeadings && isLong) || hasListsAndHeadings;
}

const cursor = (
  <span className="ml-0.5 inline-block h-5 w-1.5 animate-pulse rounded-sm bg-[var(--color-primary)]" />
);

export function StreamingMessage({ content, agentId }: StreamingMessageProps) {
  const { agents, selectedAgent } = useAgent();

  const messageAgent = agentId
    ? agents.find((a) => a.id === agentId)
    : selectedAgent;

  const isReport = isStructuredContent(content);

  if (isReport) {
    return (
      <div className="flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-light)] text-base">
          {messageAgent?.avatar ?? '🤖'}
        </div>
        <div className="min-w-0 flex-1">
          {messageAgent && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {messageAgent.name}
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/40" />
            <div className="p-6">
              <MarkdownRenderer content={content} isReport />
              {cursor}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-light)] text-base">
        {messageAgent?.avatar ?? '🤖'}
      </div>
      <div className="max-w-[85%] rounded-2xl bg-[var(--bg-light)] px-5 py-3 text-[15px] leading-relaxed text-[var(--text-primary)]">
        {messageAgent && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {messageAgent.name}
          </p>
        )}
        <div>
          <MarkdownRenderer content={content} />
          {cursor}
        </div>
      </div>
    </div>
  );
}
