'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Building2,
  Fingerprint,
} from 'lucide-react';
import { Brand, ThemeToggle } from './navigation';
import { DemoNotice, useApp } from './provider';
import { Field } from './ui';
import { asset, validCPF } from '@/lib/utils';
import type { Role } from '@/lib/types';
import { demoProfile } from '@/lib/data';

const accounts = {
  atleta: {
    email: 'atleta@corridaqui.demo',
    name: 'Marina Oliveira',
    label: 'Atleta',
    icon: UserRound,
  },
  organizador: {
    email: 'organizador@corridaqui.demo',
    name: 'João Mendes',
    label: 'Organizador',
    icon: Building2,
  },
  admin: {
    email: 'admin@corridaqui.demo',
    name: 'Administração',
    label: 'Administrador',
    icon: ShieldCheck,
  },
};
export default function Login() {
  const params = useSearchParams(),
    router = useRouter();
  const requested = params.get('perfil');
  const [role, setRole] = useState<Role>(
    requested === 'admin' ? 'admin' : requested === 'organizador' ? 'organizador' : 'atleta',
  );
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [show, setShow] = useState(false),
    [error, setError] = useState(''),
    [mode, setMode] = useState('email'),
    [cpf, setCpf] = useState(''),
    [code, setCode] = useState(''),
    [sent, setSent] = useState(false),
    [signup, setSignup] = useState(false),
    [name, setName] = useState(''),
    [accepted, setAccepted] = useState(false);
  const { login, db, update, toast } = useApp();
  function changeRole(r: Role) {
    setRole(r);
    setEmail('');
    setPassword('');
    setError('');
    setSignup(false);
    setMode('email');
    setSent(false);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (signup) {
      if (!validCPF(cpf)) {
        setError('Informe um CPF válido. Use apenas dados fictícios nesta demonstração.');
        return;
      }
      if (!accepted) {
        setError('Aceite os termos para continuar.');
        return;
      }
      const profile = {
        ...db.profile,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        cpf: cpf.replace(/\D/g, ''),
      };
      update((d) => ({ ...d, profile }), 'Perfil demonstrativo de atleta criado');
      login({ role: 'atleta', name: profile.name, email: profile.email, cpf: profile.cpf });
      router.push('/atleta/');
      toast('Perfil criado localmente. A senha desta demo é demo123.');
      return;
    }
    if (mode === 'cpf') {
      if (!validCPF(cpf)) {
        setError('Confira o CPF informado. Para testar, use 529.982.247-25.');
        return;
      }
      const found = db.registrations.find((r) => r.cpf === cpf.replace(/\D/g, ''));
      if (!found && db.profile.cpf !== cpf.replace(/\D/g, '')) {
        setError(
          'Nenhuma inscrição local para este CPF. Use o perfil de demonstração ou faça uma inscrição.',
        );
        return;
      }
      if (!sent) {
        setSent(true);
        toast('Código simulado: 123456. Nenhum e-mail foi enviado.');
        return;
      }
      if (code !== '123456') {
        setError('Código incorreto. O código desta demonstração é 123456.');
        return;
      }
      const athlete = db.profile.cpf === cpf.replace(/\D/g, '') ? db.profile : found!;
      login({ role: 'atleta', name: athlete.name, email: athlete.email, cpf: athlete.cpf });
      router.push('/atleta/');
      return;
    }
    const normalized = email.trim().toLowerCase();
    const athleteProfile = normalized === db.profile.email ? db.profile : demoProfile;
    if (
      password !== 'demo123' ||
      (normalized !== accounts[role].email &&
        !(role === 'atleta' && normalized === db.profile.email))
    ) {
      setError('Acesso não reconhecido. Use a conta de demonstração abaixo e a senha demo123.');
      return;
    }
    login({
      role,
      name: role === 'atleta' ? athleteProfile.name : accounts[role].name,
      email: normalized,
      ...(role === 'atleta'
        ? { cpf: athleteProfile.cpf }
        : role === 'organizador'
          ? { organizerId: 'org-1' }
          : {}),
    });
    const next = params.get('voltar');
    router.push(next && next.startsWith('/inscricao/') ? next : `/${role}/`);
  }
  function fill() {
    setEmail(accounts[role].email);
    setPassword('demo123');
    setCpf('529.982.247-25');
    setName('Marina Oliveira');
    setError('');
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="login-back">
          <ArrowLeft size={15} />
          Voltar aos eventos
        </Link>
        <img src={asset('/images/city-run.jpg')} alt="Atletas em uma corrida de rua" />
        <div className="login-story-shade" />
        <div className="login-story-copy">
          <span className="hero-eyebrow">SEU PRÓXIMO PONTO DE PARTIDA</span>
          <h1>
            Uma conta.
            <br />
            Muitos caminhos
            <br />
            pela frente.
          </h1>
          <p>
            Para quem corre, para quem organiza
            <br />e para quem faz tudo acontecer.
          </p>
          <span className="login-story-bottom">
            <RouteMark />O movimento começa com você.
          </span>
        </div>
      </section>
      <section className="login-form-side">
        <div className="login-top">
          <Brand />
          <ThemeToggle />
        </div>
        <div className="login-form-wrap">
          <span className="eyebrow">BOM TER VOCÊ AQUI</span>
          <h2>{signup ? 'Seu primeiro passo.' : 'Vamos continuar?'}</h2>
          <p>
            {signup
              ? 'Crie um perfil local para testar sua experiência.'
              : 'Acesse seu espaço e prepare o próximo passo.'}
          </p>
          <div className="login-role-tabs" role="tablist" aria-label="Tipo de acesso">
            {(Object.keys(accounts) as Role[]).map((r) => {
              const Icon = accounts[r].icon;
              return (
                <button
                  key={r}
                  role="tab"
                  aria-selected={role === r}
                  className={role === r ? 'active' : ''}
                  onClick={() => changeRole(r)}
                >
                  <Icon size={16} />
                  {accounts[r].label}
                </button>
              );
            })}
          </div>
          {role === 'atleta' && !signup && (
            <div className="login-method">
              <button
                className={mode === 'email' ? 'active' : ''}
                onClick={() => {
                  setMode('email');
                  setError('');
                }}
              >
                E-mail e senha
              </button>
              <button
                className={mode === 'cpf' ? 'active' : ''}
                onClick={() => {
                  setMode('cpf');
                  setError('');
                }}
              >
                <Fingerprint size={14} />
                Consultar por CPF
              </button>
            </div>
          )}
          <form onSubmit={submit} className="login-form">
            {signup && (
              <Field label="Nome completo">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Como podemos chamar você?"
                />
              </Field>
            )}
            {mode === 'cpf' || signup ? (
              <>
                <Field label="CPF">
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                    inputMode="numeric"
                    maxLength={14}
                  />
                </Field>
                {sent && (
                  <>
                    <div className="info-message">
                      <ShieldCheck size={17} />
                      <span>
                        Nenhum e-mail é enviado nesta demo.
                        <br />
                        Seu código de acesso é <strong>123456</strong>.
                      </span>
                    </div>
                    <Field label="Código de acesso">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        autoComplete="one-time-code"
                      />
                    </Field>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => toast('Código demonstrativo: 123456. Nenhum envio real.')}
                    >
                      Reenviar código simulado
                    </button>
                  </>
                )}
              </>
            ) : null}
            {mode === 'email' && (
              <>
                <Field label="E-mail">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={accounts[role].email}
                    required
                    autoComplete="username"
                  />
                </Field>
                {!signup && (
                  <Field label="Senha">
                    <div className="password-input">
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {show ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                )}
              </>
            )}
            {signup && (
              <>
                <div className="info-message">
                  <LockKeyhole size={16} />
                  Para manter a demonstração simples, este perfil usará a senha demo123. Não informe
                  uma senha pessoal.
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    Entendo que os dados ficam somente neste navegador e que esta é uma
                    demonstração.
                  </span>
                </label>
              </>
            )}
            {error && (
              <div role="alert" className="error-message">
                {error}
              </div>
            )}
            <button className="button button-primary full-width" type="submit">
              {signup
                ? 'Criar perfil demonstrativo'
                : mode === 'cpf' && !sent
                  ? 'Gerar código demonstrativo'
                  : `Entrar como ${accounts[role].label.toLowerCase()}`}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-account">
            <div>
              <span className="demo-account-label">EXPLORE SEM COMPLICAÇÃO</span>
              <strong>Uma conta pronta para testar.</strong>
              <p>
                {mode === 'cpf'
                  ? 'CPF: 529.982.247-25 · Código: 123456'
                  : `${accounts[role].email} · Senha: demo123`}
              </p>
            </div>
            <button type="button" onClick={fill} className="button button-outline button-small">
              Preencher acesso
              <ArrowUpRightSmall />
            </button>
          </div>
          {role === 'atleta' && (
            <p className="signup-link">
              {signup ? 'Já tem um perfil?' : 'Ainda não tem um perfil?'}{' '}
              <button
                onClick={() => {
                  setSignup(!signup);
                  setMode('email');
                  setError('');
                }}
              >
                {signup ? 'Entrar na conta' : 'Criar conta'}
              </button>
            </p>
          )}
          <div className="login-security">
            <LockKeyhole size={13} />
            Login simulado no navegador. Não use credenciais reais.
          </div>
        </div>
        <DemoNotice />
      </section>
    </main>
  );
}
function RouteMark() {
  return <span className="route-mark">↗</span>;
}
function ArrowUpRightSmall() {
  return <ArrowRight size={13} />;
}
