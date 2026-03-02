export interface SuggestedTask {
  label: string;
  prompt: string;
}

export interface AgentMeta {
  id: string;
  name: string;
  description: string;
  avatar: string;
  configPath: string;
  suggestedTasks: SuggestedTask[];
  requiresClientConfig: boolean;
  tools: string[];
}

export interface AgentConfig {
  metadata: Record<string, unknown>;
  identity: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ClientConfig {
  merk: {
    naam: string;
    waarden: string[];
    missie: string;
    product_dienst: string;
    usp: string[];
  };
  stem: Record<string, unknown>;
  doelgroepen: Array<Record<string, unknown>>;
  schrijfregels: Record<string, unknown>;
  content_types: Record<string, unknown>;
  [key: string]: unknown;
}
