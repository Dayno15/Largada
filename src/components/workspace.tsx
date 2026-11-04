'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Tag,
  UserRound,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Brand, ThemeToggle, AccentPicker } from './navigation';
import { DemoNotice, useApp } from './provider';
import { Field, Modal, PageHeading, Panel } from './ui';
import { Overview } from './overview';
import { Registrations } from './registrations';
import { EventsManagement, Coupons, Organizers, ActivityLog, Settings } from './management';
import { Finance } from './finance';
import { EventEditor } from './event-editor';
import type { Role } from '@/lib/types';

type NavItem = { id: string; label: string; icon: LucideIcon; section?: string };
const organizerNav: NavItem[] = [
  { id: 'visao-geral', label: 'Visão geral', icon: LayoutDashboard, section: 'SEU ESPAÇO' },
  { id: 'eventos', label: 'Meus eventos', icon: CalendarDays },
  { id: 'inscricoes', label: 'Inscrições', icon: Users },
  { id: 'kits', label: 'Entrega de kits', icon: PackageCheck },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet, section: 'GESTÃO DO EVENTO' },
  { id: 'repasses', label: 'Meus recebimentos', icon: CircleDollarSign },
  { id: 'cupons', label: 'Cupons', icon: Tag },
  { id: 'perfil', label: 'Meu perfil', icon: UserRound, section: 'PREFERÊNCIAS' },
];
const adminNav: NavItem[] = [
  { id: 'visao-geral', label: 'Visão geral', icon: LayoutDashboard, section: 'PLATAFORMA' },
  { id: 'eventos', label: 'Todos os eventos', icon: CalendarDays },
  { id: 'inscricoes', label: 'Inscrições', icon: Users },
  { id: 'organizadores', label: 'Organizadores', icon: Building2 },
  { id: 'financeiro', label: 'Visão financeira', icon: Wallet, section: 'FINANCEIRO' },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'repasses', label: 'Repasses', icon: CircleDollarSign },
  { id: 'historico', label: 'Atividades', icon: FileClock, section: 'ADMINISTRAÇÃO' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings2 },
];
const titles: Record<string, [string, string]> = {
  'visao-geral': ['Visão geral', 'Seu ponto de partida para uma gestão mais simples.'],
  eventos: ['Gestão de eventos', 'Organize cada detalhe. Inspire o próximo passo.'],
  inscricoes: ['Inscrições', 'Cada nome, uma nova história na linha de largada.'],
  kits: ['Entrega de kits', 'Uma recepção organizada faz toda a diferença.'],
  financeiro: ['Financeiro', 'Receitas, taxas e saldos, sem perder o ritmo.'],
  repasses: ['Recebimentos e repasses', 'Acompanhe o caminho de cada valor.'],
  cupons: ['Cupons de desconto', 'Um incentivo para mais gente se colocar em movimento.'],
  perfil: ['Meu perfil', 'Os detalhes de quem faz acontecer.'],
  organizadores: ['Organizadores', 'A comunidade por trás de cada evento.'],
  pagamentos: ['Pagamentos', 'Acompanhe cada transação da plataforma.'],
  historico: ['Atividades', 'Um histórico claro do que aconteceu por aqui.'],
  configuracoes: ['Configurações', 'Ajuste a experiência para o seu jeito.'],
};

