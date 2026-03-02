'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAgent } from '@/hooks/useAgent';
import { useRules } from '@/hooks/useRules';

export function FeedbackTab() {
  const { feedback, getFeedbackByAgent } = useDashboard();
  const { agents } = useAgent();
  const { updateRules, rules } = useRules();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [appliedRules, setAppliedRules] = useState<Set<number>>(new Set());

  const agentIds = [...new Set(feedback.map((f) => f.agentId))];

  const agentStats = agentIds.map((agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    const entries = getFeedbackByAgent(agentId);
    const positive = entries.filter((e) => e.rating === 'positive').length;
    const negative = entries.filter((e) => e.rating === 'negative').length;
    const score = entries.length > 0 ? Math.round((positive / entries.length) * 100) : 0;
    return { agentId, agent, entries, positive, negative, score };
  });

  const recentFeedback = feedback.slice(0, 20);

  if (feedback.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-3 h-10 w-10 text-[var(--text-secondary)] opacity-40">
          <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)]">
          Nog geen feedback gegeven
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Gebruik de duimpjes in de chat om feedback te geven op berichten.
        </p>
      </div>
    );
  }

  const hasNegative = feedback.some((f) => f.rating === 'negative');

  const handleSuggestRules = async () => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    setAppliedRules(new Set());
    try {
      const res = await fetch('/api/suggest-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplyRule = (index: number, rule: string) => {
    const newRules = rules ? `${rules}\n${rule}` : rule;
    updateRules(newRules);
    setAppliedRules((prev) => new Set(prev).add(index));
  };

  return (
    <div className="space-y-6">
      {/* Per-agent summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Score per agent</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agentStats.map(({ agentId, agent, positive, negative, score }) => (
            <div
              key={agentId}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm"
            >
              {agent && (
                <span className="text-2xl">{agent.avatar}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {agent?.name ?? agentId}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="text-green-600">{positive} positief</span>
                  <span className="text-red-500">{negative} negatief</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--text-primary)]">{score}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent feedback */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Recente feedback</h3>
        <div className="space-y-2">
          {recentFeedback.map((entry) => {
            const agent = agents.find((a) => a.id === entry.agentId);
            const date = new Date(entry.createdAt).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-white p-3"
              >
                <span className="mt-0.5 text-lg">
                  {entry.rating === 'positive' ? (
                    <span className="text-green-600">+</span>
                  ) : (
                    <span className="text-red-500">-</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    {agent && <span>{agent.avatar} {agent.name}</span>}
                    <span>{date}</span>
                  </div>
                  {entry.comment && (
                    <p className="mt-1 text-sm text-[var(--text-primary)]">{entry.comment}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rule suggestions */}
      {hasNegative && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Regelvoorstellen</h3>
            <button
              onClick={handleSuggestRules}
              disabled={loadingSuggestions}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loadingSuggestions ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyseren...
                </>
              ) : (
                'Suggereer regels'
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Op basis van negatieve feedback genereert AI regelvoorstellen die je met een klik kunt toepassen.
          </p>
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {suggestions.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
                >
                  <p className="flex-1 text-sm text-[var(--text-primary)]">{rule}</p>
                  <button
                    onClick={() => handleApplyRule(i, rule)}
                    disabled={appliedRules.has(i)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      appliedRules.has(i)
                        ? 'bg-green-50 text-green-700'
                        : 'bg-[var(--bg-light)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                    }`}
                  >
                    {appliedRules.has(i) ? 'Toegepast' : 'Toepassen'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
