'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useAgent } from '@/hooks/useAgent';
import { TokenCounter } from './TokenCounter';
import type { Attachment } from '@/types/chat';

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
      });
    };
    reader.onerror = () => reject(new Error('Bestand kon niet worden gelezen'));
    reader.readAsDataURL(file);
  });
}

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  editValue?: string | null;
  onEditClear?: () => void;
}

export function ChatInput({ onSend, onStop, disabled, editValue, onEditClear }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedAgent } = useAgent();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const minHeight = 60;
      textareaRef.current.style.height = `${Math.max(minHeight, Math.min(textareaRef.current.scrollHeight, 200))}px`;
    }
  }, [value]);

  // Reset task panel when switching agents
  useEffect(() => {
    setShowTasks(false);
  }, [selectedAgent?.id]);

  // Populate textarea when editing a message
  useEffect(() => {
    if (editValue) {
      setValue(editValue);
      onEditClear?.();
      textareaRef.current?.focus();
    }
  }, [editValue, onEditClear]);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });

    const newAttachments = await Promise.all(validFiles.map(fileToAttachment));
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;
    onSend(trimmed || '(bijlage)', attachments.length > 0 ? attachments : undefined);
    setValue('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white px-6 pb-6 pt-4 transition-colors ${
        isDragging ? 'bg-[var(--primary-light)]' : ''
      }`}
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        {/* Suggested tasks chips */}
        {selectedAgent?.suggestedTasks && selectedAgent.suggestedTasks.length > 0 && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShowTasks((prev) => !prev)}
              className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--color-primary)]"
            >
              <span>{selectedAgent.avatar}</span>
              <span>Mogelijkheden {selectedAgent.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-3.5 w-3.5 transition-transform ${showTasks ? 'rotate-180' : ''}`}
              >
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            {showTasks && (
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.suggestedTasks.map((task) => (
                  <button
                    key={task.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSend(task.prompt);
                      setShowTasks(false);
                    }}
                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--primary-light)] hover:text-[var(--color-primary)] disabled:opacity-50"
                  >
                    {task.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drag overlay hint */}
        {isDragging && (
          <div className="mb-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-primary)] py-8 text-[15px] text-[var(--color-primary)]">
            Sleep bestanden hier om te uploaden
          </div>
        )}

        {/* Main input card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-[var(--bg-light)] shadow-sm transition-shadow focus-within:border-[var(--color-primary)] focus-within:shadow-md focus-within:shadow-[var(--color-primary)]/10">
          {/* Attachment previews inside the card */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5"
                >
                  <span className="text-sm">{getFileIcon(att.type)}</span>
                  <span className="max-w-[150px] truncate text-sm text-[var(--text-primary)]">
                    {att.name}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatSize(att.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="ml-1 text-[var(--text-secondary)] hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Schrijf een bericht of sleep een bestand..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-50"
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              {/* File upload button */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="h-9 w-9 rounded-lg p-0 text-[var(--text-secondary)] hover:bg-white hover:text-[var(--color-primary)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835a2.25 2.25 0 0 1-3.182-3.182l.02-.02L15.88 6.68a.75.75 0 1 1 1.061 1.06L7.96 16.694a.75.75 0 0 0 1.06 1.06L19.97 6.843a2.25 2.25 0 0 0 0-3.182l-1-.002Z" clipRule="evenodd" />
                </svg>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                onChange={(e) => {
                  if (e.target.files) processFiles(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </div>

            {/* Send / Stop button */}
            {disabled && onStop ? (
              <Button
                type="button"
                onClick={onStop}
                className="h-10 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-medium text-white hover:opacity-90"
              >
                Stop
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-1.5 h-4 w-4"
                >
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                </svg>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!value.trim() && attachments.length === 0}
                className="h-10 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Verstuur
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-1.5 h-4 w-4"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-xs text-[var(--text-secondary)]">
            Enter om te versturen, Shift+Enter voor nieuwe regel
          </p>
          <TokenCounter />
        </div>
      </form>
    </div>
  );
}
