'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Share2,
  Shirt,
  ShieldCheck,
  Check,
  Route,
  ChevronDown,
  ExternalLink,
  PackageCheck,
  Users,
} from 'lucide-react';
import { Header, Footer } from './navigation';
import { DemoNotice, useApp } from './provider';
import { Badge, EmptyState, Panel, SportIcon, Modal } from './ui';
import { asset, dateLabel, money, shortDate } from '@/lib/utils';

const faqItems = [
  {
    q: 'Como funciona a retirada do kit?',
    a: 'A retirada acontece um ou dois dias antes da prova, no local indicado pela organização. Leve seu documento com foto e o comprovante de inscrição. Os detalhes estão na aba "Kit do atleta".',
  },
  {
    q: 'Posso transferir minha inscrição para outra pessoa?',
    a: 'A política de transferência é definida pela organização. Consulte os prazos e condições disponíveis na sua área do atleta. A transferência pode estar sujeita a taxas administrativas.',
  },
  {
    q: 'Qual é a idade mínima para participar?',
    a: 'A idade mínima é 16 anos. Participantes menores de 18 anos precisam de autorização de um responsável legal, apresentada no momento da retirada do kit.',
  },
  {
    q: 'Como funciona o cancelamento da inscrição?',
    a: 'Cancelamentos têm prazos e condições definidos pela organização do evento. Acesse sua área do atleta para verificar as opções disponíveis. Este é um ambiente demonstrativo e não realiza cobranças reais.',
  },
  {
    q: 'Como saberei meu número de peito?',
    a: 'O número de peito é definido pela organização e disponibilizado na sua área do atleta próximo à data da prova. Ele também será entregue junto ao kit no dia da retirada.',
  },
];

