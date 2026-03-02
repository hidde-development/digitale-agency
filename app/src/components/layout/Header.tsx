'use client';

import Image from 'next/image';
import { useAgent } from '@/hooks/useAgent';

export function Header() {
  const { selectedAgent } = useAgent();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-3">
        <Image
          src="/logos/goldfizh.png"
          alt="Logo"
          width={28}
          height={28}
          className="rounded"
        />
        <span className="text-base font-semibold text-[var(--text-primary)]">
          Agency Intelligence
        </span>
      </div>
      {selectedAgent && (
        <div className="flex items-center gap-2 text-base text-[var(--text-secondary)]">
          <span>{selectedAgent.avatar}</span>
          <span>{selectedAgent.name}</span>
        </div>
      )}
    </header>
  );
}
