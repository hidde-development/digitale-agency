import { readFile } from 'fs/promises';
import path from 'path';
import type { AgentConfig, ClientConfig } from '@/types/agent';

const AGENTS_DIR = path.join(process.cwd(), 'src/config/agents');
const CLIENTS_DIR = path.join(process.cwd(), 'src/config/clients');

const agentCache = new Map<string, AgentConfig>();
const clientCache = new Map<string, ClientConfig>();

export async function loadAgentConfig(configPath: string): Promise<AgentConfig> {
  if (agentCache.has(configPath)) {
    return agentCache.get(configPath)!;
  }

  const filePath = path.join(AGENTS_DIR, configPath);
  const raw = await readFile(filePath, 'utf-8');
  const config = JSON.parse(raw) as AgentConfig;
  agentCache.set(configPath, config);
  return config;
}

export async function loadClientConfig(clientSlug: string): Promise<ClientConfig> {
  if (clientCache.has(clientSlug)) {
    return clientCache.get(clientSlug)!;
  }

  const filePath = path.join(CLIENTS_DIR, `${clientSlug}.json`);
  const raw = await readFile(filePath, 'utf-8');
  const config = JSON.parse(raw) as ClientConfig;
  clientCache.set(clientSlug, config);
  return config;
}
