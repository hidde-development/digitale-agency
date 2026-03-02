export type DocumentType = 'artikel' | 'social-post' | 'ad' | 'analyse' | 'persona';

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  agentId: string;
  conversationId: string;
  messageId: string;
  feedback?: 'positive' | 'negative';
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 'positive' | 'negative';
  comment?: string;
  agentId: string;
  createdAt: string;
}

export interface TimeSavingEntry {
  id: string;
  documentId?: string;
  agentId: string;
  documentType: DocumentType;
  minutesSaved: number;
  createdAt: string;
}

export interface TimeEstimateConfig {
  artikel: number;
  'social-post': number;
  ad: number;
  persona: number;
  analyse: number;
}

export const AGENT_DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
  'seo-specialist': 'artikel',
  'tone-of-voice': 'artikel',
  'social-specialist': 'social-post',
  'doelgroep-specialist': 'persona',
  'website-auditor': 'analyse',
  'ad-specialist': 'ad',
  'intentie-coach': 'analyse',
};

export const DEFAULT_TIME_ESTIMATES: TimeEstimateConfig = {
  artikel: 240,
  'social-post': 30,
  ad: 120,
  persona: 180,
  analyse: 120,
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  artikel: 'Artikel',
  'social-post': 'Social post',
  ad: 'Advertentie',
  analyse: 'Analyse',
  persona: 'Persona',
};
