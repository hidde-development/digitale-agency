'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  SavedDocument,
  FeedbackEntry,
  TimeSavingEntry,
  TimeEstimateConfig,
  DocumentType,
} from '@/types/dashboard';
import { DEFAULT_TIME_ESTIMATES } from '@/types/dashboard';

const DOCUMENTS_KEY = 'ai-documents';
const FEEDBACK_KEY = 'ai-feedback';
const TIME_SAVINGS_KEY = 'ai-time-savings';
const TIME_CONFIG_KEY = 'ai-time-config';

interface DashboardState {
  documents: SavedDocument[];
  feedback: FeedbackEntry[];
  timeSavings: TimeSavingEntry[];
  timeConfig: TimeEstimateConfig;
}

type DashboardAction =
  | { type: 'LOAD_DOCUMENTS'; documents: SavedDocument[] }
  | { type: 'SAVE_DOCUMENT'; document: SavedDocument }
  | { type: 'DELETE_DOCUMENT'; id: string }
  | { type: 'UPDATE_DOCUMENT_FEEDBACK'; documentId: string; feedback: 'positive' | 'negative' }
  | { type: 'LOAD_FEEDBACK'; feedback: FeedbackEntry[] }
  | { type: 'ADD_FEEDBACK'; entry: FeedbackEntry }
  | { type: 'LOAD_TIME_SAVINGS'; entries: TimeSavingEntry[] }
  | { type: 'ADD_TIME_SAVING'; entry: TimeSavingEntry }
  | { type: 'LOAD_TIME_CONFIG'; config: TimeEstimateConfig }
  | { type: 'UPDATE_TIME_CONFIG'; config: Partial<TimeEstimateConfig> };

const initialState: DashboardState = {
  documents: [],
  feedback: [],
  timeSavings: [],
  timeConfig: DEFAULT_TIME_ESTIMATES,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'LOAD_DOCUMENTS':
      return { ...state, documents: action.documents };

    case 'SAVE_DOCUMENT':
      return { ...state, documents: [action.document, ...state.documents] };

    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) };

    case 'UPDATE_DOCUMENT_FEEDBACK':
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.documentId ? { ...d, feedback: action.feedback } : d
        ),
      };

    case 'LOAD_FEEDBACK':
      return { ...state, feedback: action.feedback };

    case 'ADD_FEEDBACK':
      return {
        ...state,
        feedback: [action.entry, ...state.feedback],
      };

    case 'LOAD_TIME_SAVINGS':
      return { ...state, timeSavings: action.entries };

    case 'ADD_TIME_SAVING':
      return { ...state, timeSavings: [action.entry, ...state.timeSavings] };

    case 'LOAD_TIME_CONFIG':
      return { ...state, timeConfig: action.config };

    case 'UPDATE_TIME_CONFIG':
      return { ...state, timeConfig: { ...state.timeConfig, ...action.config } };

    default:
      return state;
  }
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

interface DashboardContextValue extends DashboardState {
  saveDocument: (doc: Omit<SavedDocument, 'id' | 'createdAt'>) => string;
  deleteDocument: (id: string) => void;
  updateDocumentFeedback: (documentId: string, feedback: 'positive' | 'negative') => void;
  addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'createdAt'>) => string;
  getFeedbackForMessage: (messageId: string) => FeedbackEntry | undefined;
  addTimeSaving: (entry: Omit<TimeSavingEntry, 'id' | 'createdAt'>) => void;
  updateTimeConfig: (config: Partial<TimeEstimateConfig>) => void;
  getDocumentsByAgent: (agentId: string) => SavedDocument[];
  getFeedbackByAgent: (agentId: string) => FeedbackEntry[];
  getTotalTimeSaved: (period?: 'month' | 'all') => number;
  getDefaultEstimate: (type: DocumentType) => number;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_DOCUMENTS', documents: loadJson<SavedDocument[]>(DOCUMENTS_KEY, []) });
    dispatch({ type: 'LOAD_FEEDBACK', feedback: loadJson<FeedbackEntry[]>(FEEDBACK_KEY, []) });
    dispatch({ type: 'LOAD_TIME_SAVINGS', entries: loadJson<TimeSavingEntry[]>(TIME_SAVINGS_KEY, []) });
    dispatch({ type: 'LOAD_TIME_CONFIG', config: loadJson<TimeEstimateConfig>(TIME_CONFIG_KEY, DEFAULT_TIME_ESTIMATES) });
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (state.documents.length > 0) saveJson(DOCUMENTS_KEY, state.documents);
  }, [state.documents]);

  useEffect(() => {
    if (state.feedback.length > 0) saveJson(FEEDBACK_KEY, state.feedback);
  }, [state.feedback]);

  useEffect(() => {
    if (state.timeSavings.length > 0) saveJson(TIME_SAVINGS_KEY, state.timeSavings);
  }, [state.timeSavings]);

  useEffect(() => {
    saveJson(TIME_CONFIG_KEY, state.timeConfig);
  }, [state.timeConfig]);

  const saveDocument = useCallback((doc: Omit<SavedDocument, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const document: SavedDocument = {
      ...doc,
      id,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SAVE_DOCUMENT', document });
    return id;
  }, []);

  const deleteDocument = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', id });
    const saved = loadJson<SavedDocument[]>(DOCUMENTS_KEY, []).filter((d) => d.id !== id);
    saveJson(DOCUMENTS_KEY, saved);
  }, []);

  const updateDocumentFeedback = useCallback((documentId: string, feedback: 'positive' | 'negative') => {
    dispatch({ type: 'UPDATE_DOCUMENT_FEEDBACK', documentId, feedback });
  }, []);

  const addFeedback = useCallback((entry: Omit<FeedbackEntry, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const feedbackEntry: FeedbackEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FEEDBACK', entry: feedbackEntry });
    return id;
  }, []);

  const getFeedbackForMessage = useCallback(
    (messageId: string) => state.feedback.find((f) => f.messageId === messageId),
    [state.feedback]
  );

  const addTimeSaving = useCallback((entry: Omit<TimeSavingEntry, 'id' | 'createdAt'>) => {
    const timeSaving: TimeSavingEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TIME_SAVING', entry: timeSaving });
  }, []);

  const updateTimeConfig = useCallback((config: Partial<TimeEstimateConfig>) => {
    dispatch({ type: 'UPDATE_TIME_CONFIG', config });
  }, []);

  const getDocumentsByAgent = useCallback(
    (agentId: string) => state.documents.filter((d) => d.agentId === agentId),
    [state.documents]
  );

  const getFeedbackByAgent = useCallback(
    (agentId: string) => state.feedback.filter((f) => f.agentId === agentId),
    [state.feedback]
  );

  const getTotalTimeSaved = useCallback(
    (period?: 'month' | 'all') => {
      if (!period || period === 'all') {
        return state.timeSavings.reduce((sum, t) => sum + t.minutesSaved, 0);
      }
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return state.timeSavings
        .filter((t) => t.createdAt >= startOfMonth)
        .reduce((sum, t) => sum + t.minutesSaved, 0);
    },
    [state.timeSavings]
  );

  const getDefaultEstimate = useCallback(
    (type: DocumentType) => state.timeConfig[type] ?? 60,
    [state.timeConfig]
  );

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        saveDocument,
        deleteDocument,
        updateDocumentFeedback,
        addFeedback,
        getFeedbackForMessage,
        addTimeSaving,
        updateTimeConfig,
        getDocumentsByAgent,
        getFeedbackByAgent,
        getTotalTimeSaved,
        getDefaultEstimate,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
}
