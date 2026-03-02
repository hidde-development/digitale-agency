export interface Attachment {
  id: string;
  name: string;
  type: string;       // MIME type
  size: number;
  data: string;       // base64-encoded content
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
  attachments?: Attachment[];
  usage?: TokenUsage;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface Briefing {
  merk?: string;
  doel?: string;
  doelgroep?: string;
  kanaal?: string;
  context?: string;
}

export interface Conversation {
  id: string;
  title: string;
  agentId: string;
  agentIds: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  briefing?: Briefing;
}

export interface StreamChunk {
  text?: string;
  status?: string;
  usage?: TokenUsage;
}

export interface ChatRequest {
  messages: {
    role: string;
    content: string;
    agentId?: string;
    attachments?: Attachment[];
  }[];
  agentId: string;
  clientSlug: string;
  customRules?: string;
  briefing?: Briefing;
}
