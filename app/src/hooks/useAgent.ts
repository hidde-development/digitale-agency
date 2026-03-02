'use client';

import { useAgentContext } from '@/providers/AgentProvider';

export function useAgent() {
  const { agents, selectedAgentId, selectedAgent, selectAgent, loading } =
    useAgentContext();

  return {
    agents,
    selectedAgentId,
    selectedAgent,
    selectAgent,
    loading,
  };
}
