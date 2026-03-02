'use client';

import type { AgentMeta } from '@/types/agent';

interface AgentCardProps {
  agent: AgentMeta;
  isSelected: boolean;
  onSelect: (agentId: string) => void;
}

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent.id)}
      className={`w-full rounded-lg border p-3.5 text-left transition-all ${
        isSelected
          ? 'border-[var(--color-primary)] bg-[var(--primary-light)]'
          : 'border-transparent bg-white hover:bg-[var(--bg-light)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{agent.avatar}</span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] font-medium ${
              isSelected
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--text-primary)]'
            }`}
          >
            {agent.name}
          </p>
          <p className="truncate text-sm text-[var(--text-secondary)]">
            {agent.description}
          </p>
        </div>
      </div>
    </button>
  );
}
