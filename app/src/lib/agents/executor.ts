import { anthropic } from '@/lib/anthropic';
import { loadAgentConfig, loadClientConfig } from './loader';
import { buildSystemPrompt } from './prompt-builder';
import { agents } from '@/config/agents/registry';
import { getTenant } from '@/config/tenants/goldfizh';
import { getTool, getToolsForAgent } from './tools';
import { estimateTokens, MAX_INPUT_TOKENS, TOKEN_DANGER_THRESHOLD } from '@/lib/token-counter';
import type { AgentExecutor, ExecutorInput } from './types';
import type { StreamChunk, Message } from '@/types/chat';
import type Anthropic from '@anthropic-ai/sdk';

type ContentBlock = Anthropic.Messages.ContentBlockParam;
type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

function isTextFile(type: string): boolean {
  return (
    type.startsWith('text/') ||
    type === 'application/json'
  );
}

function buildContentBlocks(message: Message): string | ContentBlock[] {
  if (!message.attachments?.length) {
    return message.content;
  }

  const blocks: ContentBlock[] = [];

  // Add text content first
  if (message.content && message.content !== '(bijlage)') {
    blocks.push({ type: 'text', text: message.content });
  }

  for (const att of message.attachments) {
    if (att.type.startsWith('image/')) {
      blocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: att.type as ImageMediaType,
          data: att.data,
        },
      });
    } else if (att.type === 'application/pdf') {
      blocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: att.data,
        },
      });
    } else if (isTextFile(att.type)) {
      // Decode base64 text files and send as text
      const decoded = Buffer.from(att.data, 'base64').toString('utf-8');
      blocks.push({
        type: 'text',
        text: `--- Inhoud van ${att.name} ---\n${decoded}\n--- Einde ${att.name} ---`,
      });
    }
  }

  return blocks.length > 0 ? blocks : message.content;
}

function buildToolDefinitions(
  agentTools: { name: string; description: string; parameters: Record<string, unknown> }[]
): Anthropic.Messages.Tool[] {
  return agentTools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Messages.Tool.InputSchema,
  }));
}

/**
 * Annotate messages with agent context so the active agent knows
 * which previous messages came from other agents.
 */
function buildAnnotatedMessages(
  messages: Message[],
  activeAgentId: string
): Anthropic.Messages.MessageParam[] {
  return messages.map((m) => {
    // User messages and messages from the active agent: pass through as-is
    if (m.role === 'user' || !m.agentId || m.agentId === activeAgentId) {
      return { role: m.role, content: buildContentBlocks(m) };
    }

    // Assistant message from a DIFFERENT agent: prefix with agent name
    const otherAgent = agents.find((a) => a.id === m.agentId);
    const agentLabel = otherAgent?.name ?? m.agentId;
    const content = buildContentBlocks(m);

    if (typeof content === 'string') {
      return {
        role: m.role as 'user' | 'assistant',
        content: `[Antwoord van ${agentLabel}]\n\n${content}`,
      };
    }

    // Content blocks (with attachments): prepend a text block with the label
    return {
      role: m.role as 'user' | 'assistant',
      content: [
        { type: 'text' as const, text: `[Antwoord van ${agentLabel}]` },
        ...content,
      ],
    };
  });
}

