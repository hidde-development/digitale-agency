import type { AgentMeta } from '@/types/agent';

export const agents: AgentMeta[] = [
  {
    id: 'seo-specialist',
    name: 'SEO-specialist',
    description: 'Schrijf SEO-content, optimaliseer teksten, vertaal zoekwoorden en ontwerp site-structuren.',
    avatar: '🔍',
    configPath: 'seo-specialist.json',
    suggestedTasks: [
      {
        label: 'Schrijf een SEO-artikel',
        prompt: 'Ik wil een nieuw SEO-artikel schrijven.',
      },
      {
        label: 'Optimaliseer bestaande content',
        prompt: 'Ik wil bestaande content optimaliseren voor SEO en AI-vindbaarheid.',
      },
      {
        label: 'Vertaal zoekwoorden',
        prompt: 'Ik wil zoekwoorden vertalen en uitbreiden naar andere talen.',
      },
      {
        label: 'Optimaliseer op Helpful Content',
        prompt: 'Ik wil mijn content laten checken en optimaliseren op basis van de Google Helpful Content-richtlijnen.',
      },
      {
        label: 'Ontwerp een site-structuur',
        prompt: 'Ik wil een site-structuur (Semantic Content Tree) opstellen.',
      },
    ],
    requiresClientConfig: false,
    tools: ['web_scraper'],
  },
  {
    id: 'tone-of-voice',
    name: 'Tone of Voice specialist',
    description: 'Genereer of herschrijf content in de merkstijl van je organisatie.',
    avatar: '✍️',
    configPath: 'tone-of-voice.json',
    suggestedTasks: [
      {
        label: 'Herschrijf tekst naar merkstijl',
        prompt: 'Ik wil bestaande tekst herschrijven naar de juiste tone of voice.',
      },
      {
        label: 'Genereer nieuwe content',
        prompt: 'Ik wil nieuwe content genereren in onze merkstijl.',
      },
    ],
    requiresClientConfig: true,
    tools: [],
  },
  {
    id: 'social-specialist',
    name: 'Social-specialist',
    description: 'Creëer platform-specifieke social content: posts, carousels, video-scripts en memes.',
    avatar: '📱',
    configPath: 'social-specialist.json',
    suggestedTasks: [
      {
        label: 'Start een briefing',
        prompt: 'Ik wil social content maken. Help me met de briefing.',
      },
      {
        label: 'Content voor LinkedIn',
        prompt: 'Ik wil content maken voor LinkedIn. Welke informatie heb je van me nodig?',
      },
      {
        label: 'Content voor Instagram',
        prompt: 'Ik wil content maken voor Instagram. Welke informatie heb je van me nodig?',
      },
      {
        label: 'Video-script (TikTok/Reels)',
        prompt: 'Ik wil een video-script maken voor korte video. Welke informatie heb je van me nodig?',
      },
    ],
    requiresClientConfig: false,
    tools: [],
  },
  {
    id: 'doelgroep-specialist',
    name: 'Doelgroep-specialist',
    description: 'Genereer rijke persona-profielen en faciliteer synthetische focusgroepen om doelgroepinzichten te valideren.',
    avatar: '🎯',
    configPath: 'doelgroep-specialist.json',
    suggestedTasks: [
      {
        label: 'Maak een persona',
        prompt: 'Ik wil een persona-profiel maken voor mijn doelgroep.',
      },
      {
        label: 'Start een focusgroep',
        prompt: 'Ik wil een concept testen bij een synthetische focusgroep.',
      },
      {
        label: 'Analyseer mijn doelgroep',
        prompt: 'Ik wil mijn doelgroep beter in kaart brengen. Welke informatie heb je nodig?',
      },
    ],
    requiresClientConfig: false,
    tools: [],
  },
  {
    id: 'website-auditor',
    name: 'Website Auditor',
    description: 'Scan websites op WCAG-toegankelijkheid, SEO-kwaliteit en content-effectiviteit.',
    avatar: '🔎',
    configPath: 'website-auditor.json',
    suggestedTasks: [
      {
        label: 'WCAG-toegankelijkheidscheck',
        prompt: 'Ik wil een website laten checken op WCAG-toegankelijkheid.',
      },
      {
        label: 'SEO-audit',
        prompt: 'Ik wil een SEO-audit uitvoeren op een webpagina.',
      },
      {
        label: 'Volledige website-scan',
        prompt: 'Ik wil een volledige doorlichting van een webpagina: toegankelijkheid, SEO en content.',
      },
    ],
    requiresClientConfig: false,
    tools: ['web_scraper'],
  },
  {
    id: 'ad-specialist',
    name: 'Ad-specialist',
    description: 'Schrijf advertenties voor Google Ads (SEA), Meta (Facebook/Instagram) en Digital Out of Home.',
    avatar: '📣',
    configPath: 'ad-specialist.json',
    suggestedTasks: [
      {
        label: 'Google Ads schrijven',
        prompt: 'Ik wil advertenties schrijven voor Google Ads.',
      },
      {
        label: 'Meta Ads schrijven',
        prompt: 'Ik wil advertenties schrijven voor Facebook en/of Instagram.',
      },
      {
        label: 'DOOH copy schrijven',
        prompt: 'Ik wil copy schrijven voor Digital Out of Home (buitenreclame).',
      },
      {
        label: 'Ads voor meerdere kanalen',
        prompt: 'Ik wil een campagne uitwerken voor meerdere advertentiekanalen.',
      },
    ],
    requiresClientConfig: false,
    tools: [],
  },
  {
    id: 'intentie-coach',
    name: 'Intentie-coach',
    description: 'Strategische coach die het Intentiegedreven model (Merkvisie → Gebruiker → Creativiteit) toepast om briefings te analyseren en actiegerichte aanbevelingen te geven.',
    avatar: '🧭',
    configPath: 'intentie-coach.json',
    suggestedTasks: [
      {
        label: 'Analyseer een briefing',
        prompt: 'Ik heb een briefing die ik wil laten analyseren vanuit het Intentiegedreven model.',
      },
      {
        label: 'Strategische sparring',
        prompt: 'Ik wil sparren over de strategische aanpak van een project.',
      },
      {
        label: 'Campagne-check',
        prompt: 'Ik wil een bestaande campagne of concept laten toetsen aan het Intentiegedreven model.',
      },
      {
        label: 'Merkvisie verhelderen',
        prompt: 'Ik wil de merkvisie en positionering van een klant scherper krijgen.',
      },
    ],
    requiresClientConfig: false,
    tools: [],
  },
];
