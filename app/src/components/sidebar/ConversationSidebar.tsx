'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';

export function ConversationSidebar() {
  const { agents } = useAgent();
  const {
    newConversation,
    allConversations,
    activeConversationId,
    setActiveConversation,
    deleteConversation,
    updateTitle,
    togglePin,
  } = useChat();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const commitEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateTitle(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="flex h-full w-[260px] flex-col border-l border-border bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Gesprekken
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-sm text-[var(--color-primary)]"
          onClick={newConversation}
        >
          + Nieuw
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {allConversations.length === 0 ? (
          <p className="px-1 text-sm text-[var(--text-secondary)]">
            Nog geen gesprekken.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {allConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-1.5 rounded-md px-2.5 py-2 text-left transition-colors ${
                  conv.id === activeConversationId
                    ? 'bg-[var(--primary-light)]'
                    : 'hover:bg-[var(--bg-light)]'
                }`}
              >
                {/* Pin indicator */}
                {conv.pinned && (
                  <span className="shrink-0 text-[10px] text-[var(--color-primary)]" title="Vastgepind">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                      <path d="M8.5 1.709a.75.75 0 0 0-1 0l-5 4.545a.75.75 0 0 0 .5 1.307h.25v3.689a.75.75 0 0 0 .75.75h2.25V9.316a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V12h2.25a.75.75 0 0 0 .75-.75V7.561h.25a.75.75 0 0 0 .5-1.307l-5-4.545Z" />
                    </svg>
                  </span>
                )}
                <button
                  onClick={() => setActiveConversation(conv.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    {/* Agent avatar badges */}
                    <span className="flex shrink-0 -space-x-1">
                      {conv.agentIds.map((aid) => {
                        const agent = agents.find((a) => a.id === aid);
                        return (
                          <span
                            key={aid}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-light)] text-[10px] ring-1 ring-white"
                            title={agent?.name}
                          >
                            {agent?.avatar ?? '🤖'}
                          </span>
                        );
                      })}
                    </span>
                    {editingId === conv.id ? (
                      <input
                        ref={editInputRef}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full rounded border border-[var(--color-primary)] bg-white px-1 text-sm font-medium text-[var(--text-primary)] outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p
                        className="truncate text-sm font-medium text-[var(--text-primary)]"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(conv.id, conv.title);
                        }}
                      >
                        {conv.title}
                      </p>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {new Date(conv.updatedAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
                {/* Action buttons — visible on hover */}
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Rename button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(conv.id, conv.title);
                    }}
                    className="rounded p-0.5 text-[var(--text-secondary)] hover:text-[var(--color-primary)]"
                    title="Hernoem gesprek"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                    </svg>
                  </button>
                  {/* Pin button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(conv.id);
                    }}
                    className={`rounded p-0.5 transition-colors ${
                      conv.pinned
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--color-primary)]'
                    }`}
                    title={conv.pinned ? 'Losmaken' : 'Vastpinnen'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="rounded p-0.5 text-[var(--text-secondary)] hover:text-red-500"
                    title="Verwijder gesprek"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
