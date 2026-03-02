'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Message, Conversation, Attachment, Briefing, TokenUsage } from '@/types/chat';

const STORAGE_KEY = 'ai-conversations';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
}

type ChatAction =
  | { type: 'LOAD_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'CREATE_CONVERSATION'; conversation: Conversation }
  | { type: 'SET_ACTIVE'; conversationId: string | null }
  | { type: 'ADD_MESSAGE'; conversationId: string; message: Message }
  | { type: 'ADD_AGENT_TO_CONVERSATION'; conversationId: string; agentId: string }
  | {
      type: 'APPEND_STREAM';
      conversationId: string;
      messageId: string;
      text: string;
    }
  | { type: 'SET_STREAMING'; isStreaming: boolean }
  | { type: 'UPDATE_TITLE'; conversationId: string; title: string }
  | { type: 'TOGGLE_PIN'; conversationId: string }
  | { type: 'UPDATE_BRIEFING'; conversationId: string; briefing: Briefing }
  | { type: 'DELETE_CONVERSATION'; conversationId: string }
  | { type: 'SET_MESSAGE_USAGE'; conversationId: string; messageId: string; usage: TokenUsage };

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'LOAD_CONVERSATIONS':
      return { ...state, conversations: action.conversations };

    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.conversation, ...state.conversations],
        activeConversationId: action.conversation.id,
      };

    case 'SET_ACTIVE':
      return { ...state, activeConversationId: action.conversationId };

    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: [...c.messages, action.message],
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'ADD_AGENT_TO_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId &&
          !c.agentIds.includes(action.agentId)
            ? { ...c, agentIds: [...c.agentIds, action.agentId] }
            : c
        ),
      };

    case 'APPEND_STREAM':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId
                    ? { ...m, content: m.content + action.text }
                    : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.isStreaming };

    case 'UPDATE_TITLE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, title: action.title }
            : c
        ),
      };

    case 'TOGGLE_PIN':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, pinned: !c.pinned }
            : c
        ),
      };

    case 'UPDATE_BRIEFING':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, briefing: action.briefing, updatedAt: new Date().toISOString() }
            : c
        ),
      };

    case 'DELETE_CONVERSATION': {
      const filtered = state.conversations.filter(
        (c) => c.id !== action.conversationId
      );
      return {
        ...state,
        conversations: filtered,
        activeConversationId:
          state.activeConversationId === action.conversationId
            ? null
            : state.activeConversationId,
      };
    }

    case 'SET_MESSAGE_USAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId
                    ? { ...m, usage: action.usage }
                    : m
                ),
              }
            : c
        ),
      };

    default:
      return state;
  }
}

function saveToStorage(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage full or unavailable
  }
}

function loadFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    // Migrate old conversations without agentIds
    return parsed.map((c) => ({
      ...c,
      agentIds: c.agentIds ?? [c.agentId],
    }));
  } catch {
    return [];
  }
}

