/**
 * Estimate token count for a string.
 * Claude uses ~4 characters per token on average for Western languages.
 * This is an approximation — exact counting requires the tokenizer.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Claude claude-sonnet-4-20250514 context window
export const MAX_CONTEXT_TOKENS = 200_000;
// Reserve tokens for the response
export const RESPONSE_RESERVE = 8_192;
// Effective limit for input (messages + system prompt)
export const MAX_INPUT_TOKENS = MAX_CONTEXT_TOKENS - RESPONSE_RESERVE;

// Warning thresholds
export const TOKEN_WARNING_THRESHOLD = 0.75; // 75% — yellow
export const TOKEN_DANGER_THRESHOLD = 0.90;  // 90% — red

export interface TokenUsage {
  total: number;
  percentage: number;
  status: 'ok' | 'warning' | 'danger';
  formattedTotal: string;
  formattedMax: string;
}

export function calculateTokenUsage(
  messages: { content: string }[],
  systemPromptTokens: number = 0
): TokenUsage {
  const messageTokens = messages.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0
  );
  const total = messageTokens + systemPromptTokens;
  const percentage = total / MAX_INPUT_TOKENS;

  let status: TokenUsage['status'] = 'ok';
  if (percentage >= TOKEN_DANGER_THRESHOLD) {
    status = 'danger';
  } else if (percentage >= TOKEN_WARNING_THRESHOLD) {
    status = 'warning';
  }

  return {
    total,
    percentage,
    status,
    formattedTotal: formatTokenCount(total),
    formattedMax: formatTokenCount(MAX_INPUT_TOKENS),
  };
}

function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}
