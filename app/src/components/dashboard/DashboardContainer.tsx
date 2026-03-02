'use client';

import { useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { DocumentsTab } from './DocumentsTab';
import { FeedbackTab } from './FeedbackTab';
import { TimeSavingsTab } from './TimeSavingsTab';
import { UsageTab } from './UsageTab';

type Tab = 'documenten' | 'feedback' | 'tijdsbesparing' | 'gebruik';

const TABS: { id: Tab; label: string }[] = [
  { id: 'documenten', label: 'Documenten' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'tijdsbesparing', label: 'Tijdsbesparing' },
  { id: 'gebruik', label: 'Gebruik' },
];

export function DashboardContainer() {
  const [activeTab, setActiveTab] = useState<Tab>('documenten');

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Overzicht van je documenten, feedback en tijdsbesparing.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {activeTab === 'documenten' && <DocumentsTab />}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'tijdsbesparing' && <TimeSavingsTab />}
          {activeTab === 'gebruik' && <UsageTab />}
        </div>
      </div>
    </div>
  );
}
