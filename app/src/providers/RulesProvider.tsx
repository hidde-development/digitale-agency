'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'user-custom-rules';
const STORAGE_INITIALIZED_KEY = 'user-custom-rules-initialized';

const DEFAULT_RULES = `Schrijf altijd in correct Nederlands. Gebruik Nederlandse hoofdletterregels: alleen het eerste woord van een kop begint met een hoofdletter, niet elk woord. Houd antwoorden professioneel maar toegankelijk.`;

interface RulesContextValue {
  rules: string;
  updateRules: (rules: string) => void;
}

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState('');

  useEffect(() => {
    try {
      const initialized = localStorage.getItem(STORAGE_INITIALIZED_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!initialized) {
        // First-time user: set default rules
        setRules(DEFAULT_RULES);
        localStorage.setItem(STORAGE_KEY, DEFAULT_RULES);
        localStorage.setItem(STORAGE_INITIALIZED_KEY, '1');
      } else if (saved) {
        setRules(saved);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const updateRules = useCallback((newRules: string) => {
    setRules(newRules);
    try {
      localStorage.setItem(STORAGE_KEY, newRules);
    } catch {
      // localStorage full or unavailable
    }
  }, []);

  return (
    <RulesContext.Provider value={{ rules, updateRules }}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRulesContext() {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRulesContext must be used within RulesProvider');
  }
  return context;
}