export default function Workspace({ role }: { role: Exclude<Role, 'atleta'> }) {
  const { db, ready, session, logout } = useApp();
  const router = useRouter(),
    params = useSearchParams();
  const nav = role === 'admin' ? adminNav : organizerNav;
  const query = params.get('aba') || 'visao-geral';
  const view = nav.some((n) => n.id === query) ? query : 'visao-geral';
  const [open, setOpen] = useState(false),
    [create, setCreate] = useState(false),
    [notifications, setNotifications] = useState(false);
  useEffect(() => {
    if (ready && (!session || session.role !== role)) router.replace(`/entrar/?perfil=${role}`);
  }, [ready, session, role, router]);
  const navigate = (v: string) => {
    router.push(`/${role}/?aba=${v}`, { scroll: false });
    setOpen(false);
  };
  if (!ready || !session || session.role !== role)
    return (
      <div className="loading-state">
        <span className="spinner" />
        Preparando seu espaço...
      </div>
    );
  const events =
    role === 'admin' ? db.events : db.events.filter((e) => e.organizerId === session.organizerId);
  const [title, description] = titles[view];
  const pendingOrgs = db.organizers.filter((o) => o.status === 'Pendente').length;
  return (
    <div className="workspace">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu lateral"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`workspace-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button sidebar-close"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-role-icon">
            {role === 'admin' ? <ShieldCheck size={17} /> : <Building2 size={17} />}
          </span>
          <div>
            <strong>
              {role === 'admin'
                ? 'Administração'
                : db.organizers.find((o) => o.id === session.organizerId)?.name}
            </strong>
            <span>{role === 'admin' ? 'Gestão da plataforma' : 'Painel do organizador'}</span>
          </div>
        </div>
        <nav className="workspace-nav" aria-label={`Menu ${role}`}>
          {nav.map((n) => (
            <div key={n.id}>
              {n.section && <span className="nav-section-title">{n.section}</span>}
              <button className={view === n.id ? 'active' : ''} onClick={() => navigate(n.id)}>
                <n.icon size={18} />
                <span>{n.label}</span>
                {n.id === 'organizadores' && pendingOrgs > 0 && (
                  <small className="nav-count">{pendingOrgs}</small>
                )}
                {n.id === 'eventos' && <small>{events.length}</small>}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" className="sidebar-portal">
            <ExternalLink size={16} />
            Ver portal de eventos
            <ArrowUpRight size={14} />
          </Link>
          <div className="sidebar-demo">
            <span className="sidebar-demo-dot" />
            <div>
              <strong>Modo demonstração</strong>
              <p>Tudo simulado. Nenhuma cobrança.</p>
            </div>
          </div>
          <div className="sidebar-profile">
            <span className="avatar">
              {session.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <strong>{session.name}</strong>
              <span>{role === 'admin' ? 'Administrador' : 'Organizador'}</span>
            </div>
            <button
              className="icon-button"
              aria-label="Sair do painel"
              title="Sair e trocar perfil"
              onClick={() => {
                logout();
                router.push(`/entrar/?perfil=${role}`);
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <button
              className="icon-button workspace-menu"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu do painel"
            >
              <Menu size={20} />
            </button>
            <span className="workspace-breadcrumb">
              {role === 'admin' ? 'Administração' : 'Meu espaço'}
              <ChevronRight size={13} />
              <strong>{title}</strong>
            </span>
          </div>
          <div>
            <DemoNotice compact />
            <ThemeToggle />
            <button
              className="icon-button notification-button"
              aria-label="Ver atividades recentes"
              onClick={() => setNotifications(true)}
            >
              <Bell size={19} />
              <span />
            </button>
            <span className="avatar topbar-avatar">
              {session.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        </header>
        <main className="workspace-content">
          <PageHeading
            eyebrow={role === 'admin' ? 'PAINEL ADMINISTRATIVO' : 'PAINEL DO ORGANIZADOR'}
            title={title}
            description={description}
            action={
              view === 'visao-geral' ? (
                <button className="button button-primary" onClick={() => setCreate(true)}>
                  <Plus size={16} />
                  Novo evento
                </button>
              ) : undefined
            }
          />
          {view === 'visao-geral' && (
            <Overview events={events} navigate={navigate} onCreate={() => setCreate(true)} />
          )}{' '}
          {view === 'eventos' && <EventsManagement events={events} />}{' '}
          {view === 'inscricoes' && <Registrations events={events} />}{' '}
          {view === 'kits' && <Registrations events={events} kits />}{' '}
          {view === 'pagamentos' && <Registrations events={events} payments />}{' '}
          {(view === 'financeiro' || view === 'repasses') && (
            <Finance key={view} events={events} transfersOnly={view === 'repasses'} />
          )}{' '}
          {view === 'cupons' && <Coupons events={events} />}{' '}
          {view === 'organizadores' && <Organizers />} {view === 'historico' && <ActivityLog />}{' '}
          {view === 'configuracoes' && <Settings />} {view === 'perfil' && <OrganizerProfile />}
          <footer className="workspace-footer">
            <span>CorridaAqui · Cada detalhe move uma conquista.</span>
            <span>Frontend demonstrativo · Dados locais e fictícios</span>
          </footer>
        </main>
      </div>
      {create && <EventEditor onClose={() => setCreate(false)} />}{' '}
      {notifications && (
        <Modal title="Atividades recentes" onClose={() => setNotifications(false)}>
          <div className="activity-list">
            {db.activities.slice(0, 8).map((a) => (
              <div key={a.id}>
                <span className="activity-icon">
                  <FileClock size={16} />
                </span>
                <div>
                  <strong>{a.text}</strong>
                  <p>
                    {a.actor} ·{' '}
                    {new Date(a.date).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {role === 'admin' && (
            <button
              className="text-link spaced"
              onClick={() => {
                setNotifications(false);
                navigate('historico');
              }}
            >
              Ver histórico completo
              <ArrowRight size={15} />
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
function OrganizerProfile() {
  const { db, session, update, toast, theme, toggleTheme } = useApp();
  const org = db.organizers.find((o) => o.id === session?.organizerId);
  const [draft, setDraft] = useState(org);
  if (!draft) return null;
  function save(e: FormEvent) {
    e.preventDefault();
    update(
      (d) => ({ ...d, organizers: d.organizers.map((o) => (o.id === draft!.id ? draft! : o)) }),
      'Perfil do organizador atualizado',
    );
    toast('Dados do organizador atualizados na demonstração.');
  }
  return (
    <div className="section-stack">
      <Panel
        title="Dados da organização"
        description="Essas informações identificam quem organiza os seus eventos."
      >
        <form onSubmit={save}>
          <div className="form-grid">
            <Field label="Nome da organização">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Responsável">
              <input
                value={draft.contact}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                required
              />
            </Field>
            <Field label="E-mail de contato">
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Cidade / estado">
              <input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              <Save size={15} />
              Salvar perfil
            </button>
          </div>
        </form>
      </Panel>
      <Panel
        title="Sua experiência"
        description="Preferências aplicadas a todas as áreas da plataforma."
      >
        <div className="settings-row">
          <div>
            <h3>Tema {theme === 'light' ? 'claro' : 'escuro'}</h3>
            <p>Mais conforto para organizar o próximo desafio.</p>
          </div>
          <button className="button button-outline button-small" onClick={toggleTheme}>
            Alternar tema
          </button>
        </div>
        <div className="settings-row">
          <AccentPicker />
        </div>
      </Panel>
      <div className="info-message">
        <ShieldCheck size={17} />O login demonstrativo continua sendo organizador@corridaqui.demo e
        a senha demo123. Não utilize dados ou senhas pessoais neste MVP.
      </div>
    </div>
  );
}
