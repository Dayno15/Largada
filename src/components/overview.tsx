'use client';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Plus,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from './provider';
import { Badge, Panel, Stat } from './ui';
import type { RaceEvent } from '@/lib/types';
import { dateLabel, financials, money } from '@/lib/utils';

export function Overview({
  events,
  navigate,
  onCreate,
}: {
  events: RaceEvent[];
  navigate: (v: string) => void;
  onCreate: () => void;
}) {
  const { db, session } = useApp();
  const isAdmin = session?.role === 'admin';
  const ids = events.map((e) => e.id),
    rows = db.registrations.filter((r) => ids.includes(r.eventId));
  const f = financials(rows);
  const next = [...events]
    .filter((e) => e.status === 'Inscrições abertas' || e.status === 'Em breve')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6 + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      key,
      count: rows.filter((r) => r.createdAt.startsWith(key) && r.status !== 'Cancelada').length,
    };
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  const confirmed = rows.filter((r) => r.status === 'Confirmada').length,
    pending = rows.filter((r) => r.status === 'Pendente').length,
    cancelled = rows.filter((r) => r.status === 'Cancelada').length;
  const recent = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="section-stack">
      <div className="overview-welcome">
        <div>
          <span className="eyebrow">
            {isAdmin ? 'CONTROLE PARA IR MAIS LONGE' : 'CUIDE DOS BASTIDORES. INSPIRE CONQUISTAS.'}
          </span>
          <h2>{isAdmin ? 'A operação em um só lugar.' : 'Seu evento, no ritmo certo.'}</h2>
          <p>
            {isAdmin
              ? 'Acompanhe eventos, pagamentos e organizadores com uma visão clara de toda a plataforma.'
              : `Olá, ${session?.name.split(' ')[0]}. Aqui está o que está acontecendo com os seus eventos.`}
          </p>
          <button className="text-link" onClick={() => navigate('inscricoes')}>
            Acompanhar inscrições
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="overview-welcome-art">
          <span>
            {isAdmin ? 'VISÃO AMPLA.' : 'CADA DETALHE.'}
            <br />
            <strong>{isAdmin ? 'GESTÃO PRÓXIMA.' : 'GRANDES CHEGADAS.'}</strong>
          </span>
          <ArrowUpRight size={66} strokeWidth={1} />
        </div>
      </div>
      <div className="stat-grid overview-stats">
        <Stat
          label={isAdmin ? 'Eventos na plataforma' : 'Meus eventos'}
          value={events.length.toString().padStart(2, '0')}
          detail={`${events.filter((e) => e.status === 'Inscrições abertas').length} com inscrições abertas`}
          icon={CalendarDays}
        />
        <Stat
          label="Inscrições recebidas"
          value={rows.length}
          detail={`${confirmed} confirmadas · ${pending} pendentes`}
          icon={Users}
        />
        <Stat
          label="Receita confirmada"
          value={money(f.gross)}
          detail="Pagamentos aprovados na demonstração"
          icon={CircleDollarSign}
        />
        <Stat
          label={isAdmin ? 'Receita da plataforma' : 'Receita líquida'}
          value={money(isAdmin ? f.fees : f.net)}
          detail={isAdmin ? 'Taxas de serviço confirmadas' : 'Valor bruto menos taxas de serviço'}
          icon={Wallet}
        />
      </div>
      <div className="overview-charts">
        <Panel
          title="O movimento da semana"
          description="Novas inscrições nos últimos 7 dias."
          action={<span className="chart-period">Últimos 7 dias</span>}
        >
          <div className="bar-chart">
            <div className="chart-y-axis">
              {[max, Math.round(max / 2), 0].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
            <div className="chart-bars">
              {days.map((d) => (
                <div className="chart-column" key={d.key}>
                  <div className="chart-bar-area">
                    <div
                      className={`chart-bar ${d.key === days[6].key ? 'highlight' : ''}`}
                      style={{ height: `${Math.max(d.count ? 5 : 0, (d.count / max) * 100)}%` }}
                      title={`${d.label}: ${d.count} inscrições`}
                    >
                      <span>{d.count}</span>
                    </div>
                  </div>
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel title="Inscrições por status" description="Um retrato do seu público.">
          <div className="donut-layout">
            <div
              className="status-donut"
              style={{
                background: `conic-gradient(var(--brand) 0 ${rows.length ? (confirmed / rows.length) * 100 : 0}%,var(--lime) 0 ${rows.length ? ((confirmed + pending) / rows.length) * 100 : 0}%,var(--border) 0)`,
              }}
            >
              <div>
                <strong>{rows.length}</strong>
                <span>inscrições</span>
              </div>
            </div>
            <div className="donut-legend">
              {[
                ['Confirmadas', confirmed, 'brand'],
                ['Pendentes', pending, 'lime'],
                ['Canceladas', cancelled, 'border'],
              ].map(([label, n, color]) => (
                <div key={label}>
                  <span style={{ background: `var(--${color})` }} />
                  <span>{label}</span>
                  <strong>{n}</strong>
                </div>
              ))}
            </div>
          </div>
          <button className="text-link" onClick={() => navigate('financeiro')}>
            Ver visão financeira
            <ArrowRight size={14} />
          </button>
        </Panel>
      </div>
      <div className="overview-bottom">
        <Panel
          title="Próximas largadas"
          description="O que vem pela frente."
          action={
            <button className="text-link" onClick={() => navigate('eventos')}>
              Ver todos
              <ArrowRight size={14} />
            </button>
          }
        >
          {next.map((e) => (
            <div className="next-event-row" key={e.id}>
              <div className="mini-date">
                <strong>{new Date(e.date + 'T12:00:00').getDate()}</strong>
                <span>{dateLabel(e.date, { month: 'short' }).replace('.', '')}</span>
              </div>
              <div>
                <h3>{e.name}</h3>
                <p>
                  <MapPin size={12} />
                  {e.city}, {e.state} <span>·</span> {e.time}h
                </p>
              </div>
              <button
                className="icon-button"
                aria-label={`Gerenciar ${e.name}`}
                onClick={() => navigate('eventos')}
              >
                <ArrowUpRight size={18} />
              </button>
            </div>
          ))}
          {!next.length && (
            <p className="section-description">Nenhum evento agendado. Que tal criar o próximo?</p>
          )}
          <button className="new-event-inline" onClick={onCreate}>
            <Plus size={16} />
            Criar um novo ponto de partida
          </button>
        </Panel>
        <Panel
          title="Últimas inscrições"
          description="Quem já está pronto para a largada."
          action={
            <button className="text-link" onClick={() => navigate('inscricoes')}>
              Ver todas
              <ArrowRight size={14} />
            </button>
          }
        >
          <div className="recent-registrations">
            {recent.map((r) => (
              <div key={r.id}>
                <span className="avatar">
                  {r.name
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {events.find((e) => e.id === r.eventId)?.name} · {r.distance}
                  </small>
                </div>
                <Badge>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {isAdmin && db.organizers.some((o) => o.status === 'Pendente') && (
        <div className="pending-org-notice">
          <span>
            <Users size={22} />
            <span>
              <strong>Novos organizadores querem fazer parte.</strong>
              <small>
                {db.organizers.filter((o) => o.status === 'Pendente').length} cadastro aguardando
                sua análise.
              </small>
            </span>
          </span>
          <button
            className="button button-outline button-small"
            onClick={() => navigate('organizadores')}
          >
            Analisar cadastro
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
