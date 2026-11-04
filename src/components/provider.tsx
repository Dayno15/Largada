'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Check, Info, X } from 'lucide-react';
import { createSeed } from '@/lib/data';
import type { Database, Session } from '@/lib/types';
import { uid } from '@/lib/utils';

const STORAGE = 'corridaqui-demo-v1';
interface Context {
  db: Database;
  ready: boolean;
  session: Session | null;
  theme: string;
  accent: string;
  update: (fn: (db: Database) => Database, activity?: string) => void;
  login: (s: Session) => void;
  logout: () => void;
  toggleTheme: () => void;
  setAccent: (color: string) => void;
  toast: (message: string) => void;
  reset: () => void;
}
const AppContext = createContext<Context | null>(null);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppProvider ausente');
  return ctx;
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(createSeed);
  const [ready, setReady] = useState(false),
    [session, setSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState('light'),
    [accent, setAccentState] = useState('teal');
  const [message, setMessage] = useState('');
  // Intentional browser-storage hydration after the identical server/client first render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.version === 1 &&
          Array.isArray(parsed.events) &&
          Array.isArray(parsed.registrations)
        )
          setDb(parsed);
      }
      const auth = sessionStorage.getItem('corridaqui-session');
      if (auth) setSession(JSON.parse(auth));
      setTheme(localStorage.getItem('corridaqui-theme') || 'light');
      setAccentState(localStorage.getItem('corridaqui-accent') || 'teal');
    } catch {
      /* Storage is optional: the demo works in memory. */
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORAGE, JSON.stringify(db));
      } catch {
        /* Storage unavailable */
      }
  }, [db, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accent;
    if (ready)
      try {
        localStorage.setItem('corridaqui-theme', theme);
        localStorage.setItem('corridaqui-accent', accent);
      } catch {
        /* Storage unavailable */
      }
  }, [theme, accent, ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  function login(s: Session) {
    setSession(s);
    try {
      sessionStorage.setItem('corridaqui-session', JSON.stringify(s));
    } catch {}
  }
  function logout() {
    setSession(null);
    try {
      sessionStorage.removeItem('corridaqui-session');
    } catch {}
  }
  function update(fn: (d: Database) => Database, activity?: string) {
    setDb((old) => {
      const next = fn(old);
      return activity
        ? {
            ...next,
            activities: [
              {
                id: uid('log'),
                text: activity,
                date: new Date().toISOString(),
                actor: session?.name || 'Atleta',
              },
              ...next.activities,
            ],
          }
        : next;
    });
  }
  return (
    <AppContext.Provider
      value={{
        db,
        ready,
        session,
        theme,
        accent,
        update,
        login,
        logout,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
        setAccent: setAccentState,
        toast: setMessage,
        reset: () => {
          setDb(createSeed());
          setMessage('Dados de demonstração restaurados.');
        },
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{message}</span>
          <button onClick={() => setMessage('')} aria-label="Fechar aviso">
            <X size={16} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-notice ${compact ? 'compact' : ''}`}>
      <Info size={15} />
      <span>
        Ambiente de demonstração{!compact && ' · Dados fictícios. Nenhuma cobrança real.'}
      </span>
    </div>
  );
}
