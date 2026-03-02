'use client';

import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-light)] text-[var(--color-primary)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        {sub && <p className="text-xs text-[var(--text-secondary)]">{sub}</p>}
      </div>
    </div>
  );
}
