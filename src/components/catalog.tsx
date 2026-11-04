'use client';
import Link from 'next/link';
import { useState } from 'react';
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
  ChevronDown,
  MoveUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Header, Footer } from './navigation';
import { useApp } from './provider';
import { Badge, EmptyState, SportIcon, Modal } from './ui';
import { sports } from '@/lib/data';
import { asset, clean, dateLabel, money, states } from '@/lib/utils';
import type { RaceEvent } from '@/lib/types';

export function EventCard({ event }: { event: RaceEvent }) {
  const open = event.status === 'Inscrições abertas';
  return (
    <Link href={`/evento/?id=${event.id}`} className="event-card">
      <div className="event-image">
        <img src={asset(event.image)} alt={`${event.sport} em ${event.city}`} loading="lazy" />
        <div className="event-image-top">
          <span className="image-sport">
            <SportIcon sport={event.sport} size={14} />
            {event.sport}
          </span>
          <span className="image-arrow">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="event-date-tile">
          <strong>{new Date(event.date + 'T12:00:00').getDate()}</strong>
          <span>{dateLabel(event.date, { month: 'short' }).replace('.', '')}</span>
        </div>
      </div>
      <div className="event-body">
        <div className="event-card-status">
          <Badge>{event.status}</Badge>
          <span>{event.distances.map((d) => d.name).join(' / ')}</span>
        </div>
        <h3>{event.name}</h3>
        <div className="event-location">
          <MapPin size={14} />
          {event.city}, {event.state}
        </div>
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
  const { db } = useApp();
  const [query, setQuery] = useState(''),
    [sport, setSport] = useState(''),
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
        clean(`${e.name} ${e.city} ${e.sport}`).includes(clean(query)),
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
          <strong>Seu próximo desafio, sem complicação.</strong>
          <p>Escolha a prova. A gente cuida do caminho até a largada.</p>
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
                Uma nova distância. Um novo lugar.
                <br />
                Encontre o evento que vai mover você.
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
                  Para todos os ritmos.
                  <br />
                  <strong>Inclusive o seu.</strong>
                </span>
              </div>
            </div>
            <Link href="/evento/?id=meia-do-cerrado" className="hero-feature">
              <span className="hero-feature-label">
                PRÓXIMA LARGADA EM DESTAQUE
                <ArrowUpRight size={17} />
              </span>
              <strong>Meia do Cerrado</strong>
              <span>
                <CalendarDays size={14} />
                06 dez 2026<span className="dot-separator">·</span>
                <MapPin size={14} />
                Unaí, MG
              </span>
            </Link>
            <span className="hero-vertical">NÃO É SÓ SOBRE CORRER. É SOBRE IR.</span>
          </div>
        </section>
        <div className="trust-strip">
          <div className="container">
            <span>
              <strong>{events.length.toString().padStart(2, '0')}</strong> eventos para descobrir
            </span>
            <span>
              <strong>05</strong> modalidades, muitos caminhos
            </span>
            <span>
              <ShieldCheck size={19} />
              <strong>Inscrição simples.</strong> Do início à largada.
            </span>
            <span className="demo-inline">
              <i />
              Demo interativa
            </span>
          </div>
        </div>
        <section className="container catalog-section" id="eventos">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow">CALENDÁRIO DE EXPERIÊNCIAS</span>
              <h2>Qual é o seu próximo desafio?</h2>
              <p>Do primeiro quilômetro à próxima conquista.</p>
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
                    <ChevronDown size={14} />
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
                  {[query, sport, state, status].filter(Boolean).map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                  <button onClick={clear}>
                    Limpar filtros
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className={`events-grid ${view === 'list' ? 'list-view' : ''}`}>
                {result.map((e) => (
                  <EventCard key={e.id} event={e} />
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
              <div className="catalog-end">
                <span />
                Seu próximo ponto de partida está aqui.
                <span />
              </div>
            </div>
          </div>
        </section>
        <section className="how-section">
          <div className="container how-layout">
            <div>
              <span className="eyebrow">MENOS BUROCRACIA. MAIS MOVIMENTO.</span>
              <h2>
                Da vontade
                <br />à linha de largada.
              </h2>
              <p>O próximo passo é mais simples do que parece.</p>
            </div>
            <div className="how-steps">
              {[
                ['01', 'Encontre a sua prova', 'Explore modalidades, distâncias e novos lugares.'],
                [
                  '02',
                  'Garanta seu lugar',
                  'Escolha seu kit e faça sua inscrição em poucos passos.',
                ],
                ['03', 'Prepare-se para viver', 'Acompanhe tudo na sua área. Agora é com você.'],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                  <ArrowUpRight size={20} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="container org-callout">
          <div>
            <span className="eyebrow">PARA QUEM FAZ ACONTECER</span>
            <h2>
              Sua próxima grande corrida
              <br />
              começa nos bastidores.
            </h2>
            <p>Inscrições, atletas e financeiro em um só lugar.</p>
            <Link href="/entrar/?perfil=organizador" className="button button-primary">
              Conhecer a área do organizador
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="org-callout-art">
            <span>
              DA IDEIA
              <br />À <em>LARGADA.</em>
            </span>
            <MoveUpRight size={100} strokeWidth={1} />
            <small>Você organiza. A gente conecta.</small>
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
