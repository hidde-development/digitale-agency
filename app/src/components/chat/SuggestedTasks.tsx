'use client';

import type { SuggestedTask } from '@/types/agent';

interface SuggestedTasksProps {
  tasks: SuggestedTask[];
  onSelect: (prompt: string) => void;
}

export function SuggestedTasks({ tasks, onSelect }: SuggestedTasksProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <button
          key={task.label}
          onClick={() => onSelect(task.prompt)}
          className="rounded-xl border border-border bg-[var(--primary-light)] px-5 py-3.5 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
        >
          <p className="text-[15px] font-medium text-[var(--text-primary)]">
            {task.label}
          </p>
        </button>
      ))}
    </div>
  );
}
