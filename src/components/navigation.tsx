'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X, Route, UserRound, Palette } from 'lucide-react';
import { useApp } from './provider';

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CorridaAqui, início">
      <span className="brand-icon">
        <Route size={24} strokeWidth={2.5} />
      </span>
      <span>
        corrida<span className="brand-accent">aqui</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      className="icon-button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title="Alternar tema"
    >
      {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}
export function AccentPicker() {
  const { accent, setAccent } = useApp();
  return (
    <div className="accent-picker">
      <Palette size={17} />
      <span>Cor da marca</span>
      {['teal', 'blue', 'terra'].map((c) => (
        <button
          key={c}
          className={`swatch ${c} ${accent === c ? 'selected' : ''}`}
          onClick={() => setAccent(c)}
          aria-label={`Cor ${c === 'teal' ? 'verde-petróleo' : c === 'blue' ? 'azul' : 'terracota'}`}
          aria-pressed={accent === c}
        />
      ))}
    </div>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { session } = useApp();
  const account = session?.role === 'atleta' ? '/atleta/' : '/entrar/?perfil=atleta';
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Navegação principal">
          <Link className={path === '/' ? 'active' : ''} href="/" onClick={() => setOpen(false)}>
            Explorar eventos
          </Link>
          <Link
            className={path === '/atleta/' ? 'active' : ''}
            href={account}
            onClick={() => setOpen(false)}
          >
            Minhas inscrições
          </Link>
          <Link
            className="organizer-link"
            href={session?.role === 'organizador' ? '/organizador/' : '/entrar/?perfil=organizador'}
            onClick={() => setOpen(false)}
          >
            Sou organizador
            <ArrowUpRight size={15} />
          </Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <span className="header-divider" />
          <Link href={session ? `/${session.role}/` : '/entrar/'} className="account-button">
            <UserRound size={17} />
            <span>{session ? 'Minha área' : 'Entrar'}</span>
          </Link>
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand />
            <p>O seu próximo ponto de partida.</p>
          </div>
          <div className="footer-links">
            <Link href="/">Eventos</Link>
            <Link href="/entrar/?perfil=atleta">Área do atleta</Link>
            <Link href="/entrar/?perfil=organizador">Organizador</Link>
            <Link href="/entrar/?perfil=admin">Administração</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} CorridaAqui · Feito para colocar pessoas em movimento.
          </span>
          <span>Demo interativa · Sem cobranças reais</span>
        </div>
      </div>
    </footer>
  );
}
