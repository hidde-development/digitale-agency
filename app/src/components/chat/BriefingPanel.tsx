'use client';

import { useState } from 'react';
import { BriefingForm } from './BriefingForm';
import type { Briefing } from '@/types/chat';

interface BriefingPanelProps {
  briefing?: Briefing;
  onUpdate: (briefing: Briefing) => void;
}

export function BriefingPanel({ briefing, onUpdate }: BriefingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!briefing || !Object.values(briefing).some((v) => v?.trim())) {
    return null;
  }

  const filledFields = Object.entries(briefing)
    .filter(([, v]) => v?.trim())
    .map(([k]) => {
      const labels: Record<string, string> = {
        merk: 'Merk',
        doel: 'Doel',
        doelgroep: 'Doelgroep',
        kanaal: 'Kanaal',
        context: 'Context',
      };
      return labels[k] ?? k;
    });

  return (
    <div className="border-b border-border bg-[var(--bg-light)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-6 py-2 text-left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--color-primary)]">
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0-6a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          Briefing: {filledFields.join(', ')}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`ml-auto h-3.5 w-3.5 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-3">
          <BriefingForm initialData={briefing} onSave={onUpdate} />
        </div>
      )}
    </div>
  );
}
