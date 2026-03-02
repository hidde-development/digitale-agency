'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAgent } from '@/hooks/useAgent';
import { DocumentCard } from './DocumentCard';
import type { DocumentType } from '@/types/dashboard';
import { DOCUMENT_TYPE_LABELS } from '@/types/dashboard';

const ALL_TYPES: DocumentType[] = ['artikel', 'social-post', 'ad', 'analyse', 'persona'];

export function DocumentsTab() {
  const { documents, deleteDocument } = useDashboard();
  const { agents } = useAgent();
  const [typeFilter, setTypeFilter] = useState<DocumentType | null>(null);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    if (typeFilter && d.type !== typeFilter) return false;
    if (agentFilter && d.agentId !== agentFilter) return false;
    return true;
  });

  const usedAgentIds = [...new Set(documents.map((d) => d.agentId))];

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !typeFilter
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Alle types
        </button>
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              typeFilter === type
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {DOCUMENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {usedAgentIds.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setAgentFilter(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !agentFilter
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Alle agents
          </button>
          {usedAgentIds.map((agentId) => {
            const agent = agents.find((a) => a.id === agentId);
            return (
              <button
                key={agentId}
                onClick={() => setAgentFilter(agentFilter === agentId ? null : agentId)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  agentFilter === agentId
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {agent ? `${agent.avatar} ${agent.name}` : agentId}
              </button>
            );
          })}
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-3 h-10 w-10 text-[var(--text-secondary)] opacity-40">
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
          </svg>
          <p className="text-sm text-[var(--text-secondary)]">
            Geen documenten opgeslagen
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Sla documenten op vanuit een chat om ze hier terug te vinden.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={deleteDocument} />
          ))}
        </div>
      )}
    </div>
  );
}
