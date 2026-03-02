'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import type { DocumentType } from '@/types/dashboard';
import { DOCUMENT_TYPE_LABELS } from '@/types/dashboard';

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  return rest > 0 ? `${hours}u ${rest}m` : `${hours} uur`;
}

const ALL_TYPES: DocumentType[] = ['artikel', 'social-post', 'ad', 'analyse', 'persona'];

export function TimeSavingsTab() {
  const { timeSavings, timeConfig, updateTimeConfig, getTotalTimeSaved } = useDashboard();
  const [editing, setEditing] = useState(false);

  const totalAll = getTotalTimeSaved('all');
  const totalMonth = getTotalTimeSaved('month');

  // Per-type breakdown
  const perType = ALL_TYPES.map((type) => {
    const entries = timeSavings.filter((t) => t.documentType === type);
    const total = entries.reduce((sum, t) => sum + t.minutesSaved, 0);
    return { type, count: entries.length, total };
  }).filter((t) => t.count > 0);

  if (timeSavings.length === 0 && !editing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-3 h-10 w-10 text-[var(--text-secondary)] opacity-40">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)]">
          Nog geen tijdsbesparing geregistreerd
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Sla documenten op vanuit een chat — de tijdsbesparing wordt automatisch berekend.
        </p>
        <button
          onClick={() => setEditing(true)}
          className="mt-4 text-xs font-medium text-[var(--color-primary)] hover:underline"
        >
          Tijdsschattingen aanpassen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm text-[var(--text-secondary)]">Deze maand</p>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{formatMinutes(totalMonth)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm text-[var(--text-secondary)]">Totaal</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatMinutes(totalAll)}</p>
        </div>
      </div>

      {/* Per-type breakdown */}
      {perType.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Per documenttype</h3>
          <div className="space-y-2">
            {perType.map(({ type, count, total }) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {DOCUMENT_TYPE_LABELS[type]}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{count} documenten</p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {formatMinutes(total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config editor */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tijdsschattingen</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            {editing ? 'Sluiten' : 'Aanpassen'}
          </button>
        </div>
        {editing && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Hoeveel minuten kost het handmatig om dit type document te maken?
            </p>
            {ALL_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-3">
                <label className="w-28 text-sm text-[var(--text-primary)]">
                  {DOCUMENT_TYPE_LABELS[type]}
                </label>
                <input
                  type="number"
                  min={1}
                  value={timeConfig[type]}
                  onChange={(e) => updateTimeConfig({ [type]: parseInt(e.target.value) || 1 })}
                  className="w-20 rounded-lg border border-border bg-[var(--bg-light)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                />
                <span className="text-xs text-[var(--text-secondary)]">minuten</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
