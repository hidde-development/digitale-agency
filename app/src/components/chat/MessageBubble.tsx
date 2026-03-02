'use client';

import { useState, useRef, useCallback } from 'react';
import type { Message, Attachment } from '@/types/chat';
import { useAgent } from '@/hooks/useAgent';
import { useDashboard } from '@/hooks/useDashboard';
import { AGENT_DOCUMENT_TYPE_MAP } from '@/types/dashboard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  onEditMessage?: (content: string) => void;
  onAgentClick?: (agentId: string) => void;
  conversationId?: string;
}

/**
 * Detect if a message is structured/report-like content.
 * Triggers on: multiple headings, long content with headings, or list-heavy content.
 */
function isStructuredContent(content: string): boolean {
  const headingCount = (content.match(/^#{1,3}\s/gm) || []).length;
  const hasMultipleHeadings = headingCount >= 2;
  const isLong = content.length > 600;
  const hasListsAndHeadings =
    headingCount >= 1 && (content.match(/^[-*]\s/gm) || []).length >= 3;

  return (hasMultipleHeadings && isLong) || hasListsAndHeadings;
}

function AttachmentPreview({ attachment, isUser }: { attachment: Attachment; isUser: boolean }) {
  const isImage = attachment.type.startsWith('image/');

  if (isImage) {
    return (
      <div className="mt-2 overflow-hidden rounded-lg">
        <img
          src={`data:${attachment.type};base64,${attachment.data}`}
          alt={attachment.name}
          className="max-h-64 max-w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  const icon = attachment.type === 'application/pdf' ? '📄' : '📎';

  return (
    <div
      className={`mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
        isUser
          ? 'bg-white/15'
          : 'border border-border bg-white'
      }`}
    >
      <span>{icon}</span>
      <span className="max-w-[200px] truncate">{attachment.name}</span>
    </div>
  );
}

function ReportCard({
  message,
  agent,
  onEditMessage,
  onAgentClick,
  conversationId,
}: {
  message: Message;
  agent?: { name: string; avatar: string };
  onEditMessage?: (content: string) => void;
  onAgentClick?: (agentId: string) => void;
  conversationId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTimeSaving, setShowTimeSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { saveDocument, addTimeSaving, getDefaultEstimate, documents } = useDashboard();

  const isAlreadySaved = documents.some((d) => d.messageId === message.id);
  const docType = AGENT_DOCUMENT_TYPE_MAP[message.agentId || ''] || 'analyse';
  const defaultMinutes = getDefaultEstimate(docType);

  const handleSaveDocument = useCallback(() => {
    if (!conversationId || isAlreadySaved) return;
    const titleMatch = message.content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : message.content.slice(0, 50).replace(/[#*_]/g, '').trim();
    saveDocument({
      title,
      content: message.content,
      type: docType,
      agentId: message.agentId || '',
      conversationId,
      messageId: message.id,
    });
    setSaved(true);
    setShowTimeSaving(true);
    setTimeout(() => setSaved(false), 2000);
  }, [conversationId, message, docType, saveDocument, isAlreadySaved]);

  const handleTimeSaving = useCallback((minutes: number) => {
    addTimeSaving({
      agentId: message.agentId || '',
      documentType: docType,
      minutesSaved: minutes,
    });
    setShowTimeSaving(false);
  }, [message.agentId, docType, addTimeSaving]);

  const handleCopyReport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [message.content]);

  const handleExportPDF = useCallback(() => {
    if (!reportRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--color-primary').trim();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${agent?.name ?? 'Rapport'}</title>
        <style>
          body { font-family: 'Epilogue', system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #22222D; }
          h1 { font-size: 24px; border-bottom: 2px solid ${primary || '#6331F4'}; padding-bottom: 8px; margin-top: 32px; }
          h2 { font-size: 20px; margin-top: 28px; }
          h3 { font-size: 16px; margin-top: 20px; }
          ul, ol { padding-left: 24px; }
          li { margin-bottom: 4px; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
          th { background: #f5f6f8; font-weight: 600; }
          blockquote { border-left: 3px solid ${primary || '#6331F4'}; margin: 16px 0; padding: 8px 16px; background: #f9f9fb; }
          code { background: #f5f6f8; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
          pre code { display: block; padding: 16px; background: #22222D; color: white; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
          .header h1 { border: none; margin: 0; }
          .header p { color: #6B7280; font-size: 14px; margin-top: 4px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${agent?.avatar ?? ''} ${agent?.name ?? 'Rapport'}</h1>
          <p>${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        ${reportRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [agent]);

  return (
    <div className="group flex gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-light)] text-base">
        {agent?.avatar ?? '🤖'}
      </div>
      <div className="min-w-0 flex-1">
        {agent && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {agent.name}
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/40" />
          <div className="p-6" ref={reportRef}>
            <MarkdownRenderer content={message.content} isReport onAgentClick={onAgentClick} />
          </div>
          {/* Export toolbar */}
          <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-green-500">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-500">Gekopieerd</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                    <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
                  </svg>
                  <span>Kopieer rapport</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-light)] hover:text-[var(--text-primary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              <span>Exporteer PDF</span>
            </button>
            <div className="ml-auto">
              <button
                onClick={handleSaveDocument}
                disabled={isAlreadySaved}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isAlreadySaved || saved
                    ? 'text-green-500'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)] hover:text-[var(--color-primary)]'
                }`}
              >
                {isAlreadySaved || saved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <span>Opgeslagen</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    <span>Opslaan</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {showTimeSaving && (
            <div className="flex items-center gap-3 border-t border-border bg-[var(--bg-light)] px-4 py-2.5">
              <span className="text-xs text-[var(--text-secondary)]">Hoeveel tijd heeft dit je bespaard?</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: `${Math.round(defaultMinutes / 60)}u`, mins: defaultMinutes },
                  { label: `${Math.round(defaultMinutes / 120)}u`, mins: Math.round(defaultMinutes / 2) },
                  { label: '15min', mins: 15 },
                ].map((opt) => (
                  <button
                    key={opt.mins}
                    onClick={() => handleTimeSaving(opt.mins)}
                    className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTimeSaving(false)}
                className="ml-auto text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Overslaan
              </button>
            </div>
          )}
        </div>
        {message.attachments?.map((att) => (
          <AttachmentPreview key={att.id} attachment={att} isUser={false} />
        ))}
        <div className="mt-1.5">
          <MessageActions content={message.content} role="assistant" onEdit={onEditMessage} messageId={message.id} conversationId={conversationId} agentId={message.agentId} />
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  isUser,
  agent,
  onEditMessage,
  onAgentClick,
  conversationId,
}: {
  message: Message;
  isUser: boolean;
  agent?: { name: string; avatar: string };
  onEditMessage?: (content: string) => void;
  onAgentClick?: (agentId: string) => void;
  conversationId?: string;
}) {
  return (
    <div className={`group flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${
          isUser
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--bg-light)]'
        }`}
      >
        {isUser ? '👤' : agent?.avatar ?? '🤖'}
      </div>
      <div className="flex flex-col">
        <div
          className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${
            isUser
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--bg-light)] text-[var(--text-primary)]'
          }`}
        >
          {!isUser && agent && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {agent.name}
            </p>
          )}
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} onAgentClick={onAgentClick} />
          )}
          {message.attachments?.map((att) => (
            <AttachmentPreview key={att.id} attachment={att} isUser={isUser} />
          ))}
        </div>
        <div className={`mt-1 ${isUser ? 'self-end' : 'self-start'}`}>
          <MessageActions content={message.content} role={message.role} onEdit={onEditMessage} messageId={message.id} conversationId={conversationId} agentId={message.agentId} />
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({ message, onEditMessage, onAgentClick, conversationId }: MessageBubbleProps) {
  const { agents, selectedAgent } = useAgent();
  const isUser = message.role === 'user';

  const messageAgent = message.agentId
    ? agents.find((a) => a.id === message.agentId)
    : selectedAgent;

  if (!isUser && isStructuredContent(message.content)) {
    return (
      <ReportCard
        message={message}
        agent={messageAgent ? { name: messageAgent.name, avatar: messageAgent.avatar } : undefined}
        onEditMessage={onEditMessage}
        onAgentClick={onAgentClick}
        conversationId={conversationId}
      />
    );
  }

  return (
    <ChatBubble
      message={message}
      isUser={isUser}
      agent={messageAgent ? { name: messageAgent.name, avatar: messageAgent.avatar } : undefined}
      onEditMessage={onEditMessage}
      onAgentClick={onAgentClick}
      conversationId={conversationId}
    />
  );
}
