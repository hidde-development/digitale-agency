'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { agents as agentRegistry } from '@/config/agents/registry';

interface MarkdownRendererProps {
  content: string;
  isReport?: boolean;
  onAgentClick?: (agentId: string) => void;
}

/**
 * Replace known agent name mentions with clickable agent:// links.
 * Only matches names that are NOT already inside a markdown link.
 */
function linkifyAgentNames(content: string): string {
  let result = content;
  for (const agent of agentRegistry) {
    // Match agent name that is not already inside a markdown link [...](...)
    // Use word boundary-like approach: match the name when not preceded by [ or (
    const escaped = agent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\[)\\b(${escaped})\\b(?!\\])(?!\\()`, 'g');
    result = result.replace(regex, `[$1](agent://${agent.id})`);
  }
  return result;
}

const reportComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 border-b border-[var(--color-primary)]/20 pb-2 text-2xl font-bold text-[var(--text-primary)] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)] first:mt-0">
      <span className="inline-block h-5 w-1 rounded-full bg-[var(--color-primary)]" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--text-primary)]">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-[15px] font-semibold text-[var(--text-primary)]">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-[15px] leading-relaxed text-[var(--text-primary)] last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 space-y-1.5 text-[15px]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-decimal space-y-1.5 pl-5 text-[15px]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 leading-relaxed text-[var(--text-primary)]">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/60" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-[var(--text-secondary)]">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-3 border-[var(--color-primary)] bg-[var(--color-primary)]/5 py-2 pl-4 pr-3 rounded-r-lg">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-[var(--bg-dark)]/8 px-1.5 py-0.5 text-sm font-mono text-[var(--color-primary)]">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto rounded-lg bg-[var(--bg-dark)] p-4 text-sm font-mono text-white">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-hidden rounded-lg">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--bg-light)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-[var(--bg-light)]/50">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-2.5">{children}</th>,
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-[var(--text-primary)]">{children}</td>
  ),
  hr: () => <hr className="my-5 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 hover:decoration-[var(--color-primary)]"
    >
      {children}
    </a>
  ),
};

const chatComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-lg font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1.5 mt-3 text-base font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2 text-[15px] font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-black/8 px-1 py-0.5 text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto rounded bg-[var(--bg-dark)] p-3 text-sm font-mono text-white">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-hidden rounded-lg">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] underline underline-offset-2"
    >
      {children}
    </a>
  ),
};

function makeAgentAwareLink(onAgentClick?: (agentId: string) => void) {
  return function AgentLink({ href, children }: { href?: string; children?: React.ReactNode }) {
    if (href?.startsWith('agent://') && onAgentClick) {
      const agentId = href.replace('agent://', '');
      const agent = agentRegistry.find((a) => a.id === agentId);
      return (
        <button
          type="button"
          onClick={() => onAgentClick(agentId)}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--primary-light)] px-1.5 py-0.5 text-[var(--color-primary)] font-medium transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          title={`Schakel naar ${agent?.name ?? agentId}`}
        >
          {agent?.avatar && <span className="text-xs">{agent.avatar}</span>}
          {children}
        </button>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 hover:decoration-[var(--color-primary)]"
      >
        {children}
      </a>
    );
  };
}

export function MarkdownRenderer({ content, isReport = false, onAgentClick }: MarkdownRendererProps) {
  const processedContent = useMemo(
    () => onAgentClick ? linkifyAgentNames(content) : content,
    [content, onAgentClick]
  );

  const components = useMemo(() => {
    const base = isReport ? { ...reportComponents } : { ...chatComponents };
    if (onAgentClick) {
      base.a = makeAgentAwareLink(onAgentClick) as Components['a'];
    }
    return base;
  }, [isReport, onAgentClick]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
