'use client';

import { useRulesContext } from '@/providers/RulesProvider';

export function useRules() {
  return useRulesContext();
}
