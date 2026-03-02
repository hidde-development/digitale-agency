import type { Message, StreamChunk, Briefing } from '@/types/chat';

export interface ExecutorInput {
  messages: Message[];
  agentId: string;
  clientSlug?: string;
  customRules?: string;
  briefing?: Briefing;
  tools?: Tool[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(input: Record<string, unknown>): Promise<unknown>;
}

export interface AgentExecutor {
  execute(input: ExecutorInput): AsyncIterable<StreamChunk>;
}
