'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useChat } from '@/hooks/useChat';
import { StatCard } from './StatCard';
import { calculateCost, formatCost, formatTokens } from '@/lib/pricing';

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  return rest > 0 ? `${hours}u ${rest}m` : `${hours} uur`;
}

export function DashboardStats() {
  const { allConversations } = useChat();
  const { documents, feedback, getTotalTimeSaved } = useDashboard();

  const totalConversations = allConversations.length;
  const totalDocuments = documents.length;
  const timeSavedMonth = getTotalTimeSaved('month');
  const positiveCount = feedback.filter((f) => f.rating === 'positive').length;
  const feedbackScore = feedback.length > 0
    ? Math.round((positiveCount / feedback.length) * 100)
    : 0;

  const { totalInput, totalOutput } = allConversations.reduce(
    (acc, conv) => {
      for (const m of conv.messages) {
        if (m.usage) {
          acc.totalInput += m.usage.input_tokens;
          acc.totalOutput += m.usage.output_tokens;
        }
      }
      return acc;
    },
    { totalInput: 0, totalOutput: 0 }
  );
  const totalTokens = totalInput + totalOutput;
  const totalCost = calculateCost(totalInput, totalOutput);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
          </svg>
        }
        label="Gesprekken"
        value={totalConversations}
      />
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
          </svg>
        }
        label="Documenten"
        value={totalDocuments}
      />
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
          </svg>
        }
        label="Tijd bespaard"
        value={formatMinutes(timeSavedMonth)}
        sub="deze maand"
      />
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25ZM6 13.5V7a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0ZM9.25 9a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0V9ZM13.25 5a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
          </svg>
        }
        label="API tokens"
        value={totalTokens > 0 ? formatTokens(totalTokens) : '-'}
        sub={totalTokens > 0 ? `${formatTokens(totalInput)} in / ${formatTokens(totalOutput)} uit` : 'nog geen gebruik'}
      />
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 0 0 1.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 0 0 6.5 10c0 1.292.443 2.503 1.106 3.46.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 0 0-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95A3.707 3.707 0 0 1 8 10c0-.97.332-1.88.798-2.55Z" />
          </svg>
        }
        label="Kosten"
        value={totalTokens > 0 ? formatCost(totalCost) : '-'}
        sub={totalTokens > 0 ? 'Sonnet 4 pricing' : 'nog geen gebruik'}
      />
    </div>
  );
}
