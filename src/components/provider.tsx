'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Check, Info, X } from 'lucide-react';
import { createSeed } from '@/lib/data';
import type { Database, Session } from '@/lib/types';
import { uid } from '@/lib/utils';

const STORAGE = 'corridaqui-demo-v2';
interface Context {
  db: Database;
  ready: boolean;
  session: Session | null;
  theme: string;
  accent: string;
  update: (fn: (db: Database) => Database, activity?: string) => void;
  login: (s: Session) => void;
  logout: () => void;
  /** Recebe o evento do botão para a animação sair dele. */
  toggleTheme: (event?: { currentTarget: Element }) => void;
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
    [accent, setAccentState] = useState('blue');
  const [message, setMessage] = useState('');
  // Intentional browser-storage hydration after the identical server/client first render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.version === 2 &&
          Array.isArray(parsed.events) &&
          Array.isArray(parsed.registrations) &&
          Array.isArray(parsed.testimonials)
        )
          setDb(parsed);
      }
      const auth = sessionStorage.getItem('corridaqui-session');
      if (auth) setSession(JSON.parse(auth));
      setTheme(localStorage.getItem('corridaqui-theme') || 'light');
      setAccentState(localStorage.getItem('corridaqui-cor') || 'blue');
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
        localStorage.setItem('corridaqui-cor', accent);
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
  // Troca de tema com View Transitions: o tema novo cresce em círculo a partir do
  // botão clicado. Sem suporte no navegador ou com "reduzir movimento", troca direto.
  function toggleTheme(event?: { currentTarget: Element }) {
    const next = theme === 'light' ? 'dark' : 'light';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      flushSync(() => setTheme(next));
    };
    if (
      typeof document.startViewTransition !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      apply();
      return;
    }
    const rect = event?.currentTarget.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    document
      .startViewTransition(apply)
      .ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 550,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {});
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
        toggleTheme,
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
