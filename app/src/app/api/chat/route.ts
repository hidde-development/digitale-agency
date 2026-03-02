import { defaultExecutor } from '@/lib/agents/executor';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ChatRequest } from '@/types/chat';

function mapErrorToFriendlyMessage(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes('overloaded')) {
    return 'Excuses, de server van Anthropic is momenteel overbelast. Probeer het over een paar minuten nog eens.';
  }
  if (lower.includes('rate_limit') || lower.includes('rate limit') || lower.includes('429')) {
    return 'Er worden te veel verzoeken tegelijk verstuurd. Wacht even en probeer het opnieuw.';
  }
  if (lower.includes('authentication') || lower.includes('invalid api key') || lower.includes('401')) {
    return 'Er is een probleem met de API-configuratie. Neem contact op met de beheerder.';
  }
  if (lower.includes('insufficient') || lower.includes('billing') || lower.includes('credit')) {
    return 'Er is een probleem met het API-tegoed. Neem contact op met de beheerder.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'Het verzoek duurde te lang. Probeer het opnieuw, eventueel met een kortere vraag.';
  }
  if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('econnrefused')) {
    return 'Kan geen verbinding maken met de AI-server. Controleer je internetverbinding en probeer het opnieuw.';
  }
  if (lower.includes('invalid_request') || lower.includes('bad request')) {
    return 'Er ging iets mis met het verzoek. Probeer het opnieuw of herformuleer je vraag.';
  }
  if (lower.includes('content_filter') || lower.includes('content moderation')) {
    return 'Je bericht kon niet verwerkt worden vanwege inhoudsrichtlijnen. Pas je vraag aan en probeer het opnieuw.';
  }

  return 'Er ging iets mis. Probeer het later opnieuw.';
}

export async function POST(request: Request) {
  // Rate limiting by IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return new Response('Te veel verzoeken. Probeer het over een minuut opnieuw.', {
      status: 429,
      headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' },
    });
  }

  const body = (await request.json()) as ChatRequest;
  const { messages, agentId, clientSlug, customRules, briefing } = body;

  if (!agentId || !messages?.length) {
    return new Response('Missing agentId or messages', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chunks = defaultExecutor.execute({
          agentId,
          clientSlug,
          customRules,
          briefing,
          messages: messages.map((m) => ({
            id: '',
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(),
            agentId: m.agentId,
            attachments: m.attachments,
          })),
        });

        for await (const chunk of chunks) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const raw =
          error instanceof Error ? error.message : String(error);
        const friendly = mapErrorToFriendlyMessage(raw);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: friendly })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-RateLimit-Remaining': String(remaining),
    },
  });
}