interface ChatContextValue extends ChatState {
  sendMessage: (
    content: string,
    agentId: string,
    clientSlug?: string,
    attachments?: Attachment[],
    customRules?: string,
    briefing?: Briefing
  ) => Promise<void>;
  stopStreaming: () => void;
  createConversation: (agentId: string) => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateBriefing: (id: string, briefing: Briefing) => void;
  togglePin: (id: string) => void;
  getAllConversations: () => Conversation[];
  activeConversation: Conversation | undefined;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      dispatch({ type: 'LOAD_CONVERSATIONS', conversations: saved });
    }
  }, []);

  // Save to localStorage when conversations change
  useEffect(() => {
    if (state.conversations.length > 0) {
      saveToStorage(state.conversations);
    }
  }, [state.conversations]);

  const activeConversation = state.conversations.find(
    (c) => c.id === state.activeConversationId
  );

  const getAllConversations = useCallback(
    () =>
      [...state.conversations].sort((a, b) => {
        // Pinned conversations first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Then by most recently updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [state.conversations]
  );

  const createConversation = useCallback((agentId: string) => {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title: 'Nieuw gesprek',
      agentId,
      agentIds: [agentId],
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_CONVERSATION', conversation });
    return id;
  }, []);

  const setActiveConversation = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE', conversationId: id });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', conversationId: id });
    const saved = loadFromStorage().filter((c) => c.id !== id);
    saveToStorage(saved);
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    dispatch({ type: 'UPDATE_TITLE', conversationId: id, title });
  }, []);

  const togglePin = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PIN', conversationId: id });
  }, []);

  const updateBriefing = useCallback((id: string, briefing: Briefing) => {
    dispatch({ type: 'UPDATE_BRIEFING', conversationId: id, briefing });
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: 'SET_STREAMING', isStreaming: false });
  }, []);

  const sendMessage = useCallback(
    async (content: string, agentId: string, clientSlug?: string, attachments?: Attachment[], customRules?: string, briefing?: Briefing) => {
      let convId = state.activeConversationId;
      const currentConv = state.conversations.find((c) => c.id === convId);

      if (!convId || !currentConv) {
        convId = crypto.randomUUID();
        const conversation: Conversation = {
          id: convId,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          agentId,
          agentIds: [agentId],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          briefing,
        };
        dispatch({ type: 'CREATE_CONVERSATION', conversation });
      } else {
        if (!currentConv.agentIds.includes(agentId)) {
          dispatch({
            type: 'ADD_AGENT_TO_CONVERSATION',
            conversationId: convId,
            agentId,
          });
        }
        if (currentConv.messages.length === 0) {
          dispatch({
            type: 'UPDATE_TITLE',
            conversationId: convId,
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          });
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
        agentId,
        attachments: attachments?.length ? attachments : undefined,
      };
      dispatch({ type: 'ADD_MESSAGE', conversationId: convId, message: userMessage });

      const assistantId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        agentId,
      };
      dispatch({
        type: 'ADD_MESSAGE',
        conversationId: convId,
        message: assistantMessage,
      });
      dispatch({ type: 'SET_STREAMING', isStreaming: true });

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const conv = state.conversations.find((c) => c.id === convId);
        const previousMessages = conv?.messages ?? [];
        const allMessages = [...previousMessages, userMessage];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({
              role: m.role,
              content: m.content,
              agentId: m.agentId,
              attachments: m.attachments,
            })),
            agentId,
            clientSlug: clientSlug ?? 'default',
            customRules: customRules || undefined,
            briefing: briefing || currentConv?.briefing || undefined,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          if (response.status === 429) {
            throw new Error('rate_limit');
          }
          throw new Error(errorText || `status_${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                dispatch({
                  type: 'APPEND_STREAM',
                  conversationId: convId!,
                  messageId: assistantId,
                  text: parsed.text,
                });
              }
              if (parsed.status) {
                dispatch({
                  type: 'APPEND_STREAM',
                  conversationId: convId!,
                  messageId: assistantId,
                  text: `\n\n_${parsed.status}_\n\n`,
                });
              }
              if (parsed.usage) {
                dispatch({
                  type: 'SET_MESSAGE_USAGE',
                  conversationId: convId!,
                  messageId: assistantId,
                  usage: parsed.usage,
                });
              }
              if (parsed.error) {
                dispatch({
                  type: 'APPEND_STREAM',
                  conversationId: convId!,
                  messageId: assistantId,
                  text: `\n\n> ⚠️ ${parsed.error}`,
                });
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch (error) {
        // Don't show error for intentional abort
        if (error instanceof DOMException && error.name === 'AbortError') {
          // User stopped generation
        } else {
          const msg = error instanceof Error ? error.message : '';
          let friendly: string;
          if (msg.includes('rate_limit')) {
            friendly = 'Er worden te veel verzoeken tegelijk verstuurd. Wacht even en probeer het opnieuw.';
          } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
            friendly = 'Kan geen verbinding maken met de server. Controleer je internetverbinding en probeer het opnieuw.';
          } else {
            friendly = 'Er ging iets mis. Probeer het later opnieuw.';
          }
          dispatch({
            type: 'APPEND_STREAM',
            conversationId: convId!,
            messageId: assistantId,
            text: `\n\n> ⚠️ ${friendly}`,
          });
        }
      } finally {
        abortControllerRef.current = null;
        dispatch({ type: 'SET_STREAMING', isStreaming: false });
      }
    },
    [state.conversations, state.activeConversationId]
  );

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        stopStreaming,
        createConversation,
        setActiveConversation,
        deleteConversation,
        updateTitle,
        updateBriefing,
        togglePin,
        getAllConversations,
        activeConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
