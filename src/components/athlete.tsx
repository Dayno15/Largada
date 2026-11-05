'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  LogOut,
  MapPin,
  MessageSquareQuote,
  PackageCheck,
  Save,
  Settings2,
  ShieldCheck,
  Shirt,
  Ticket,
  UserRound,
  XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Header, Footer, AccentPicker } from './navigation';
import { DemoNotice, useApp } from './provider';
import { Badge, EmptyState, Field, Modal, PageHeading, Panel, Stat } from './ui';
import { asset, dateLabel, eventPassed, money, states, uid } from '@/lib/utils';
import { downloadReceipt } from '@/lib/export';
import type { Registration } from '@/lib/types';
import { features } from '@/lib/features';

export default function Athlete() {
  const { db, ready, session, logout, update, toast, theme, toggleTheme } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState('inscricoes'),
    [filter, setFilter] = useState(''),
    [detail, setDetail] = useState<Registration | null>(null),
    [cancel, setCancel] = useState<Registration | null>(null),
    [cardReg, setCardReg] = useState<Registration | null>(null),
    [review, setReview] = useState<Registration | null>(null),
    [reviewText, setReviewText] = useState(''),
    [reviewError, setReviewError] = useState('');
  useEffect(() => {
    if (ready && (!session || session.role !== 'atleta')) router.replace('/entrar/?perfil=atleta');
  }, [ready, session, router]);
  if (!ready || !session || session.role !== 'atleta')
    return (
      <div className="loading-state">
        <span className="spinner" />
        Preparando sua área...
      </div>
    );
  const registrations = db.registrations
    .filter((r) => r.cpf === session.cpf || r.email.toLowerCase() === session.email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = registrations.filter((r) => !filter || r.status === filter);
  const pay = (r: Registration) => {
    try {
      sessionStorage.setItem(`corridaqui-checkout-${r.eventId}`, r.id);
    } catch {}
    router.push(`/inscricao/?evento=${r.eventId}`);
  };
  return (
    <>
      <Header />
      <DemoNotice />
      <main className="container athlete-page">
        <PageHeading
          eyebrow="ÁREA DO ATLETA"
          title={`Olá, ${session.name.split(' ')[0]}.`}
          description="Suas inscrições e o que você precisa saber antes da largada."
          action={
            <button
              className="button button-outline button-small"
              onClick={() => {
                logout();
                router.push('/entrar/?perfil=atleta');
              }}
            >
              <LogOut size={14} />
              Sair da conta
            </button>
          }
        />
        <div className="athlete-layout">
          <aside className="athlete-sidebar">
            <div className="athlete-profile">
              <span className="avatar large">
                {session.name
                  .split(' ')
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join('')}
              </span>
              <strong>{session.name}</strong>
              <span>Atleta CorridaAqui</span>
            </div>
            <nav aria-label="Área do atleta">
              {[
                { id: 'inscricoes', label: 'Minhas inscrições', icon: Ticket },
                { id: 'dados', label: 'Meus dados', icon: UserRound },
                { id: 'preferencias', label: 'Preferências', icon: Settings2 },
              ].map((n) => (
                <button
                  key={n.id}
                  className={tab === n.id ? 'active' : ''}
                  onClick={() => setTab(n.id)}
                >
                  <n.icon size={17} />
                  {n.label}
                  {n.id === 'inscricoes' && <small>{registrations.length}</small>}
                </button>
              ))}
            </nav>
            <div className="athlete-sidebar-note">
              <ShieldCheck size={23} />
              <strong>A próxima conquista começa com um passo.</strong>
              <p>Explore novas provas e encontre seu próximo desafio.</p>
              <Link href="/" className="text-link">
                Explorar eventos
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>
          <section className="athlete-content">
            {tab === 'inscricoes' && (
              <>
                <div className="athlete-stat-grid">
                  <Stat
                    label="Inscrições confirmadas"
                    value={registrations.filter((r) => r.status === 'Confirmada').length}
                    icon={CheckCircle2}
                  />
                  <Stat
                    label="Aguardando pagamento"
                    value={registrations.filter((r) => r.status === 'Pendente').length}
                    icon={Clock3}
                  />
                  <Stat
                    label="Modalidades"
                    value="05"
                    detail="Disponíveis no calendário"
                    icon={MapPin}
                  />
                </div>
                <div className="athlete-list-heading">
                  <h2>Suas inscrições</h2>
                  <select
                    aria-label="Filtrar minhas inscrições"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    {['Confirmada', 'Pendente', 'Cancelada'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="athlete-tickets">
                  {visible.map((r) => {
                    const event = db.events.find((e) => e.id === r.eventId);
                    if (!event) return null;
                    return (
                      <article key={r.id} className="athlete-ticket">
                        <div className="athlete-ticket-photo">
                          <img
                            src={event.image.startsWith('data:') ? event.image : asset(event.image)}
                            alt={event.name}
                          />
                          <span>
                            <CalendarDays size={15} />
                            {dateLabel(event.date)}
                          </span>
                        </div>
                        <div className="athlete-ticket-body">
                          <div className="athlete-ticket-top">
                            <span className="receipt-meta">{r.id}</span>
                            <Badge>{r.status}</Badge>
                          </div>
                          <h3>{event.name}</h3>
                          <p>
                            <MapPin size={14} />
                            {event.city}, {event.state} · {event.time}h
                          </p>
                          <div className="ticket-attributes">
                            <span>
                              <Ticket size={14} />
                              {r.distance}
                            </span>
                            <span>
                              <Shirt size={14} />
                              {r.shirt}
                            </span>
                            <span>
                              <PackageCheck size={14} />
                              {r.kitDelivered ? 'Kit retirado' : 'Kit a retirar'}
                            </span>
                          </div>
                          <div className="ticket-footer">
                            <strong>
                              {money(r.amount)}
                              <small>
                                {r.status === 'Confirmada'
                                  ? `Pago via ${r.method}`
                                  : r.status === 'Pendente'
                                    ? 'Aguardando pagamento'
                                    : 'Inscrição cancelada'}
                              </small>
                            </strong>
                            <div>
                              <button
                                className="button button-outline button-small"
                                onClick={() => setDetail(r)}
                              >
                                Ver detalhes
                              </button>
                              {r.status === 'Confirmada' && (
                                <>
                                  <button
                                    className="icon-button"
                                    aria-label={`Ver carteirinha de ${event.name}`}
                                    onClick={() => setCardReg(r)}
                                  >
                                    <CreditCard size={17} />
                                  </button>
                                  <button
                                    className="icon-button"
                                    aria-label={`Baixar comprovante de ${event.name}`}
                                    onClick={() => downloadReceipt(r, event)}
                                  >
                                    <Download size={17} />
                                  </button>
                                </>
                              )}
                              {r.status === 'Pendente' && (
                                <button
                                  className="button button-primary button-small"
                                  onClick={() => pay(r)}
                                >
                                  Pagar
                                  <ArrowRight size={14} />
                                </button>
                              )}
                              {r.status === 'Confirmada' &&
                                eventPassed(event.date) &&
                                (() => {
                                  const sent = db.testimonials.find(
                                    (t) => t.registrationId === r.id,
                                  );
                                  return sent ? (
                                    <span className="review-sent">
                                      <CheckCircle2 size={14} />
                                      {sent.visible ? 'Depoimento publicado' : 'Depoimento enviado'}
                                    </span>
                                  ) : (
                                    <button
                                      className="button button-primary button-small"
                                      onClick={() => {
                                        setReview(r);
                                        setReviewText('');
                                        setReviewError('');
                                      }}
                                    >
                                      <MessageSquareQuote size={14} />
                                      Deixar depoimento
                                    </button>
                                  );
                                })()}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {!visible.length && (
                    <EmptyState
                      title={
                        registrations.length
                          ? 'Nenhuma inscrição com esse status'
                          : 'Você ainda não tem inscrições'
                      }
                      text="Escolha um evento no calendário para se inscrever."
                      action={
                        <Link href="/" className="button button-primary">
                          Explorar eventos
                          <ArrowRight size={15} />
                        </Link>
                      }
                    />
                  )}
                </div>
              </>
            )}
            {tab === 'dados' && <AthleteProfile />}
            {tab === 'preferencias' && (
              <div className="section-stack">
                <Panel title="Aparência" description="As preferências são salvas neste navegador.">
                  <div className="settings-row">
                    <div>
                      <h3>Tema da plataforma</h3>
                      <p>Você está no modo {theme === 'light' ? 'claro' : 'escuro'}.</p>
                    </div>
                    <button className="button button-outline button-small" onClick={toggleTheme}>
                      Alternar tema
                    </button>
                  </div>
                  {features.personalAccent && (
                    <div className="settings-row">
                      <AccentPicker />
                    </div>
                  )}
                </Panel>
                <Panel title="Sobre esta demonstração">
                  <p className="section-description">
                    O CorridaAqui é um protótipo frontend. Inscrições, pagamentos e dados de atletas
                    são simulados. Nenhum e-mail, cobrança ou informação de cartão é enviado. Os
                    dados ficam no armazenamento deste navegador e podem ser restaurados pela
                    administração.
                  </p>
                  <div className="info-message">
                    <ShieldCheck size={17} />
                    Use apenas dados fictícios. Este MVP não possui autenticação real nem proteção
                    de dados de produção.
                  </div>
                </Panel>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      {detail &&
        (() => {
          const r = db.registrations.find((x) => x.id === detail.id) || detail;
          const event = db.events.find((e) => e.id === r.eventId)!;
          return (
            <Modal title="Detalhes da sua inscrição" onClose={() => setDetail(null)}>
              <Badge>{r.status}</Badge>
              <h2 className="athlete-modal-title">{event.name}</h2>
              <p className="section-description">
                {dateLabel(event.date)} · {event.time}h · {event.venue}
              </p>
              <dl className="info-grid">
                <div>
                  <dt>Inscrição</dt>
                  <dd>{r.id}</dd>
                </div>
                <div>
                  <dt>Número de peito</dt>
                  <dd>#{r.bib}</dd>
                </div>
                <div>
                  <dt>Atleta</dt>
                  <dd>{r.name}</dd>
                </div>
                <div>
                  <dt>Distância</dt>
                  <dd>{r.distance}</dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>{r.category}</dd>
                </div>
                <div>
                  <dt>Kit / camiseta</dt>
                  <dd>
                    {r.kit} · {r.shirt}
                  </dd>
                </div>
                <div>
                  <dt>Pagamento</dt>
                  <dd>
                    {money(r.amount)} · {r.method}
                  </dd>
                </div>
                <div>
                  <dt>Cupom</dt>
                  <dd>{r.coupon || 'Não utilizado'}</dd>
                </div>
              </dl>
              <hr className="divider" />
              <h3 className="notice-title">Retirada do kit</h3>
              <p className="section-description">{event.kitPickup}</p>
              <div className="button-row">
                {r.status === 'Pendente' && (
                  <button className="button button-primary" onClick={() => pay(r)}>
                    Concluir pagamento
                    <ArrowRight size={15} />
                  </button>
                )}
                <button className="button button-outline" onClick={() => downloadReceipt(r, event)}>
                  <Download size={15} />
                  Baixar comprovante
                </button>
              </div>
              {r.status !== 'Cancelada' && !r.kitDelivered && (
                <button
                  className="text-link text-danger spaced"
                  onClick={() => {
                    setDetail(null);
                    setCancel(r);
                  }}
                >
                  Cancelar inscrição demonstrativa
                </button>
              )}
            </Modal>
          );
        })()}
      {cardReg &&
        (() => {
          const r = db.registrations.find((x) => x.id === cardReg.id) || cardReg;
          const event = db.events.find((e) => e.id === r.eventId)!;
          return (
            <Modal title="Carteirinha virtual" onClose={() => setCardReg(null)}>
              <div className="virtual-card">
                <div className="virtual-card-header">
                  <strong>Largada</strong>
                  <span>Carteirinha do atleta</span>
                </div>
                <div className="virtual-card-event">
                  <h3>{event.name}</h3>
                  <p>
                    {dateLabel(event.date)} · {event.city}, {event.state}
                  </p>
                </div>
                <div className="virtual-card-body">
                  <div className="virtual-card-info">
                    <div>
                      <small>ATLETA</small>
                      <strong>{r.name}</strong>
                    </div>
                    <div>
                      <small>DISTÂNCIA</small>
                      <strong>{r.distance}</strong>
                    </div>
                    <div>
                      <small>CATEGORIA</small>
                      <strong>{r.category}</strong>
                    </div>
                    {r.bib && (
                      <div>
                        <small>Nº DE PEITO</small>
                        <strong>#{r.bib}</strong>
                      </div>
                    )}
                  </div>
                  <div className="virtual-card-qr">
                    <QRCodeSVG value={`LARGADA:${r.id}:${event.id}`} size={110} />
                    <small>{r.id}</small>
                  </div>
                </div>
              </div>
              <p className="modal-hint">
                Apresente este QR Code no balcão de credenciamento. Dados demonstrativos, sem
                validade real.
              </p>
            </Modal>
          );
        })()}
      {review && (
        <Modal
          title={`Como foi a ${db.events.find((e) => e.id === review.eventId)?.name ?? 'prova'}?`}
          onClose={() => setReview(null)}
        >
          <form
            className="review-form"
            onSubmit={(e) => {
              e.preventDefault();
              const text = reviewText.trim();
              if (text.length < 20) {
                setReviewError('Escreva pelo menos 20 caracteres.');
                return;
              }
              update(
                (d) => ({
                  ...d,
                  testimonials: [
                    {
                      id: uid('dep'),
                      registrationId: review.id,
                      eventId: review.eventId,
                      name: review.name,
                      text,
                      createdAt: new Date().toISOString(),
                      visible: false,
                    },
                    ...d.testimonials,
                  ],
                }),
                `Depoimento enviado por ${review.name}`,
              );
              toast('Depoimento enviado. Ele aparece no site depois da aprovação.');
              setReview(null);
            }}
          >
            <Field label="Seu depoimento" full>
              <textarea
                rows={4}
                maxLength={280}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Conte como foi a prova: percurso, retirada do kit, organização."
                autoFocus
              />
            </Field>
            <p className="review-hint">
              <span>Aparece na página inicial depois da aprovação da administração.</span>
              <span>{reviewText.length}/280</span>
            </p>
            {reviewError && (
              <p className="error-message" role="alert">
                {reviewError}
              </p>
            )}
            <div className="modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setReview(null)}>
                Cancelar
              </button>
              <button type="submit" className="button button-primary">
                Enviar depoimento
              </button>
            </div>
          </form>
        </Modal>
      )}
      {cancel && (
        <Modal title="Cancelar esta inscrição?" onClose={() => setCancel(null)}>
          <p className="section-description">
            A inscrição <strong>{cancel.id}</strong> será cancelada somente nesta demonstração.
            Nenhum valor real será estornado ou cobrado.
          </p>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={() => setCancel(null)}>
              Manter inscrição
            </button>
            <button
              className="button button-danger"
              onClick={() => {
                update(
                  (d) => ({
                    ...d,
                    registrations: d.registrations.map((r) =>
                      r.id === cancel.id ? { ...r, status: 'Cancelada', paidAt: '' } : r,
                    ),
                  }),
                  `Inscrição ${cancel.id} cancelada pelo atleta`,
                );
                toast('Inscrição cancelada na demonstração.');
                setCancel(null);
              }}
            >
              <XCircle size={15} />
              Confirmar cancelamento
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function AthleteProfile() {
  const { db, session, update, login, toast } = useApp();
  const source =
    db.profile.cpf === session?.cpf
      ? db.profile
      : db.registrations.find((r) => r.cpf === session?.cpf) || db.profile;
  const [draft, setDraft] = useState({
    ...source,
    name: session?.name || source.name,
    email: session?.email || source.email,
  });
  function save(e: FormEvent) {
    e.preventDefault();
    update(
      (d) => ({
        ...d,
        profile: {
          name: draft.name,
          email: draft.email,
          cpf: draft.cpf,
          birth: draft.birth,
          sex: draft.sex,
          phone: draft.phone,
          city: draft.city,
          state: draft.state,
          team: draft.team,
          emergency: draft.emergency,
        },
      }),
      'Perfil demonstrativo do atleta atualizado',
    );
    if (session) login({ ...session, name: draft.name, email: draft.email });
    toast('Dados salvos para suas próximas inscrições. Inscrições anteriores não foram alteradas.');
  }
  return (
    <Panel title="Meus dados" description="Esses dados ajudam a preparar suas próximas inscrições.">
      <form onSubmit={save}>
        <div className="form-grid">
          <Field label="Nome completo *" full>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              minLength={5}
              required
            />
          </Field>
          <Field label="CPF (não editável)">
            <input value={draft.cpf} disabled />
          </Field>
          <Field label="Data de nascimento">
            <input
              type="date"
              value={draft.birth}
              onChange={(e) => setDraft({ ...draft, birth: e.target.value })}
              required
            />
          </Field>
          <Field label="E-mail *">
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              required
            />
          </Field>
          <Field label="Celular">
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              required
            />
          </Field>
          <Field label="Cidade">
            <input
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              required
            />
          </Field>
          <Field label="Estado">
            <select
              value={draft.state}
              onChange={(e) => setDraft({ ...draft, state: e.target.value })}
            >
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Equipe / assessoria">
            <input
              value={draft.team}
              onChange={(e) => setDraft({ ...draft, team: e.target.value })}
            />
          </Field>
          <Field label="Contato de emergência">
            <input
              type="tel"
              value={draft.emergency}
              onChange={(e) => setDraft({ ...draft, emergency: e.target.value })}
            />
          </Field>
        </div>
        <div className="form-actions">
          <button type="submit" className="button button-primary">
            <Save size={15} />
            Salvar meus dados
          </button>
        </div>
      </form>
    </Panel>
  );
}
