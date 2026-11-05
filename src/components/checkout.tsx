'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Landmark,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Tag,
  Ticket,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Header, Footer } from './navigation';
import { DemoNotice, useApp } from './provider';
import { Badge, EmptyState, Field, Modal, Panel } from './ui';
import { demoProfile } from '@/lib/data';
import type { Athlete, Registration } from '@/lib/types';
import { ageAt, asset, categoryFor, dateLabel, money, states, uid, validCPF } from '@/lib/utils';
import { downloadReceipt } from '@/lib/export';
import { features } from '@/lib/features';

export default function Checkout() {
  const params = useSearchParams();
  const { db, ready, session, update, login, toast } = useApp();
  const event = db.events.find((e) => e.id === params.get('evento') && e.status !== 'Rascunho');
  const [step, setStep] = useState(1),
    [regId, setRegId] = useState(''),
    [athlete, setAthlete] = useState<Athlete>({
      ...demoProfile,
      name: '',
      email: '',
      cpf: '',
      birth: '',
      phone: '',
      team: '',
      emergency: '',
    });
  const [distance, setDistance] = useState(''),
    [shirt, setShirt] = useState('M'),
    [kit, setKit] = useState('Essencial'),
    [partner, setPartner] = useState(''),
    [notes, setNotes] = useState(''),
    [accepted, setAccepted] = useState(false),
    [rules, setRules] = useState(false),
    [error, setError] = useState('');
  const [method, setMethod] = useState<Registration['method']>('PIX'),
    [installments, setInstallments] = useState(1),
    [coupon, setCoupon] = useState(''),
    [applied, setApplied] = useState(''),
    [outcome, setOutcome] = useState('success'),
    [processing, setProcessing] = useState(false);
  // Restore only once after provider hydration; subsequent edits belong to the user.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready || !event) return;
    if (session?.role === 'atleta')
      setAthlete({
        ...(db.profile.cpf === session.cpf
          ? db.profile
          : db.registrations.find((r) => r.cpf === session.cpf) || demoProfile),
        email: session.email,
        cpf: session.cpf || db.profile.cpf,
        name: session.name,
      });
    try {
      const id = sessionStorage.getItem(`corridaqui-checkout-${event.id}`);
      const reg = db.registrations.find((r) => r.id === id);
      if (reg && reg.status !== 'Cancelada') {
        setRegId(reg.id);
        setStep(reg.status === 'Confirmada' ? 3 : 2);
        setAthlete(reg);
        setDistance(reg.distance);
        setShirt(reg.shirt);
        setKit(reg.kit);
        setPartner(reg.partner);
        setNotes(reg.notes);
        setMethod(reg.method);
        setApplied(reg.coupon);
        setCoupon(reg.coupon);
        setInstallments(reg.installments);
      }
    } catch {}
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */
  if (!event)
    return (
      <>
        <Header />
        <div className="container standalone">
          <EmptyState
            title="Escolha um evento primeiro"
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
  const selected = event.distances.find((d) => d.name === distance) || event.distances[0];
  const couponData = db.coupons.find(
    (c) =>
      c.eventId === event.id &&
      c.code === applied &&
      c.active &&
      c.used < c.limit &&
      c.expires >= new Date().toISOString().slice(0, 10),
  );
  const extra = kit === 'Completo' ? 35 : 0;
  const discount = couponData
    ? Math.min(
        selected.price + extra,
        couponData.type === 'percentual'
          ? ((selected.price + extra) * couponData.value) / 100
          : couponData.value,
      )
    : 0;
  const base = selected.price + extra - discount,
    fee = Math.round(base * event.serviceFee) / 100;
  const total = Math.round((base + (event.feePayer === 'atleta' ? fee : 0)) * 100) / 100;
  const registration = db.registrations.find((r) => r.id === regId);
  const setA = (key: keyof Athlete, value: string) => setAthlete((a) => ({ ...a, [key]: value }));
  const category = athlete.birth
    ? categoryFor(athlete.birth, athlete.sex, event.date)
    : 'Preencha nascimento e sexo para calcular';
  function savePending(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (event!.status !== 'Inscrições abertas') {
      setError('As inscrições deste evento não estão abertas.');
      return;
    }
    if (!validCPF(athlete.cpf)) {
      setError('CPF inválido. Para testar, use 529.982.247-25.');
      return;
    }
    if (ageAt(athlete.birth, event!.date) < 16 || ageAt(athlete.birth, event!.date) > 100) {
      setError('A idade deve estar entre 16 e 100 anos na data da prova.');
      return;
    }
    if (!accepted) {
      setError('É necessário aceitar o regulamento.');
      return;
    }
    const active = db.registrations.filter(
      (r) => r.eventId === event!.id && r.status !== 'Cancelada',
    );
    if (
      active.filter((r) => r.distance === selected.name && r.id !== regId).length >=
        selected.capacity ||
      active.filter((r) => r.id !== regId).length >= event!.capacity
    ) {
      setError('Não há mais vagas nesta modalidade. Escolha outra distância.');
      return;
    }
    const duplicate = active.find(
      (r) => r.cpf === athlete.cpf.replace(/\D/g, '') && r.id !== regId,
    );
    if (duplicate) {
      setError(
        'Este CPF já tem uma inscrição neste evento. Acesse Minhas inscrições para consultar ou pagar a inscrição pendente.',
      );
      return;
    }
    const id = regId || uid('CA');
    const reg: Registration = {
      ...athlete,
      name: athlete.name.trim(),
      email: athlete.email.toLowerCase().trim(),
      cpf: athlete.cpf.replace(/\D/g, ''),
      id,
      eventId: event!.id,
      distance: selected.name,
      category,
      shirt,
      kit,
      kitExtra: extra,
      partner,
      notes,
      status: 'Pendente',
      method,
      amount: total,
      fee,
      discount,
      coupon: applied,
      createdAt: registration?.createdAt || new Date().toISOString(),
      paidAt: '',
      bib:
        registration?.bib ||
        String(
          Math.max(
            100,
            ...db.registrations
              .filter((r) => r.eventId === event!.id)
              .map((r) => Number(r.bib) || 0),
          ) + 1,
        ),
      kitDelivered: false,
      installments,
    };
    update(
      (d) => ({ ...d, registrations: [reg, ...d.registrations.filter((r) => r.id !== id)] }),
      `Inscrição ${id} criada · aguardando pagamento`,
    );
    setRegId(id);
    setStep(2);
    try {
      sessionStorage.setItem(`corridaqui-checkout-${event!.id}`, id);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function applyCoupon() {
    const found = db.coupons.find(
      (c) =>
        c.eventId === event!.id &&
        c.code === coupon.trim().toUpperCase() &&
        c.active &&
        c.used < c.limit &&
        c.expires >= new Date().toISOString().slice(0, 10),
    );
    if (!found) {
      setApplied('');
      setError('Cupom inválido, esgotado ou fora da validade para este evento.');
      return;
    }
    setApplied(found.code);
    setError('');
    toast('Cupom aplicado ao resumo da inscrição.');
  }
  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!registration || processing) return;
    if (registration.status === 'Cancelada') {
      setError('Esta inscrição foi cancelada e não pode ser paga. Faça uma nova inscrição.');
      return;
    }
    if (registration.status === 'Confirmada') {
      setStep(3);
      return;
    }
    setError('');
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (outcome === 'declined') {
      setError(
        'Pagamento recusado na simulação. Escolha aprovação no controle de demonstração e tente novamente.',
      );
      setProcessing(false);
      return;
    }
    const status = outcome === 'pending' ? 'Pendente' : 'Confirmada';
    update(
      (d) => ({
        ...d,
        profile: {
          name: athlete.name,
          email: athlete.email,
          cpf: athlete.cpf.replace(/\D/g, ''),
          birth: athlete.birth,
          sex: athlete.sex,
          phone: athlete.phone,
          city: athlete.city,
          state: athlete.state,
          team: athlete.team,
          emergency: athlete.emergency,
        },
        registrations: d.registrations.map((r) =>
          r.id === regId
            ? {
                ...r,
                status,
                method,
                installments: method === 'Cartão' ? installments : 1,
                amount: total,
                fee,
                discount,
                coupon: applied,
                paidAt: status === 'Confirmada' ? new Date().toISOString().slice(0, 10) : '',
              }
            : r,
        ),
        coupons: d.coupons.map((c) =>
          c.code === applied && c.eventId === event!.id && status === 'Confirmada'
            ? { ...c, used: c.used + 1 }
            : c,
        ),
      }),
      `Pagamento ${status === 'Confirmada' ? 'aprovado' : 'pendente'} · ${regId} · ${method} (simulação)`,
    );
    if (!session || session.role === 'atleta')
      login({
        role: 'atleta',
        name: athlete.name,
        email: athlete.email,
        cpf: athlete.cpf.replace(/\D/g, ''),
      });
    setProcessing(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const fillDemo = () => {
    const occupied = db.registrations.some(
      (r) => r.eventId === event!.id && r.cpf === demoProfile.cpf && r.status !== 'Cancelada',
    );
    setAthlete({
      ...demoProfile,
      ...(occupied ? { name: 'Alex Costa', email: 'alex@exemplo.test', cpf: '11144477735' } : {}),
    });
    toast('Dados fictícios preenchidos. Revise antes de continuar.');
  };
  return (
    <>
      <Header />
      <DemoNotice />
      <main className="container checkout-page">
        <Link href={`/evento/?id=${event.id}`} className="back-link">
          <ArrowLeft size={15} />
          Voltar ao evento
        </Link>
        <div className="checkout-header">
          <span className="eyebrow">MAIS PERTO DA SUA PRÓXIMA CONQUISTA</span>
          <h1>
            {step === 3
              ? registration?.status === 'Confirmada'
                ? 'Inscrição confirmada.'
                : 'Falta confirmar o pagamento.'
              : step === 2
                ? 'Revise e pague.'
                : 'Dados da inscrição.'}
          </h1>
          <p>
            {step === 1
              ? 'Preencha seus dados e escolha a distância.'
              : step === 2
                ? 'Confira os dados e escolha a forma de pagamento. Nenhuma cobrança é real.'
                : 'Acompanhe os detalhes na sua área do atleta.'}
          </p>
        </div>
        <div className="checkout-steps">
          {['Seus dados', 'Pagamento', 'Confirmação'].map((s, i) => (
            <div key={s} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}>
              <span>{step > i + 1 ? <Check size={15} /> : String(i + 1).padStart(2, '0')}</span>
              <strong>{s}</strong>
            </div>
          ))}
        </div>
        <div className="checkout-layout">
          <section>
            {step === 1 && (
              <form onSubmit={savePending}>
                <Panel
                  title="Dados do atleta"
                  description="Use somente dados fictícios nesta demonstração."
                  action={
                    <button type="button" className="text-link" onClick={fillDemo}>
                      Preencher exemplo
                      <ArrowRight size={14} />
                    </button>
                  }
                >
                  <div className="form-section">
                    <div className="form-grid">
                      <Field label="Nome completo *" full>
                        <input
                          value={athlete.name}
                          onChange={(e) => setA('name', e.target.value)}
                          minLength={5}
                          required
                          placeholder="Nome e sobrenome"
                          autoComplete="name"
                        />
                      </Field>
                      <Field label="CPF *">
                        <input
                          value={athlete.cpf}
                          onChange={(e) => setA('cpf', e.target.value)}
                          required
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </Field>
                      <Field label="Data de nascimento *">
                        <input
                          type="date"
                          value={athlete.birth}
                          onChange={(e) => setA('birth', e.target.value)}
                          required
                          max={event.date}
                        />
                      </Field>
                      <Field label="Sexo *">
                        <select
                          value={athlete.sex}
                          onChange={(e) => setA('sex', e.target.value)}
                          required
                        >
                          <option value="F">Feminino</option>
                          <option value="M">Masculino</option>
                          <option value="X">Não informar · Categoria aberta</option>
                        </select>
                      </Field>
                      <Field label="E-mail *">
                        <input
                          type="email"
                          value={athlete.email}
                          onChange={(e) => setA('email', e.target.value)}
                          required
                          placeholder="voce@exemplo.test"
                          autoComplete="email"
                        />
                      </Field>
                      <Field label="Celular *">
                        <input
                          type="tel"
                          value={athlete.phone}
                          onChange={(e) => setA('phone', e.target.value)}
                          required
                          placeholder="(00) 00000-0000"
                          minLength={10}
                        />
                      </Field>
                      <Field label="Contato de emergência *">
                        <input
                          type="tel"
                          value={athlete.emergency}
                          onChange={(e) => setA('emergency', e.target.value)}
                          required
                          minLength={10}
                          placeholder="(00) 00000-0000"
                        />
                      </Field>
                      <Field label="Cidade *">
                        <input
                          value={athlete.city}
                          onChange={(e) => setA('city', e.target.value)}
                          required
                        />
                      </Field>
                      <Field label="Estado *">
                        <select
                          value={athlete.state}
                          onChange={(e) => setA('state', e.target.value)}
                          required
                        >
                          {states.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3>Distância e kit</h3>
                    <div className="distance-choices">
                      {event.distances.map((d) => (
                        <label
                          className={`distance-choice ${selected.name === d.name ? 'selected' : ''}`}
                          key={d.name}
                        >
                          <input
                            type="radio"
                            name="distance"
                            checked={selected.name === d.name}
                            onChange={() => setDistance(d.name)}
                          />
                          <strong>{d.name}</strong>
                          <span>{money(d.price)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="form-grid spaced">
                      <Field label="Categoria automática" full>
                        <div className="category-value">
                          <ShieldCheck size={16} />
                          {category}
                        </div>
                      </Field>
                      <Field label="Tamanho da camiseta">
                        <select value={shirt} onChange={(e) => setShirt(e.target.value)}>
                          {['PP', 'P', 'M', 'G', 'GG', 'XGG'].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Kit do atleta">
                        <select value={kit} onChange={(e) => setKit(e.target.value)}>
                          <option value="Essencial">Essencial · Incluso</option>
                          <option value="Completo">Completo · + R$ 35,00</option>
                        </select>
                      </Field>
                      <Field label="Equipe / assessoria">
                        <input
                          value={athlete.team}
                          onChange={(e) => setA('team', e.target.value)}
                          placeholder="Opcional"
                        />
                      </Field>
                      {features.partner && (
                        <Field label="Parceiro(a) de dupla">
                          <input
                            value={partner}
                            onChange={(e) => setPartner(e.target.value)}
                            placeholder="Opcional"
                          />
                        </Field>
                      )}
                      <Field label="Observações" full>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Algo que a organização precisa saber?"
                          maxLength={500}
                        />
                      </Field>
                    </div>
                  </div>
                  <div className="form-section">
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        required
                      />
                      <span>
                        Li e aceito o{' '}
                        <button
                          type="button"
                          className="inline-link"
                          onClick={() => setRules(true)}
                        >
                          regulamento e o termo de responsabilidade
                        </button>
                        . Entendo que esta inscrição é fictícia e os dados ficam neste navegador.
                      </span>
                    </label>
                    {error && (
                      <div className="error-message" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="form-actions">
                      <button type="submit" className="button button-primary">
                        Continuar para pagamento
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </Panel>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={pay}>
                <Panel
                  title="Como prefere pagar?"
                  description="Gateway simulado. Não informe dados bancários reais."
                >
                  <div className="payment-methods">
                    {(
                      [
                        { value: 'PIX', icon: QrCode, label: 'PIX' },
                        { value: 'Cartão', icon: CreditCard, label: 'Cartão' },
                        { value: 'Boleto', icon: FileText, label: 'Boleto' },
                      ] as const
                    ).map((m) => (
                      <button
                        type="button"
                        key={m.value}
                        className={method === m.value ? 'selected' : ''}
                        onClick={() => setMethod(m.value)}
                      >
                        <m.icon size={21} />
                        <strong>{m.label}</strong>
                        {method === m.value && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                  {method === 'PIX' && (
                    <div className="pix-block">
                      <div className="demo-qr">
                        <QRCodeSVG
                          value={`CORRIDAAQUI-DEMONSTRACAO-SEM-VALOR-${regId}`}
                          size={160}
                          fgColor="#183e2c"
                          marginSize={2}
                        />
                        <span>QR CODE SEM VALOR FINANCEIRO</span>
                      </div>
                      <div>
                        <h3>Um PIX só de demonstração.</h3>
                        <p>
                          O QR code não contém uma chave PIX. Use o botão abaixo para simular a
                          confirmação.
                        </p>
                        <button
                          type="button"
                          className="button button-outline button-small"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`DEMO-NAO-PAGAR-${regId}`);
                              toast('Código fictício copiado. Não é uma chave de pagamento.');
                            } catch {
                              toast(`Código: DEMO-NAO-PAGAR-${regId}`);
                            }
                          }}
                        >
                          <Copy size={14} />
                          Copiar código fictício
                        </button>
                        <small>Esta simulação não expira e não gera cobrança.</small>
                      </div>
                    </div>
                  )}
                  {method === 'Cartão' && (
                    <div className="card-payment">
                      <div className="demo-credit-card">
                        <span>
                          corridaaqui. <small>DEMO</small>
                        </span>
                        <CreditCard size={28} />
                        <strong>4242 4242 4242 4242</strong>
                        <div>
                          <span>ATLETA DEMONSTRAÇÃO</span>
                          <span>12/30</span>
                        </div>
                      </div>
                      <div className="info-message">
                        <LockKeyhole size={16} />
                        Cartão fictício pré-preenchido. Nenhum dado de cartão é coletado, salvo ou
                        transmitido.
                      </div>
                      <Field label="Parcelamento sem juros">
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                          {Array.from({ length: event.installments }, (_, i) => (
                            <option value={i + 1} key={i}>
                              {i + 1}x de {money(total / (i + 1))}
                              {i === 0 ? ' · à vista' : ''}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  )}
                  {method === 'Boleto' && (
                    <div className="boleto-payment">
                      <Landmark size={37} />
                      <h3>Boleto demonstrativo</h3>
                      <p>
                        Nenhum boleto válido é emitido. Use a confirmação simulada para continuar.
                      </p>
                      <code>DEMO 00000.00000 00000.000000 0 00000000000000</code>
                    </div>
                  )}
                  <div className="coupon-section">
                    <label htmlFor="coupon">
                      <Tag size={16} />
                      Tem um cupom?
                    </label>
                    <div>
                      <input
                        id="coupon"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        placeholder={
                          event.id === 'meia-do-cerrado'
                            ? 'Experimente BEMVINDO10'
                            : 'Código do cupom'
                        }
                        maxLength={30}
                      />
                      <button className="button button-outline" type="button" onClick={applyCoupon}>
                        Aplicar
                      </button>
                    </div>
                    {applied && couponData && (
                      <span className="coupon-applied">
                        <Check size={14} />
                        {applied} · desconto de {money(discount)}
                        <button
                          type="button"
                          onClick={() => {
                            setApplied('');
                            setCoupon('');
                          }}
                        >
                          Remover
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="gateway-control">
                    <span>
                      <SlidersIcon />
                      CONTROLE DA DEMONSTRAÇÃO
                    </span>
                    <Field label="Resultado do pagamento simulado">
                      <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                        <option value="success">Aprovar pagamento</option>
                        <option value="declined">Recusar pagamento</option>
                        <option value="pending">Manter pagamento pendente</option>
                      </select>
                    </Field>
                  </div>
                  {error && (
                    <div className="error-message" role="alert">
                      <AlertCircle size={15} />
                      {error}
                    </div>
                  )}
                  <div className="form-actions">
                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setAccepted(true);
                      }}
                    >
                      Voltar aos dados
                    </button>
                    <button type="submit" disabled={processing} className="button button-primary">
                      {processing ? (
                        <>
                          <span className="spinner" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Simular pagamento de {money(total)}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </Panel>
              </form>
            )}
            {step === 3 && registration && (
              <Panel className="confirmation-panel">
                <div
                  className={`confirmation-icon ${registration.status === 'Pendente' ? 'pending' : ''}`}
                >
                  {registration.status === 'Confirmada' ? (
                    <CheckCircle2 size={42} />
                  ) : (
                    <ClockIcon />
                  )}
                </div>
                <Badge>{registration.status}</Badge>
                <h2>
                  {registration.status === 'Confirmada'
                    ? 'A próxima conquista já tem data.'
                    : 'Inscrição reservada. Pagamento pendente.'}
                </h2>
                <p>
                  {registration.status === 'Confirmada'
                    ? `Tudo certo, ${registration.name.split(' ')[0]}! Sua inscrição está confirmada.`
                    : 'Você pode voltar à sua área e concluir o pagamento quando quiser.'}
                </p>
                <div className="confirmation-ticket">
                  <span className="receipt-meta">{registration.id}</span>
                  <h3>{event.name}</h3>
                  <div>
                    <span>{dateLabel(event.date)}</span>
                    <span>
                      {event.city}, {event.state}
                    </span>
                  </div>
                  <hr className="divider" />
                  <div>
                    <span>Atleta</span>
                    <strong>{registration.name}</strong>
                  </div>
                  <div>
                    <span>Distância / categoria</span>
                    <strong>
                      {registration.distance} · {registration.category}
                    </strong>
                  </div>
                  <div>
                    <span>Kit / camiseta</span>
                    <strong>
                      {registration.kit} · {registration.shirt}
                    </strong>
                  </div>
                  <div>
                    <span>Total {registration.status === 'Confirmada' ? 'pago' : 'a pagar'}</span>
                    <strong>{money(registration.amount)}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button
                    className="button button-outline"
                    onClick={() => downloadReceipt(registration, event)}
                  >
                    <Download size={16} />
                    Baixar comprovante
                  </button>
                  <Link href="/atleta/" className="button button-primary">
                    Ir para minha área
                    <ArrowRight size={16} />
                  </Link>
                </div>
                {registration.status === 'Pendente' && (
                  <button className="text-link spaced" onClick={() => setStep(2)}>
                    Concluir pagamento agora
                    <ArrowRight size={14} />
                  </button>
                )}
                <div className="info-message spaced">
                  <ShieldCheck size={18} />
                  Este comprovante é demonstrativo, sem validade para eventos reais. Nenhuma
                  cobrança foi realizada.
                </div>
              </Panel>
            )}
          </section>
          <aside className="checkout-summary">
            <Panel>
              <div className="summary-event">
                <img src={asset(event.image)} alt="" />
                <span>
                  <small>SUA PRÓXIMA LARGADA</small>
                  <strong>{event.name}</strong>
                  <span>
                    {dateLabel(event.date)} · {event.city}
                  </span>
                </span>
              </div>
              <hr className="divider" />
              <div className="summary-distance">
                <Ticket size={18} />
                <strong>{selected.name}</strong>
                <span>{category.startsWith('Preencha') ? 'Categoria a definir' : category}</span>
              </div>
              <hr className="divider" />
              <div className="detail-list">
                <div>
                  <span>Inscrição</span>
                  <strong>{money(selected.price)}</strong>
                </div>
                <div>
                  <span>Kit {kit}</span>
                  <strong>{extra ? `+ ${money(extra)}` : 'Incluso'}</strong>
                </div>
                {discount > 0 && (
                  <div>
                    <span>Desconto</span>
                    <strong className="coupon-applied">− {money(discount)}</strong>
                  </div>
                )}
                <div>
                  <span>Taxa de serviço ({event.serviceFee}%)</span>
                  <strong>
                    {event.feePayer === 'atleta' ? money(fee) : 'Paga pelo organizador'}
                  </strong>
                </div>
                <div className="total">
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>
              <p className="summary-safe">
                <ShieldCheck size={16} />
                Seus dados ficam apenas neste navegador.
              </p>
            </Panel>
          </aside>
        </div>
      </main>
      <Footer />
      {rules && (
        <Modal title="Regulamento e responsabilidade" onClose={() => setRules(false)}>
          <p className="section-description">
            Esta é uma inscrição fictícia, para demonstração do CorridaAqui. Você declara estar
            ciente dos cuidados de saúde necessários à prática esportiva, das condições de retirada
            do kit e das orientações da organização. Categorias são calculadas pela idade na data da
            prova. Menores de 18 anos precisam de autorização do responsável. Nenhuma cobrança ou
            envio de dados é realizado por este MVP.
          </p>
          <button
            className="button button-primary full-width"
            onClick={() => {
              setAccepted(true);
              setRules(false);
            }}
          >
            Li e aceito
          </button>
        </Modal>
      )}
    </>
  );
}
function SlidersIcon() {
  return <ShieldCheck size={13} />;
}
function ClockIcon() {
  return <AlertCircle size={42} />;
}
