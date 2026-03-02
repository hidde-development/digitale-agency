'use client';

import { useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { useDashboard } from '@/hooks/useDashboard';
import { calculateCost, formatCost, formatTokens } from '@/lib/pricing';

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  return rest > 0 ? `${hours}u ${rest}m` : `${hours} uur`;
}

function toMonthKey(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthKeyToLabel(key: string): string {
  const [yearStr, monthStr] = key.split('-');
  const year = parseInt(yearStr);
  const monthIndex = parseInt(monthStr) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

interface MonthData {
  key: string;
  label: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  conversations: number;
  documents: number;
  minutesSaved: number;
}

export function UsageTab() {
  const { allConversations } = useChat();
  const { documents, timeSavings } = useDashboard();

  const months = useMemo(() => {
    const map = new Map<string, {
      input: number;
      output: number;
      convIds: Set<string>;
      documents: number;
      minutesSaved: number;
    }>();

    const getOrCreate = (key: string) => {
      let entry = map.get(key);
      if (!entry) {
        entry = { input: 0, output: 0, convIds: new Set(), documents: 0, minutesSaved: 0 };
        map.set(key, entry);
      }
      return entry;
    };

    // Token usage from conversations
    for (const conv of allConversations) {
      for (const msg of conv.messages) {
        if (!msg.usage) continue;
        const key = toMonthKey(msg.timestamp);
        const entry = getOrCreate(key);
        entry.input += msg.usage.input_tokens;
        entry.output += msg.usage.output_tokens;
        entry.convIds.add(conv.id);
      }
    }

    // Documents per month
    for (const doc of documents) {
      const key = toMonthKey(doc.createdAt);
      const entry = getOrCreate(key);
      entry.documents += 1;
    }

    // Time savings per month
    for (const ts of timeSavings) {
      const key = toMonthKey(ts.createdAt);
      const entry = getOrCreate(key);
      entry.minutesSaved += ts.minutesSaved;
    }

    const result: MonthData[] = [];
    for (const [key, data] of map) {
      result.push({
        key,
        label: monthKeyToLabel(key),
        inputTokens: data.input,
        outputTokens: data.output,
        totalTokens: data.input + data.output,
        cost: calculateCost(data.input, data.output),
        conversations: data.convIds.size,
        documents: data.documents,
        minutesSaved: data.minutesSaved,
      });
    }

    // Sort newest first
    result.sort((a, b) => b.key.localeCompare(a.key));
    return result;
  }, [allConversations, documents, timeSavings]);

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-3 h-10 w-10 text-[var(--text-secondary)] opacity-40">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)]">
          Nog geen verbruiksdata beschikbaar
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Start een gesprek met een agent — het verbruik wordt automatisch bijgehouden.
        </p>
      </div>
    );
  }

  // For chart: show up to 12 months, oldest first (left to right)
  const chartData = [...months].reverse().slice(-12);
  const maxTokens = Math.max(...chartData.map((m) => m.totalTokens));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Token-verbruik per maand</h3>
        <div className="flex items-end gap-2" style={{ height: 200 }}>
          {chartData.map((month) => {
            const inputPct = maxTokens > 0 ? (month.inputTokens / maxTokens) * 100 : 0;
            const outputPct = maxTokens > 0 ? (month.outputTokens / maxTokens) * 100 : 0;
            const shortLabel = month.label.slice(0, 3);

            return (
              <div key={month.key} className="flex flex-1 flex-col items-center gap-1">
                {/* Stacked bar */}
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-t-md"
                  style={{ height: 160 }}
                  title={`${month.label}: ${formatTokens(month.totalTokens)} tokens (${formatCost(month.cost)})`}
                >
                  <div
                    className="w-full bg-[var(--color-primary)] transition-all"
                    style={{ height: `${inputPct}%` }}
                  />
                  <div
                    className="w-full bg-purple-400 transition-all"
                    style={{ height: `${outputPct}%` }}
                  />
                </div>
                {/* Label */}
                <span className="text-[10px] text-[var(--text-secondary)]">{shortLabel}</span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[var(--color-primary)]" />
            <span className="text-xs text-[var(--text-secondary)]">Input</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-purple-400" />
            <span className="text-xs text-[var(--text-secondary)]">Output</span>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-5 py-3">Maand</th>
                <th className="px-5 py-3 text-right">Gesprekken</th>
                <th className="px-5 py-3 text-right">Documenten</th>
                <th className="px-5 py-3 text-right">Tijd bespaard</th>
                <th className="px-5 py-3 text-right">Tokens</th>
                <th className="px-5 py-3 text-right">Kosten</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month.key} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium capitalize text-[var(--text-primary)]">
                    {month.label}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                    {month.conversations}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                    {month.documents}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                    {month.minutesSaved > 0 ? formatMinutes(month.minutesSaved) : '-'}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-[var(--text-primary)]">
                    {month.totalTokens > 0 ? formatTokens(month.totalTokens) : '-'}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-[var(--text-primary)]">
                    {month.cost > 0 ? formatCost(month.cost) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
