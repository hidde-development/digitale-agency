'use client';

import { useState } from 'react';
import type { SavedDocument } from '@/types/dashboard';
import { DOCUMENT_TYPE_LABELS } from '@/types/dashboard';
import { useAgent } from '@/hooks/useAgent';

interface DocumentCardProps {
  document: SavedDocument;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { agents } = useAgent();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const agent = agents.find((a) => a.id === document.agentId);
  const date = new Date(document.createdAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const preview = document.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .slice(0, 150);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {document.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--bg-light)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
              {DOCUMENT_TYPE_LABELS[document.type]}
            </span>
            {agent && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <span>{agent.avatar}</span>
                {agent.name}
              </span>
            )}
            <span className="text-xs text-[var(--text-secondary)]">{date}</span>
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        {expanded ? document.content.slice(0, 1000) : preview}
        {document.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-[var(--color-primary)] hover:underline"
          >
            {expanded ? 'Minder' : '...Meer'}
          </button>
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h5.5A1.5 1.5 0 0 1 14 3.5v7A1.5 1.5 0 0 1 12.5 12H7a1.5 1.5 0 0 1-1.5-1.5v-7Z" />
            <path d="M3 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 3 14h6a1.5 1.5 0 0 0 1.5-1.5V12H7a3 3 0 0 1-3-3V3.5H3Z" />
          </svg>
          {copied ? 'Gekopieerd!' : 'Kopieer'}
        </button>
        <button
          onClick={() => onDelete(document.id)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 1 5.357 15h5.285a1.5 1.5 0 0 1 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
          </svg>
          Verwijder
        </button>
      </div>
    </div>
  );
}
