import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import type { FeedbackEntry } from '@/types/dashboard';

interface RequestBody {
  feedback: FeedbackEntry[];
  agentId?: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { feedback, agentId } = body;

    if (!feedback || feedback.length === 0) {
      return NextResponse.json(
        { error: 'Geen feedback ontvangen' },
        { status: 400 }
      );
    }

    // Filter to negative feedback only
    const negativeFeedback = feedback.filter((f) => {
      if (f.rating !== 'negative') return false;
      if (agentId && f.agentId !== agentId) return false;
      return true;
    });

    if (negativeFeedback.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Build summary for Claude
    const feedbackSummary = negativeFeedback
      .filter((f) => f.comment)
      .map((f) => `- Agent: ${f.agentId} | Opmerking: "${f.comment}"`)
      .join('\n');

    if (!feedbackSummary) {
      return NextResponse.json({
        suggestions: [
          'Voeg opmerkingen toe bij negatieve feedback zodat er betere regelvoorstellen gegenereerd kunnen worden.',
        ],
      });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Je bent een prompt-engineer voor een AI marketing agency tool. Op basis van de volgende negatieve feedback van gebruikers, genereer 2-5 concrete regelvoorstellen die de gebruiker kan toevoegen aan zijn "standaard regels" om de output te verbeteren.

Feedback:
${feedbackSummary}

Geef je antwoord als JSON array van strings, elke string is een concrete regel in het Nederlands.
Voorbeeld: ["Gebruik altijd de u-vorm in formele teksten", "Houd paragrafen kort: maximaal 4 zinnen"]

Antwoord alleen met de JSON array, geen extra tekst.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ suggestions: [] });
    }

    try {
      const suggestions = JSON.parse(content.text);
      return NextResponse.json({ suggestions });
    } catch {
      // If Claude didn't return valid JSON, extract the array
      const match = content.text.match(/\[[\s\S]*\]/);
      if (match) {
        const suggestions = JSON.parse(match[0]);
        return NextResponse.json({ suggestions });
      }
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error) {
    console.error('suggest-rules error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het genereren van regelvoorstellen' },
      { status: 500 }
    );
  }
}
