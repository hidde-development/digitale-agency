// Claude Sonnet 4 pricing (USD per million tokens)
export const PRICE_INPUT_PER_MTOK = 3;
export const PRICE_OUTPUT_PER_MTOK = 15;

export function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * PRICE_INPUT_PER_MTOK
    + (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_MTOK;
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}
