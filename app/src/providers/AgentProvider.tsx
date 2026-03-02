'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { AgentMeta } from '@/types/agent';

interface AgentState {
  agents: AgentMeta[];
  selectedAgentId: string | null;
  loading: boolean;
}

type AgentAction =
  | { type: 'SET_AGENTS'; agents: AgentMeta[] }
  | { type: 'SELECT_AGENT'; agentId: string };

const initialState: AgentState = {
  agents: [],
  selectedAgentId: null,
  loading: true,
};

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'SET_AGENTS':
      return {
        ...state,
        agents: action.agents,
        selectedAgentId: action.agents[0]?.id ?? null,
        loading: false,
      };
    case 'SELECT_AGENT':
      return { ...state, selectedAgentId: action.agentId };
    default:
      return state;
  }
}

interface AgentContextValue extends AgentState {
  selectAgent: (agentId: string) => void;
  selectedAgent: AgentMeta | undefined;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((agents: AgentMeta[]) =>
        dispatch({ type: 'SET_AGENTS', agents })
      );
  }, []);

  const selectAgent = (agentId: string) => {
    dispatch({ type: 'SELECT_AGENT', agentId });
  };

  const selectedAgent = state.agents.find(
    (a) => a.id === state.selectedAgentId
  );

  return (
    <AgentContext.Provider value={{ ...state, selectAgent, selectedAgent }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within AgentProvider');
  }
  return context;
}
