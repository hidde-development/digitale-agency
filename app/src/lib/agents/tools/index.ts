import type { Tool } from '../types';
import { webScraperTool } from './web-scraper';

const toolRegistry = new Map<string, Tool>();

export function registerTool(tool: Tool): void {
  toolRegistry.set(tool.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name);
}

export function getToolsForAgent(toolNames: string[]): Tool[] {
  return toolNames
    .map((name) => toolRegistry.get(name))
    .filter((t): t is Tool => t !== undefined);
}

// Register built-in tools
registerTool(webScraperTool);
