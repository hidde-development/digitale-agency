'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Briefing } from '@/types/chat';

interface BriefingFormProps {
  initialData?: Briefing;
  onSave: (briefing: Briefing) => void;
}

const FIELDS: { key: keyof Briefing; label: string; placeholder: string }[] = [
  { key: 'merk', label: 'Merk / organisatie', placeholder: 'Bijv. Acme B.V.' },
  { key: 'doel', label: 'Doel', placeholder: 'Wat wil je bereiken?' },
  { key: 'doelgroep', label: 'Doelgroep', placeholder: 'Voor wie is dit bedoeld?' },
  { key: 'kanaal', label: 'Kanaal', placeholder: 'Bijv. LinkedIn, website, Google Ads' },
  { key: 'context', label: 'Context / bron', placeholder: 'URL, referentie of achtergrondinformatie' },
];

export function BriefingForm({ initialData, onSave }: BriefingFormProps) {
  const [briefing, setBriefing] = useState<Briefing>(initialData ?? {});
  const [expanded, setExpanded] = useState(false);

  const update = (field: keyof Briefing, value: string) => {
    const next = { ...briefing, [field]: value || undefined };
    setBriefing(next);
    onSave(next);
  };

  const filledCount = Object.values(briefing).filter((v) => v?.trim()).length;

  return (
    <div className="w-full max-w-2xl rounded-xl border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--color-primary)]">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0-6a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Briefing</span>
            <span className="ml-2 text-xs text-[var(--text-secondary)]">
              {filledCount > 0 ? `${filledCount} van ${FIELDS.length} ingevuld` : 'Optioneel'}
            </span>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-4 pt-3">
          <p className="mb-3 text-xs text-[var(--text-secondary)]">
            Vul aan voor betere resultaten. Agents slaan intake-vragen over voor ingevulde velden.
          </p>
          <div className="space-y-2.5">
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  {label}
                </label>
                <Input
                  value={briefing[key] ?? ''}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