export default function EventDetail() {
  const params = useSearchParams();
  const { db, toast } = useApp();
  const event = db.events.find((e) => e.id === params.get('id') && e.status !== 'Rascunho');
  const [tab, setTab] = useState('Sobre a prova'),
    [rules, setRules] = useState(false),
    [faqOpen, setFaqOpen] = useState<number | null>(null);
  if (!event)
    return (
      <>
        <Header />
        <div className="container standalone">
          <EmptyState
            title="Evento não encontrado"
            text="Este evento não está disponível no catálogo."
            action={
              <Link href="/" className="button button-primary">
                Explorar eventos
              </Link>
            }
          />
        </div>
        <Footer />
      </>
    );
  const organizer = db.organizers.find((o) => o.id === event.organizerId);
  const inscritos = db.registrations.filter(
    (r) => r.eventId === event.id && r.status !== 'Cancelada',
  );
  const open = event.status === 'Inscrições abertas';
  useEffect(() => {
    document.title = `${event.name} | CorridaAqui`;
    return () => {
      document.title = 'CorridaAqui — Seu próximo ponto de partida';
    };
  }, [event.name]);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.name, text: event.subtitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link do evento copiado.');
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  };
  return (
    <>
      <Header />
      <DemoNotice />
      <main className="container event-detail-page">
        <div className="breadcrumb">
          <Link href="/">
            <ArrowLeft size={14} />
            Explorar eventos
          </Link>
          <span>/</span>
          <span>{event.name}</span>
        </div>
        <div className="event-detail-hero">
          <img src={asset(event.image)} alt={event.name} />
          <div className="event-detail-overlay" />
          <div className="event-detail-title">
            <span className="image-sport">
              <SportIcon sport={event.sport} size={16} />
              {event.sport}
            </span>
            <h1>{event.name}</h1>
            <p>{event.subtitle}</p>
          </div>
          <button className="share-button" onClick={share}>
            <Share2 size={16} />
            <span>Compartilhar</span>
          </button>
        </div>
        <div className="event-detail-layout">
          <div>
            <div className="event-info-strip">
              <div>
                <CalendarDays size={20} />
                <span>
                  <small>DATA DA PROVA</small>
                  <strong>{dateLabel(event.date)}</strong>
                </span>
              </div>
              <div>
                <Clock3 size={20} />
                <span>
                  <small>LARGADA</small>
                  <strong>{event.time}h</strong>
                </span>
              </div>
              <div>
                <MapPin size={20} />
                <span>
                  <small>LOCALIZAÇÃO</small>
                  <strong>
                    {event.city}, {event.state}
                  </strong>
                </span>
              </div>
            </div>
            <div className="tabs">
              {[
                'Sobre a prova',
                'Percursos e categorias',
                'Kit do atleta',
                'Regulamento',
                'Dúvidas frequentes',
                ...(event.publicList ? ['Inscritos'] : []),
              ].map((t) => (
                <button className={tab === t ? 'active' : ''} onClick={() => setTab(t)} key={t}>
                  {t}
                </button>
              ))}
            </div>
            <section className="event-detail-content">
              {tab === 'Inscritos' && event.publicList && (
                <>
                  <h2>Gente que vai se colocar em movimento.</h2>
                  <p>
                    Lista pública autorizada pela organização. Apenas nomes, distâncias e categorias
                    são exibidos; documentos e contatos permanecem privados na interface.
                  </p>
                  {inscritos.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Atleta</th>
                            <th>Distância</th>
                            <th>Categoria</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscritos.map((r) => (
                            <tr key={r.id}>
                              <td>
                                <strong>{r.name}</strong>
                              </td>
                              <td>{r.distance}</td>
                              <td>{r.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="O primeiro passo pode ser seu"
                      text="As inscrições aparecerão aqui em breve."
                    />
                  )}
                </>
              )}
              {tab === 'Sobre a prova' && (
                <>
                  <span className="eyebrow">CADA PASSO CONTA UMA HISTÓRIA</span>
                  <h2>Um encontro com o seu próximo desafio.</h2>
                  <p>{event.description}</p>
                  <h3>Estrutura para você ir além</h3>
                  <div className="benefits-grid">
                    {[
                      'Pontos de hidratação',
                      'Medalha de participação',
                      'Apoio na arena',
                      'Percurso sinalizado',
                      'Equipe de primeiros socorros',
                      'Guarda-volumes',
                    ].map((s) => (
                      <span key={s}>
                        <Check size={16} />
                        {s}
                      </span>
                    ))}
                  </div>
                  <h3>O ponto de encontro</h3>
                  <p>
                    {event.venue} · {event.city}, {event.state}
                  </p>
                  <div className="location-preview">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue + ', ' + event.city + ', ' + event.state + ', Brasil')}&output=embed&z=15&hl=pt-BR`}
                      className="map-iframe"
                      loading="lazy"
                      title={`Localização: ${event.venue}`}
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ', ' + event.city + ', ' + event.state)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-outline button-small"
                    >
                      Abrir no Google Maps
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </>
              )}
              {tab === 'Percursos e categorias' && (
                <>
                  <h2>Encontre a sua distância.</h2>
                  <p>
                    Escolha o desafio que combina com o seu momento. A categoria é calculada
                    automaticamente pela sua idade na data da prova e pelo sexo informado.
                  </p>
                  {event.distances.map((d) => (
                    <div className="distance-detail" key={d.name}>
                      <span className="distance-icon">
                        <Route size={25} />
                      </span>
                      <div>
                        <h3>{d.name}</h3>
                        <p>
                          {d.capacity} vagas · Largada às {event.time}h
                        </p>
                      </div>
                      <strong>{money(d.price)}</strong>
                    </div>
                  ))}
                  <div className="info-message spaced">
                    <Users size={17} />
                    Categorias por faixa etária: 16–19, 20–29, 30–39, 40–49, 50–59 e 60+ anos. Idade
                    mínima de 16 anos para esta demonstração.
                  </div>
                </>
              )}
              {tab === 'Kit do atleta' && (
                <>
                  <h2>Seu kit, do seu jeito.</h2>
                  <p>
                    Todos os kits incluem medalha de participação, número de peito e acesso à arena.
                    Escolha sua opção ao se inscrever.
                  </p>
                  <div className="kit-options">
                    <div className="kit-option">
                      <Shirt size={38} />
                      <h3>Kit Essencial</h3>
                      <p>Camiseta, número de peito e medalha.</p>
                      <strong>Incluso na inscrição</strong>
                    </div>
                    <div className="kit-option">
                      <PackageCheck size={38} />
                      <h3>Kit Completo</h3>
                      <p>Kit Essencial + sacochila e squeeze.</p>
                      <strong>+ {money(35)}</strong>
                    </div>
                  </div>
                  <h3>Retirada do kit</h3>
                  <p>{event.kitPickup}</p>
                  <div className="info-message">
                    <ShieldCheck size={17} />
                    Apresente seu documento e comprovante de inscrição. A entrega do kit poderá ser
                    acompanhada na sua área.
                  </div>
                </>
              )}
              {tab === 'Dúvidas frequentes' && (
                <>
                  <h2>Tire suas dúvidas antes de largar.</h2>
                  <p>As perguntas mais frequentes sobre inscrições, kits e participação.</p>
                  <div className="faq-accordion">
                    {faqItems.map((item, i) => (
                      <div key={i} className={`faq-item${faqOpen === i ? ' open' : ''}`}>
                        <button
                          className="faq-question"
                          onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        >
                          {item.q}
                          <ChevronDown size={16} />
                        </button>
                        {faqOpen === i && <p className="faq-answer">{item.a}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === 'Regulamento' && (
                <>
                  <h2>Antes da largada.</h2>
                  <p>
                    Leia as condições de participação. Este é um regulamento ilustrativo, válido
                    somente para a experiência demonstrativa.
                  </p>
                  <div className="rules-copy">
                    <h3>1. Participação</h3>
                    <p>
                      Participantes a partir de 16 anos, em condições de saúde adequadas para a
                      prática esportiva. Menores de 18 anos precisam de autorização do responsável.
                    </p>
                    <h3>2. Inscrições e pagamento</h3>
                    <p>
                      As inscrições são pessoais. A confirmação ocorre após o pagamento simulado.
                      Não utilize dados bancários reais neste ambiente.
                    </p>
                    <h3>3. Kit e percurso</h3>
                    <p>
                      A retirada exige documento e comprovante. O atleta deve respeitar a
                      sinalização e as orientações da organização.
                    </p>
                    <h3>4. Cancelamento</h3>
                    <p>
                      Consulte a organização sobre os prazos de cancelamento, transferência de
                      titularidade e alterações de modalidade.
                    </p>
                  </div>
                  <button className="button button-outline spaced" onClick={() => setRules(true)}>
                    Ler termo de responsabilidade
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </section>
            <div className="organizer-info">
              <span className="avatar">{organizer?.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <small>QUEM FAZ ACONTECER</small>
                <strong>{organizer?.name}</strong>
                <span>Organizador do evento · {organizer?.city}</span>
              </div>
              <ShieldCheck size={22} />
            </div>
          </div>
          <aside className="event-booking">
            <Panel>
              <Badge>{event.status}</Badge>
              <h2>Seu lugar na largada.</h2>
              <p>Escolha sua distância e venha fazer parte.</p>
              <div className="booking-price">
                <small>A partir de</small>
                <strong>{money(Math.min(...event.distances.map((d) => d.price)))}</strong>
                <span>
                  {event.feePayer === 'atleta'
                    ? `+ ${event.serviceFee}% de taxa de serviço`
                    : 'Taxa de serviço inclusa'}
                </span>
              </div>
              <div className="booking-distances">
                {event.distances.map((d) => (
                  <span key={d.name}>{d.name}</span>
                ))}
              </div>
              <div className="progress-track">
                <span
                  style={{ width: `${Math.min(100, (inscritos.length / event.capacity) * 100)}%` }}
                />
              </div>
              <div className="booking-availability">
                <span>{inscritos.length} atletas já garantiram seu lugar</span>
                <strong>{Math.max(0, event.capacity - inscritos.length)} vagas</strong>
              </div>
              {open ? (
                <Link
                  href={`/inscricao/?evento=${event.id}`}
                  className="button button-primary full-width"
                >
                  Quero me inscrever
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <button disabled className="button button-outline full-width">
                  {event.status === 'Em breve' ? 'Inscrições em breve' : 'Inscrições encerradas'}
                </button>
              )}
              <div className="booking-deadline">
                <CalendarDays size={14} />
                Até {shortDate(event.registrationEnd)}
              </div>
              <hr className="divider" />
              <div className="booking-safe">
                <ShieldCheck size={22} />
                <span>
                  Pagamento demonstrativo
                  <br />
                  <strong>PIX, cartão ou boleto · sem cobrança</strong>
                </span>
              </div>
            </Panel>
          </aside>
        </div>
      </main>
      <Footer />
      {rules && (
        <Modal title="Termo de responsabilidade" onClose={() => setRules(false)}>
          <p className="section-description">
            Declaro estar em condições de saúde adequadas para participar de uma atividade esportiva
            e compreender as regras de segurança. Autorizo o uso dos dados informados exclusivamente
            nesta simulação local. Este MVP não representa inscrição real, não realiza cobranças e
            não presta atendimento a eventos reais.
          </p>
          <button className="button button-primary full-width" onClick={() => setRules(false)}>
            Entendi
          </button>
        </Modal>
      )}
    </>
  );
}
