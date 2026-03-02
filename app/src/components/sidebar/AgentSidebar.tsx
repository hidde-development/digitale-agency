'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgent } from '@/hooks/useAgent';
import { useRules } from '@/hooks/useRules';
import { AgentCard } from './AgentCard';
import { Separator } from '@/components/ui/separator';

export function AgentSidebar() {
  const pathname = usePathname();
  const { agents, selectedAgentId, selectAgent, loading } = useAgent();
  const { rules, updateRules } = useRules();
  const [showRules, setShowRules] = useState(false);
  const [draft, setDraft] = useState(rules);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isDashboard = pathname?.startsWith('/dashboard');

  // Sync draft when rules change externally
  useEffect(() => {
    setDraft(rules);
  }, [rules]);

  const handleChange = useCallback(
    (value: string) => {
      setDraft(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateRules(value);
      }, 1000);
    },
    [updateRules]
  );

  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateRules(draft);
  }, [draft, updateRules]);

  const rulesSection = (
    <>
      <button
        onClick={() => setShowRules((prev) => !prev)}
        className="flex w-full items-center justify-between px-1 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.113a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
          </svg>
          Standaard regels
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${showRules ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {showRules && (
        <div className="mt-2">
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Bijv. Schrijf altijd in het Nederlands, gebruik geen emoji's, houd antwoorden kort..."
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-[var(--bg-light)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--color-primary)]"
          />
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Deze regels gelden voor alle agents.
          </p>
        </div>
      )}
    </>
  );

  return (
    <aside className="flex h-full w-[280px] flex-col border-r border-border bg-white">
      <div className="flex items-center gap-2 px-4 py-4">
        <Image
          src="/logos/goldfizh.png"
          alt="Logo"
          width={24}
          height={24}
          className="rounded"
        />
        <span className="text-base font-bold text-[var(--text-primary)]">
          Agency Intelligence
        </span>
      </div>

      {/* Navigatie toggle */}
      <div className="flex gap-1 px-3 pb-2">
        <Link
          href="/dashboard"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isDashboard
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h16.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5ZM1 17.75a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/chat"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !isDashboard
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
          </svg>
          Chat
        </Link>
      </div>

      <Separator />

      {isDashboard ? (
        /* Dashboard: Instellingen */
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="mb-3 px-1 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Instellingen
          </p>
          {rulesSection}
        </div>
      ) : (
        /* Chat: Agent selectie + regels */
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <p className="mb-2 px-1 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Agents
            </p>
            <div className="flex flex-col gap-1">
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg bg-[var(--bg-light)]"
                    />
                  ))
                : agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={agent.id === selectedAgentId}
                      onSelect={selectAgent}
                    />
                  ))}
            </div>
          </div>

          <Separator />

          <div className="px-3 py-3">
            {rulesSection}
          </div>
        </>
      )}
    </aside>
  );
}