export class ClaudeDirectExecutor implements AgentExecutor {
  async *execute(input: ExecutorInput): AsyncIterable<StreamChunk> {
    const agentMeta = agents.find((a) => a.id === input.agentId);
    if (!agentMeta) {
      throw new Error(`Agent not found: ${input.agentId}`);
    }

    const agentConfig = await loadAgentConfig(agentMeta.configPath);

    let clientConfig = undefined;
    if (agentMeta.requiresClientConfig && input.clientSlug) {
      try {
        clientConfig = await loadClientConfig(input.clientSlug);
      } catch {
        // Client config not found, agent will handle missing config gracefully
      }
    }

    const tenant = getTenant(input.clientSlug || 'default');
    const systemPrompt = buildSystemPrompt(agentConfig, tenant, clientConfig, input.customRules, input.briefing);
    const agentTools = getToolsForAgent(agentMeta.tools);

    // Build messages with agent-context annotations
    const annotatedMessages = buildAnnotatedMessages(input.messages, input.agentId);

    // Check token usage before sending to API
    const totalContent = systemPrompt + input.messages.map((m) => m.content).join('');
    const estimatedTokens = estimateTokens(totalContent);
    if (estimatedTokens / MAX_INPUT_TOKENS >= TOKEN_DANGER_THRESHOLD) {
      yield { status: `Let op: dit gesprek gebruikt ~${Math.round(estimatedTokens / 1000)}K tokens. Start een nieuw gesprek als je problemen ervaart.` };
    }

    // No tools: simple streaming path (existing behavior)
    if (agentTools.length === 0) {
      yield* this.streamSimple(systemPrompt, annotatedMessages);
      return;
    }

    // Tool-enabled path: handle tool loop
    yield* this.streamWithTools(systemPrompt, annotatedMessages, agentTools);
  }

  private async *streamSimple(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[]
  ): AsyncIterable<StreamChunk> {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { text: event.delta.text };
      }
    }

    const final = await stream.finalMessage();
    if (final.usage) {
      yield { usage: { input_tokens: final.usage.input_tokens, output_tokens: final.usage.output_tokens } };
    }
  }

  private async *streamWithTools(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[],
    agentTools: { name: string; description: string; parameters: Record<string, unknown>; execute: (input: Record<string, unknown>) => Promise<unknown> }[]
  ): AsyncIterable<StreamChunk> {
    const toolDefs = buildToolDefinitions(agentTools);
    const maxToolRounds = 5;

    // Use pre-annotated messages as starting point
    const apiMessages: Anthropic.Messages.MessageParam[] = [...messages];

    // Accumulate usage across tool rounds
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (let round = 0; round < maxToolRounds; round++) {
      // Stream the response
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: apiMessages,
        tools: toolDefs,
      });

      // Collect tool_use blocks while streaming text
      const toolUseBlocks: {
        id: string;
        name: string;
        inputJson: string;
      }[] = [];
      let currentToolUse: { id: string; name: string; inputJson: string } | null =
        null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: '',
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield { text: event.delta.text };
          } else if (
            event.delta.type === 'input_json_delta' &&
            currentToolUse
          ) {
            currentToolUse.inputJson += event.delta.partial_json;
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolUse) {
            toolUseBlocks.push(currentToolUse);
            currentToolUse = null;
          }
        }
      }

      // Get the final message for stop_reason and to append to history
      const finalMessage = await stream.finalMessage();

      // Accumulate token usage
      if (finalMessage.usage) {
        totalInputTokens += finalMessage.usage.input_tokens;
        totalOutputTokens += finalMessage.usage.output_tokens;
      }

      // If no tool calls, we're done
      if (
        finalMessage.stop_reason !== 'tool_use' ||
        toolUseBlocks.length === 0
      ) {
        break;
      }

      // Add assistant message (with tool_use blocks) to history
      apiMessages.push({
        role: 'assistant',
        content: finalMessage.content,
      });

      // Execute tools and collect results
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        yield { status: `Website wordt geanalyseerd...` };

        const tool = getTool(toolBlock.name);
        if (!tool) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: `Tool "${toolBlock.name}" niet gevonden.`,
            is_error: true,
          });
          continue;
        }

        try {
          const toolInput = JSON.parse(toolBlock.inputJson);
          const result = await tool.execute(toolInput);
          const resultStr =
            typeof result === 'string' ? result : JSON.stringify(result);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: resultStr,
          });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: `Tool-fout: ${err instanceof Error ? err.message : 'Onbekende fout'}`,
            is_error: true,
          });
        }
      }

      // Add tool results to history
      apiMessages.push({
        role: 'user',
        content: toolResults,
      });

      // Loop continues: next iteration will stream Claude's response
      // after processing tool results
    }

    // Yield accumulated usage from all rounds
    if (totalInputTokens > 0 || totalOutputTokens > 0) {
      yield { usage: { input_tokens: totalInputTokens, output_tokens: totalOutputTokens } };
    }
  }
}

export const defaultExecutor = new ClaudeDirectExecutor();
