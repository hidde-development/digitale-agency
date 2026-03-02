'use client';

import { useState, useCallback } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { SuggestedTasks } from './SuggestedTasks';
import { BriefingForm } from './BriefingForm';
import type { Briefing } from '@/types/chat';

interface EmptyStateProps {
  onSendMessage: (prompt: string, briefing?: Briefing) => void;
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  const { selectedAgent } = useAgent();
  const [briefing, setBriefing] = useState<Briefing>({});

  const handleSend = useCallback(
    (prompt: string) => {
      const hasContent = Object.values(briefing).some((v) => v?.trim());
      onSendMessage(prompt, hasContent ? briefing : undefined);
    },
    [briefing, onSendMessage]
  );

  if (!selectedAgent) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-4 text-5xl">{selectedAgent.avatar}</div>
      <h2 className="mb-1.5 text-2xl font-semibold text-[var(--text-primary)]">
        {selectedAgent.name}
      </h2>
      <p className="mb-6 max-w-lg text-center text-base text-[var(--text-secondary)]">
        {selectedAgent.description}
      </p>

      <div className="mb-6 w-full max-w-2xl">
        <BriefingForm onSave={setBriefing} />
      </div>

      {selectedAgent.suggestedTasks?.length > 0 && (
        <div className="w-full max-w-3xl">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Snel starten
          </p>
          <SuggestedTasks
            tasks={selectedAgent.suggestedTasks}
            onSelect={handleSend}
          />
        </div>
      )}
    </div>
  );
}
