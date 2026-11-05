'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  ArrowUpRight,
  Menu,
  Moon,
  Sun,
  X,
  Route,
  UserRound,
  Palette,
  Mail,
  MessageCircle,
  Instagram,
  Youtube,
  Activity,
  Search,
  LifeBuoy,
} from 'lucide-react';
import { useApp } from './provider';
import { getSearch, setSearch, subscribeSearch } from '@/lib/search';

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
const accents = [
  ['teal', 'verde-petróleo'],
  ['blue', 'azul'],
  ['terra', 'terracota'],
  ['orange', 'laranja largada'],
  ['coral', 'coral pista'],
  ['navy', 'azul noite'],
  ['petrol', 'azul-petróleo'],
  ['violet', 'roxo elétrico'],
  ['magenta', 'magenta'],
  ['graphite', 'grafite e lima'],
] as const;
export function AccentPicker() {
  const { accent, setAccent } = useApp();
  return (
    <div className="accent-picker">
      <Palette size={17} />
      <span>Cor da marca</span>
      <div className="accent-swatches">
        {accents.map(([c, label]) => (
          <button
            key={c}
            className={`swatch ${c} ${accent === c ? 'selected' : ''}`}
            onClick={() => setAccent(c)}
            aria-label={`Cor ${label}`}
            title={label[0].toUpperCase() + label.slice(1)}
            aria-pressed={accent === c}
          />
        ))}
      </div>
    </div>
  );
}
function HeaderSearch() {
  const router = useRouter();
  const value = useSyncExternalStore(subscribeSearch, getSearch, () => '');
  return (
    <form
      className="header-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setSearch(value.trim());
        router.push('/#eventos');
      }}
    >
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        aria-label="Buscar corrida, cidade ou distância"
        placeholder="Corrida, cidade ou distância"
        value={value}
        onChange={(e) => setSearch(e.target.value)}
      />
    </form>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { session } = useApp();
  const account = session?.role === 'atleta' ? '/atleta/' : '/entrar/?perfil=atleta';
  const organizer =
    session?.role === 'organizador' ? '/organizador/' : '/entrar/?perfil=organizador';
  return (
    <>
      <div className="header-top">
        <div className="container header-top-inner">
          <Link href="/#como-funciona">Ajuda</Link>
          <Link href={organizer} className="header-top-strong">
            Sou organizador
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <HeaderSearch />
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
            <Link className="organizer-link" href={organizer} onClick={() => setOpen(false)}>
              Sou organizador
              <ArrowUpRight size={15} />
            </Link>
            <Link className="mobile-only" href="/#como-funciona" onClick={() => setOpen(false)}>
              <LifeBuoy size={15} />
              Ajuda
            </Link>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
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
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Brand />
            <p>
              Encontre seu próximo desafio. Eventos esportivos, inscrições e gestão em uma
              plataforma.
            </p>
            <div className="footer-social">
              <a
                href="#"
                aria-label="Instagram"
                className="social-link"
                onClick={(e) => e.preventDefault()}
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="social-link"
                onClick={(e) => e.preventDefault()}
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                aria-label="Strava"
                className="social-link"
                onClick={(e) => e.preventDefault()}
              >
                <Activity size={16} />
              </a>
            </div>
          </div>
          <div className="footer-links-col">
            <strong>Plataforma</strong>
            <Link href="/">Explorar eventos</Link>
            <Link href="/entrar/?perfil=atleta">Área do atleta</Link>
            <Link href="/entrar/?perfil=organizador">Para organizadores</Link>
          </div>
          <div className="footer-links-col">
            <strong>Legal</strong>
            <Link href="/termos/">Termos de uso</Link>
            <Link href="/privacidade/">Política de privacidade</Link>
          </div>
          <div className="footer-links-col">
            <strong>Contato</strong>
            <a href="mailto:oi@corridaqui.demo">
              <Mail size={13} />
              oi@corridaqui.demo
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <MessageCircle size={13} />
              WhatsApp
            </a>
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
