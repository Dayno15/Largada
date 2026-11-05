'use client';
import Link from 'next/link';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ShieldCheck,
  Compass,
  Ticket,
  Flag,
  Users,
  TrendingUp,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { Header, Footer } from './navigation';
import { useApp } from './provider';
import { Badge, EmptyState, SportIcon, Modal } from './ui';
import { sports } from '@/lib/data';
import { asset, clean, dateLabel, daysUntil, money, moneyCompact, states } from '@/lib/utils';
import type { RaceEvent } from '@/lib/types';
import { getSearch, setSearch, subscribeSearch } from '@/lib/search';
import { features } from '@/lib/features';

function useIntersect(ref: { current: Element | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

const FAVS_EVENT = 'cq-favs-change';
const readFavs = (): string[] => JSON.parse(localStorage.getItem('cq_favs') || '[]');
const subscribeFavs = (onChange: () => void) => {
  window.addEventListener(FAVS_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(FAVS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

function FavoriteBtn({ eventId }: { eventId: string }) {
  const fav = useSyncExternalStore(
    subscribeFavs,
    () => readFavs().includes(eventId),
    () => false,
  );
  const toggle = (e: { preventDefault(): void; stopPropagation(): void }) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = readFavs();
    const next = fav ? favs.filter((id) => id !== eventId) : [...favs, eventId];
    localStorage.setItem('cq_favs', JSON.stringify(next));
    window.dispatchEvent(new Event(FAVS_EVENT));
  };
  return (
    <button
      className={`fav-btn${fav ? ' active' : ''}`}
      onClick={toggle}
      aria-label={fav ? 'Remover dos favoritos' : 'Favoritar evento'}
    >
      <Heart size={15} />
    </button>
  );
}

export function EventCard({ event, used }: { event: RaceEvent; used: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const visible = useIntersect(ref);
  const open = event.status === 'Inscrições abertas';
  const pct = Math.min(100, Math.round((used / event.capacity) * 100));
  const almostFull = pct >= 75;
  const lastSpots = open && pct >= 80;
  const upcoming = event.status === 'Em breve';
  const daysUntilReg =
    upcoming && event.registrationStart ? daysUntil(event.registrationStart) : null;
  return (
    <Link
      ref={ref}
      href={`/evento/?id=${event.id}`}
      className={`event-card${visible ? ' in' : ''}`}
    >
      <div className="event-image">
        <img src={asset(event.image)} alt={`${event.sport} em ${event.city}`} loading="lazy" />
        <div className="event-image-top">
          <span className="image-sport">
            <SportIcon sport={event.sport} size={14} />
            {event.sport}
          </span>
          <span className="image-top-right">
            {features.favorites && <FavoriteBtn eventId={event.id} />}
            <span className="image-arrow">
              <ArrowUpRight size={18} />
            </span>
          </span>
        </div>
        <div className="event-date-tile">
          <strong>{new Date(event.date + 'T12:00:00').getDate()}</strong>
          <span>{dateLabel(event.date, { month: 'short' }).replace('.', '')}</span>
        </div>
      </div>
      <div className="event-body">
        <div className="event-card-status">
          {lastSpots ? <Badge tone="amber">Últimas vagas!</Badge> : <Badge>{event.status}</Badge>}
          <span>{event.distances.map((d) => d.name).join(' / ')}</span>
        </div>
        <h3>{event.name}</h3>
        <div className="event-location">
          <MapPin size={14} />
          {event.city}, {event.state}
        </div>
        {open && (
          <div className="capacity-row">
            <div className="capacity-bar">
              <div
                className={`capacity-fill${almostFull ? ' warning' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="capacity-label">
              <span>{used} inscritos</span>
              <span className={almostFull ? 'capacity-urgent' : ''}>
                {event.capacity - used} vagas
              </span>
            </div>
          </div>
        )}
        {upcoming && daysUntilReg !== null && (
          <div className="countdown-notice">
            <CalendarDays size={12} />
            {daysUntilReg > 0 ? `Inscrições em ${daysUntilReg} dias` : 'Inscrições em breve'}
          </div>
        )}
        <div className="event-card-bottom">
          <div>
            <small>A partir de</small>
            <strong>{money(Math.min(...event.distances.map((d) => d.price)))}</strong>
          </div>
          <span className="card-cta">
            {open ? 'Quero participar' : 'Ver evento'}
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Catalog() {
  const { db, ready } = useApp();
  const query = useSyncExternalStore(subscribeSearch, getSearch, () => '');
  const setQuery = setSearch;
  const [sport, setSport] = useState(''),
    [state, setState] = useState(''),
    [status, setStatus] = useState(''),
    [sort, setSort] = useState('date'),
    [view, setView] = useState('grid'),
    [mobileFilters, setMobileFilters] = useState(false);
  const events = db.events.filter((e) => e.status !== 'Rascunho');
  const count = (id: string) =>
    db.registrations.filter((r) => r.eventId === id && r.status !== 'Cancelada').length;
  const result = events
    .filter(
      (e) =>
        (!sport || e.sport === sport) &&
        (!state || e.state === state) &&
        (!status || e.status === status) &&
        clean(
          `${e.name} ${e.city} ${e.sport} ${e.distances.map((d) => d.name).join(' ')}`,
        ).includes(clean(query)),
    )
    .sort((a, b) =>
      sort === 'popular'
        ? count(b.id) - count(a.id)
        : sort === 'recent'
          ? b.createdAt.localeCompare(a.createdAt)
          : Number(a.status === 'Encerrado') - Number(b.status === 'Encerrado') ||
            a.date.localeCompare(b.date),
    );
  const activeFilters = !!(sport || state || status || query);
  const clear = () => {
    setQuery('');
    setSport('');
    setState('');
    setStatus('');
  };

  const featured =
    db.events.find((e) => e.featured) ||
    db.events
      .filter((e) => e.status === 'Inscrições abertas')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  const daysLeft = featured ? daysUntil(featured.date) : 0;

  const confirmed = db.registrations.filter((r) => r.status === 'Confirmada');
  const testimonials = db.testimonials
    .filter((t) => t.visible)
    .map((t) => {
      const event = db.events.find((e) => e.id === t.eventId);
      const reg = db.registrations.find((r) => r.id === t.registrationId);
      const parts = t.name.trim().split(/\s+/);
      return {
        ...t,
        author: parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0],
        initials: (
          parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
        ).toUpperCase(),
        race: [event?.name, reg?.distance].filter(Boolean).join(' · '),
      };
    });
  // A faixa anda até a metade e recomeça; as duas metades precisam ser iguais e
  // largas o bastante para cobrir a tela, então repetimos a lista até ter 6 cards.
  const half = testimonials.length
    ? Array.from({ length: Math.ceil(6 / testimonials.length) }, () => testimonials).flat()
    : [];
  const totalNet = confirmed.reduce((s, r) => s + r.amount - r.fee, 0);
  const totalUsed = events.reduce((s, e) => s + count(e.id), 0);
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);
  const recentRegs = confirmed.slice(-3).reverse();

  const renderFilters = (prefix: string) => (
    <>
      <div className="filters-title">
        <SlidersHorizontal size={17} />
        <strong>Refine sua busca</strong>
        {activeFilters && <button onClick={clear}>Limpar</button>}
      </div>
      <div className="filter-section">
        <h3>Modalidade</h3>
        {['', ...sports].map((s) => (
          <button
            key={s}
            className={`filter-option ${sport === s ? 'selected' : ''}`}
            onClick={() => setSport(s)}
          >
            <span>
              {s ? <SportIcon sport={s} size={17} /> : <LayoutGrid size={16} />}{' '}
              {s || 'Todas as modalidades'}
            </span>
            <small>{events.filter((e) => !s || e.sport === s).length}</small>
          </button>
        ))}
      </div>
      <div className="filter-section">
        <h3>Localização</h3>
        <label className="select-wrap">
          <MapPin size={16} />
          <select aria-label="Estado" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Todo o Brasil</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="filter-section">
        <h3>Inscrições</h3>
        {['', 'Inscrições abertas', 'Em breve', 'Encerrado'].map((s) => (
          <label className="radio-row" key={s}>
            <input
              type="radio"
              name={`${prefix}-status`}
              checked={status === s}
              onChange={() => setStatus(s)}
            />
            {s || 'Todos os eventos'}
          </label>
        ))}
      </div>
      <div className="filter-note">
        <ShieldCheck size={21} />
        <div>
          <strong>Inscrição em três etapas.</strong>
          <p>Dados, pagamento e comprovante, tudo pelo site.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-photo">
            <img
              src={asset('/images/running.jpg')}
              alt="Atletas correndo juntos em uma prova de rua"
              fetchPriority="high"
            />
          </div>
          <div className="hero-shade" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <span />O SEU PRÓXIMO PONTO DE PARTIDA
              </span>
              <h1>
                Todo grande passo
                <br />
                começa <em>aqui.</em>
              </h1>
              <p>
                Corridas, trilhas, ciclismo e triathlon.
                <br />
                Escolha a prova e faça a inscrição online.
              </p>
              <a href="#eventos" className="button button-lime">
                Encontre seu desafio
                <ArrowUpRight size={18} />
              </a>
              <div className="hero-community">
                <span className="community-lines">
                  5K<span>/</span>10K<span>/</span>21K<span>/</span>+
                </span>
                <span>
                  Do primeiro 5K
                  <br />
                  <strong>à meia maratona.</strong>
                </span>
              </div>
            </div>
            {featured && (
              <Link href={`/evento/?id=${featured.id}`} className="hero-feature">
                <span className="hero-feature-label">
                  PRÓXIMA LARGADA EM DESTAQUE
                  <ArrowUpRight size={17} />
                </span>
                <strong>{featured.name}</strong>
                <span>
                  <CalendarDays size={14} />
                  {daysLeft > 0 ? (
                    <>
                      Faltam <b>{daysLeft}</b> dias
                    </>
                  ) : (
                    dateLabel(featured.date, { day: '2-digit', month: 'short', year: 'numeric' })
                  )}
                  <span className="dot-separator">·</span>
                  <MapPin size={14} />
                  {featured.city}, {featured.state}
                </span>
              </Link>
            )}
            <span className="hero-vertical" aria-hidden="true">
              CORRIDA · TRILHA · MTB · CICLISMO · TRIATHLON
            </span>
          </div>
        </section>
        <div className="trust-strip">
          <div className="container">
            <span>
              <strong>{events.length.toString().padStart(2, '0')}</strong> eventos para descobrir
            </span>
            <span>
              <strong>05</strong> modalidades
            </span>
            <span>
              <ShieldCheck size={19} />
              <strong>Comprovante com QR Code</strong> para retirar o kit
            </span>
            <span>
              <strong>{confirmed.length}+</strong> atletas confirmados
            </span>
          </div>
        </div>
        <section className="container catalog-section" id="eventos">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow">CALENDÁRIO DE EVENTOS</span>
              <h2>Qual é o seu próximo desafio?</h2>
              <p>Filtre por modalidade, estado ou situação das inscrições.</p>
            </div>
            <div className="catalog-search">
              <Search size={19} />
              <input
                aria-label="Buscar eventos"
                placeholder="Busque evento, cidade ou modalidade"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Limpar busca" onClick={() => setQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="catalog-layout">
            <aside className="catalog-filters">{renderFilters('desktop')}</aside>
            <div className="catalog-results">
              <div className="results-toolbar">
                <span>
                  <strong>{result.length}</strong> eventos encontrados
                </span>
                <div className="results-controls">
                  <button
                    className="button button-outline filter-toggle"
                    onClick={() => setMobileFilters(true)}
                  >
                    <SlidersHorizontal size={16} />
                    Filtros{activeFilters && <i />}
                  </button>
                  <label className="sort-control">
                    <span>Ordenar:</span>
                    <select
                      aria-label="Ordenar eventos"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="date">Data do evento</option>
                      <option value="recent">Mais recentes</option>
                      <option value="popular">Mais inscritos</option>
                    </select>
                  </label>
                  <div className="view-control">
                    <button
                      onClick={() => setView('grid')}
                      className={view === 'grid' ? 'active' : ''}
                      aria-label="Visualização em grade"
                      aria-pressed={view === 'grid'}
                    >
                      <LayoutGrid size={17} />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={view === 'list' ? 'active' : ''}
                      aria-label="Visualização em lista"
                      aria-pressed={view === 'list'}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {activeFilters && (
                <div className="active-filters">
                  {query && (
                    <button className="filter-chip" onClick={() => setQuery('')}>
                      &ldquo;{query}&rdquo; <X size={11} />
                    </button>
                  )}
                  {sport && (
                    <button className="filter-chip" onClick={() => setSport('')}>
                      {sport} <X size={11} />
                    </button>
                  )}
                  {state && (
                    <button className="filter-chip" onClick={() => setState('')}>
                      {state} <X size={11} />
                    </button>
                  )}
                  {status && (
                    <button className="filter-chip" onClick={() => setStatus('')}>
                      {status} <X size={11} />
                    </button>
                  )}
                  <button className="filter-chip-clear" onClick={clear}>
                    Limpar tudo <X size={11} />
                  </button>
                </div>
              )}
              {!ready ? (
                <div className="events-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="event-card">
                      <div className="skeleton-block" style={{ height: 163 }} />
                      <div className="event-body">
                        <div className="skeleton-line" style={{ width: '55%', marginBottom: 14 }} />
                        <div className="skeleton-line" style={{ width: '85%', marginBottom: 10 }} />
                        <div className="skeleton-line" style={{ width: '45%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`events-grid ${view === 'list' ? 'list-view' : ''}`}>
                  {result.map((e) => (
                    <EventCard key={e.id} event={e} used={count(e.id)} />
                  ))}
                  {!result.length && (
                    <EmptyState
                      action={
                        <button className="button button-primary" onClick={clear}>
                          Limpar filtros
                        </button>
                      }
                    />
                  )}
                </div>
              )}
              <div className="catalog-end">
                <span />
                Seu próximo ponto de partida está aqui.
                <span />
              </div>
            </div>
          </div>
        </section>
        {testimonials.length > 0 && (
          <section className="testimonials-section">
            <div className="container">
              <div className="testimonials-heading">
                <span className="eyebrow">DEPOIMENTOS</span>
                <h2>O que dizem os atletas.</h2>
                <p>
                  Você poderá ligar/desligar quando quiser. Apenas atletas que já correram poderão
                  dar depoimentos.
                </p>
              </div>
            </div>
            <div className="testimonials-marquee">
              <div
                className="testimonials-track"
                style={{ animationDuration: `${half.length * 7}s` }}
              >
                {[...half, ...half].map((t, i) => (
                  <figure
                    key={`${t.id}-${i}`}
                    className="testimonial-card"
                    aria-hidden={i >= testimonials.length || undefined}
                  >
                    <blockquote>&ldquo;{t.text}&rdquo;</blockquote>
                    <figcaption className="testimonial-author">
                      <span className="testimonial-avatar">{t.initials}</span>
                      <div>
                        <strong>{t.author}</strong>
                        <span>{t.race}</span>
                      </div>
                      <span className="testimonial-stars" aria-hidden="true">
                        ★★★★★
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="how-section" id="como-funciona">
          <div className="container how-layout">
            <div>
              <span className="eyebrow">COMO FUNCIONA</span>
              <h2>
                Da vontade
                <br />à linha de largada.
              </h2>
              <p>A inscrição leva poucos minutos.</p>
              <Link href="/entrar/?perfil=atleta" className="button button-primary how-cta">
                Conhecer a área do atleta
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="how-steps">
              {(
                [
                  [
                    '01',
                    'Encontre a sua prova',
                    'Busque por modalidade, distância ou cidade.',
                    Compass,
                  ],
                  [
                    '02',
                    'Faça a inscrição',
                    'Escolha distância e kit e pague com PIX, cartão ou boleto.',
                    Ticket,
                  ],
                  [
                    '03',
                    'Retire seu kit',
                    'Apresente o QR Code do comprovante no credenciamento.',
                    Flag,
                  ],
                ] as const
              ).map(([n, t, d, Icon]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                  <Icon size={20} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="container org-callout">
          <div>
            <span className="eyebrow">PARA ORGANIZADORES</span>
            <h2>
              Organize seu evento
              <br />
              pela plataforma.
            </h2>
            <p>Inscritos, entrega de kits, cupons e financeiro no mesmo painel.</p>
            <Link href="/entrar/?perfil=organizador" className="button button-primary">
              Conhecer a área do organizador
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="org-callout-art">
            <div className="org-mini-dash">
              <div className="org-dash-stats">
                <div className="org-stat">
                  <Users size={14} />
                  <strong>{confirmed.length}</strong>
                  <span>Atletas inscritos</span>
                </div>
                <div className="org-stat">
                  <TrendingUp size={14} />
                  <strong title={money(totalNet)}>{moneyCompact(totalNet)}</strong>
                  <span>Arrecadado</span>
                </div>
                <div className="org-stat">
                  <CheckCircle2 size={14} />
                  <strong>{totalCapacity - totalUsed}</strong>
                  <span>Vagas disponíveis</span>
                </div>
              </div>
              <div className="org-dash-recent">
                <span className="org-dash-label">ÚLTIMAS INSCRIÇÕES</span>
                {recentRegs.map((r) => (
                  <div key={r.id} className="org-recent-row">
                    <span className="org-recent-avatar">
                      {r.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="org-recent-info">
                      <strong>{r.name.split(' ').slice(0, 2).join(' ')}</strong>
                      <span>{r.distance}</span>
                    </div>
                    <span className="badge green" style={{ fontSize: 9, padding: '2px 6px' }}>
                      <span className="status-dot" />
                      Confirmada
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {mobileFilters && (
        <Modal
          title="Filtros de eventos"
          className="filter-drawer-modal"
          onClose={() => setMobileFilters(false)}
        >
          {renderFilters('mobile')}
          <button
            className="button button-primary full-width"
            onClick={() => setMobileFilters(false)}
          >
            Ver {result.length} eventos
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </>
  );
}
