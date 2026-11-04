'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  MapPin,
  Plus,
  Save,
  Tag,
  Trash2,
} from 'lucide-react';
import { useApp } from './provider';
import { Badge, EmptyState, Field, Modal, Panel, SearchBox } from './ui';
import { EventEditor } from './event-editor';
import type { Coupon, RaceEvent } from '@/lib/types';
import { asset, clean, dateLabel, money, shortDate, uid } from '@/lib/utils';
import { exportOrganizers } from '@/lib/export';
import { AccentPicker } from './navigation';
import { createSeed } from '@/lib/data';

export function EventsManagement({
  events,
  createKey = 0,
}: {
  events: RaceEvent[];
  createKey?: number;
}) {
  const { db, update, toast } = useApp();
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [editing, setEditing] = useState<RaceEvent | 'new' | null>(createKey ? 'new' : null),
    [deleting, setDeleting] = useState<RaceEvent | null>(null);
  const filtered = events.filter(
    (e) => clean(`${e.name} ${e.city}`).includes(clean(search)) && (!status || e.status === status),
  );
  function remove() {
    if (!deleting) return;
    const has = db.registrations.some((r) => r.eventId === deleting.id);
    if (has) {
      toast('Eventos com inscrições não podem ser excluídos. Encerre as inscrições.');
      return;
    }
    update(
      (d) => ({
        ...d,
        events: d.events.filter((e) => e.id !== deleting.id),
        coupons: d.coupons.filter((c) => c.eventId !== deleting.id),
      }),
      `Rascunho ${deleting.name} removido`,
    );
    toast('Rascunho removido da demonstração.');
    setDeleting(null);
  }
  return (
    <>
      <Panel
        title="Seu calendário de eventos"
        description="Tudo o que você precisa, antes da largada."
        action={
          <button className="button button-primary button-small" onClick={() => setEditing('new')}>
            <Plus size={14} />
            Novo evento
          </button>
        }
      >
        <div className="toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar evento ou cidade..." />
          <select
            aria-label="Status dos eventos"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {['Rascunho', 'Inscrições abertas', 'Em breve', 'Encerrado'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="managed-events">
          {filtered.map((e) => {
            const count = db.registrations.filter(
              (r) => r.eventId === e.id && r.status !== 'Cancelada',
            ).length;
            return (
              <article className="managed-event" key={e.id}>
                <img src={e.image.startsWith('data:') ? e.image : asset(e.image)} alt="" />
                <div className="managed-event-info">
                  <Badge>{e.status}</Badge>
                  <h3>{e.name}</h3>
                  <p>
                    <CalendarDays size={13} />
                    {dateLabel(e.date)}
                    <span>·</span>
                    <MapPin size={13} />
                    {e.city}, {e.state}
                  </p>
                  <div className="managed-event-progress">
                    <div className="progress-track">
                      <span style={{ width: `${Math.min(100, (count / e.capacity) * 100)}%` }} />
                    </div>
                    <span>
                      {count} / {e.capacity} inscritos
                    </span>
                  </div>
                </div>
                <div className="managed-event-actions">
                  <button
                    className="button button-outline button-small"
                    onClick={() => setEditing(e)}
                  >
                    <Edit3 size={14} />
                    Editar evento
                  </button>
                  <div>
                    {e.status !== 'Rascunho' && (
                      <Link
                        href={`/evento/?id=${e.id}`}
                        className="icon-button"
                        aria-label={`Ver ${e.name}`}
                      >
                        <Eye size={16} />
                      </Link>
                    )}
                    <button
                      className="icon-button"
                      aria-label={`Duplicar ${e.name}`}
                      onClick={() => {
                        const copy = {
                          ...structuredClone(e),
                          id: uid('evento'),
                          name: e.name + ' · Cópia',
                          status: 'Rascunho' as const,
                          createdAt: new Date().toISOString().slice(0, 10),
                        };
                        update(
                          (d) => ({ ...d, events: [copy, ...d.events] }),
                          `Evento ${e.name} duplicado como rascunho`,
                        );
                        toast('Cópia criada como rascunho.');
                      }}
                    >
                      <Copy size={15} />
                    </button>
                    {!db.registrations.some((r) => r.eventId === e.id) && (
                      <button
                        className="icon-button text-danger"
                        aria-label={`Excluir ${e.name}`}
                        onClick={() => setDeleting(e)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <EmptyState
              action={
                <button className="button button-primary" onClick={() => setEditing('new')}>
                  Criar evento
                </button>
              }
            />
          )}
        </div>
      </Panel>
      {editing && (
        <EventEditor
          event={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}{' '}
      {deleting && (
        <Modal title="Excluir rascunho?" onClose={() => setDeleting(null)}>
          <p className="section-description">
            O evento <strong>{deleting.name}</strong> será removido apenas desta demonstração. Esta
            ação está disponível somente para eventos sem inscrições.
          </p>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={() => setDeleting(null)}>
              Voltar
            </button>
            <button className="button button-danger" onClick={remove}>
              <Trash2 size={15} />
              Excluir rascunho
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Coupons({ events }: { events: RaceEvent[] }) {
  const { db, update, toast } = useApp();
  const [open, setOpen] = useState(false),
    [error, setError] = useState('');
  const [draft, setDraft] = useState<Omit<Coupon, 'id' | 'used' | 'active'>>({
    eventId: events[0]?.id || '',
    code: '',
    type: 'percentual',
    value: 10,
    limit: 100,
    expires: '2027-01-01',
  });
  const coupons = db.coupons.filter((c) => events.some((e) => e.id === c.eventId));
  function save(e: FormEvent) {
    e.preventDefault();
    const code = draft.code.trim().toUpperCase();
    if (db.coupons.some((c) => c.code === code && c.eventId === draft.eventId)) {
      setError('Já existe um cupom com esse código neste evento.');
      return;
    }
    if (draft.type === 'percentual' && draft.value > 100) {
      setError('O desconto percentual não pode passar de 100%.');
      return;
    }
    update(
      (d) => ({
        ...d,
        coupons: [{ ...draft, code, id: uid('cupom'), used: 0, active: true }, ...d.coupons],
      }),
      `Cupom ${code} criado`,
    );
    setOpen(false);
    setDraft({ ...draft, code: '' });
    toast('Cupom criado e disponível no checkout demonstrativo.');
  }
  return (
    <>
      <Panel
        title="Cupons de desconto"
        description="Um incentivo a mais para o próximo passo."
        action={
          <button
            disabled={!events.length}
            className="button button-primary button-small"
            onClick={() => {
              setOpen(true);
              setError('');
            }}
          >
            <Plus size={14} />
            Criar cupom
          </button>
        }
      >
        {coupons.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cupom / evento</th>
                  <th>Desconto</th>
                  <th>Utilização</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="coupon-code">
                        <Tag size={13} />
                        {c.code}
                      </strong>
                      <small>{events.find((e) => e.id === c.eventId)?.name}</small>
                    </td>
                    <td>{c.type === 'percentual' ? `${c.value}%` : money(c.value)}</td>
                    <td>
                      {c.used} de {c.limit}
                    </td>
                    <td>{shortDate(c.expires)}</td>
                    <td>
                      <Badge>
                        {c.active && c.expires >= new Date().toISOString().slice(0, 10)
                          ? 'Ativo'
                          : 'Inativo'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => {
                          update(
                            (d) => ({
                              ...d,
                              coupons: d.coupons.map((x) =>
                                x.id === c.id ? { ...x, active: !x.active } : x,
                              ),
                            }),
                            `Cupom ${c.code} ${c.active ? 'desativado' : 'ativado'}`,
                          );
                          toast(c.active ? 'Cupom desativado.' : 'Cupom ativado.');
                        }}
                      >
                        {c.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Seu primeiro cupom começa aqui"
            text="Crie um código para os atletas usarem no pagamento."
          />
        )}
      </Panel>
      {open && (
        <Modal title="Criar cupom demonstrativo" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Evento" full>
                <select
                  value={draft.eventId}
                  onChange={(e) => setDraft({ ...draft, eventId: e.target.value })}
                  required
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Código do cupom" full>
                <input
                  value={draft.code}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                    })
                  }
                  placeholder="Ex.: PRIMEIROPASSO"
                  minLength={3}
                  maxLength={25}
                  required
                />
              </Field>
              <Field label="Tipo de desconto">
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon['type'] })}
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor fixo (R$)</option>
                </select>
              </Field>
              <Field label="Valor do desconto">
                <input
                  type="number"
                  value={draft.value}
                  onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
                  min="1"
                  max={draft.type === 'percentual' ? 100 : 1000}
                  required
                />
              </Field>
              <Field label="Limite de usos">
                <input
                  type="number"
                  value={draft.limit}
                  onChange={(e) => setDraft({ ...draft, limit: Number(e.target.value) })}
                  min="1"
                  required
                />
              </Field>
              <Field label="Válido até">
                <input
                  type="date"
                  value={draft.expires}
                  onChange={(e) => setDraft({ ...draft, expires: e.target.value })}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </Field>
            </div>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="button button-primary">
                <Tag size={15} />
                Criar cupom
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Organizers() {
  const { db, update, toast } = useApp();
  const [search, setSearch] = useState('');
  const rows = db.organizers.filter((o) => clean(o.name + ' ' + o.contact).includes(clean(search)));
  return (
    <Panel
      title="Organizadores da plataforma"
      description="Cadastros, aprovação e informações de contato."
      action={
        <button
          className="button button-outline button-small"
          onClick={async () => {
            try {
              await exportOrganizers(rows);
              toast('Organizadores fictícios exportados.');
            } catch {
              toast('Não foi possível exportar. Tente novamente.');
            }
          }}
        >
          <Download size={14} />
          Exportar Excel
        </button>
      }
    >
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar organização ou responsável..."
        />
      </div>
      <div className="organizer-grid">
        {rows.map((o) => (
          <div className="organizer-card" key={o.id}>
            <div className="organizer-card-top">
              <span className="avatar large">
                {o.name
                  .split(' ')
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <Badge>{o.status}</Badge>
            </div>
            <h3>{o.name}</h3>
            <p>{o.contact}</p>
            <span>{o.email}</span>
            <span>
              <MapPin size={12} />
              {o.city}
            </span>
            <div className="organizer-card-bottom">
              <span>
                <strong>{db.events.filter((e) => e.organizerId === o.id).length}</strong> eventos
              </span>
              {o.status === 'Pendente' ? (
                <button
                  className="button button-primary button-small"
                  onClick={() => {
                    update(
                      (d) => ({
                        ...d,
                        organizers: d.organizers.map((x) =>
                          x.id === o.id ? { ...x, status: 'Aprovado' } : x,
                        ),
                      }),
                      `Organizador ${o.name} aprovado`,
                    );
                    toast('Cadastro aprovado na demonstração.');
                  }}
                >
                  <Check size={14} />
                  Aprovar cadastro
                </button>
              ) : (
                <span className="text-link">
                  <CheckCircle2 size={14} />
                  Acesso liberado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {!rows.length && <EmptyState />}
    </Panel>
  );
}
export function ActivityLog() {
  const { db } = useApp();
  return (
    <Panel
      title="Histórico de atividades"
      description="Ações realizadas nesta demonstração. Registros locais, sem auditoria de produção."
    >
      <div className="activity-list">
        {db.activities.map((a) => (
          <div key={a.id}>
            <span className="activity-icon">
              <FileText size={15} />
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
    </Panel>
  );
}
export function Settings() {
  const { db, update, toast, reset, theme, toggleTheme } = useApp();
  const [draft, setDraft] = useState(db.settings),
    [confirm, setConfirm] = useState(false);
  return (
    <div className="section-stack">
      <Panel
        title="Identidade e aparência"
        description="Uma marca com a sua cara. A escolha vale em todas as áreas."
      >
        <div className="settings-row">
          <div>
            <h3>Tema da interface</h3>
            <p>Escolha entre os modos claro e escuro.</p>
          </div>
          <button className="button button-outline button-small" onClick={toggleTheme}>
            Usar tema {theme === 'light' ? 'escuro' : 'claro'}
          </button>
        </div>
        <div className="settings-row">
          <AccentPicker />
        </div>
      </Panel>
      <Panel
        title="Configurações gerais"
        description="Valores demonstrativos, armazenados somente no navegador."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update((d) => ({ ...d, settings: draft }), 'Configurações gerais atualizadas');
            toast('Preferências salvas localmente.');
          }}
        >
          <div className="form-grid">
            <Field label="E-mail de contato">
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Taxa padrão para novos eventos (%)">
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={draft.fee}
                onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })}
                required
              />
            </Field>
            <Field
              label="Identificação do PIX demonstrativo"
              hint="Não informe uma chave real. Nenhum pagamento é integrado."
              full
            >
              <input
                value={draft.pix}
                onChange={(e) => setDraft({ ...draft, pix: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              <Save size={15} />
              Salvar configurações
            </button>
          </div>
        </form>
      </Panel>
      <Panel
        title="Recomeçar a demonstração"
        description="Restaure os eventos, inscrições e financeiro fictícios do início."
      >
        <div className="settings-row">
          <div>
            <h3>Restaurar dados de exemplo</h3>
            <p>
              Remove apenas as alterações locais do CorridaAqui. Não afeta qualquer outro site ou
              sistema.
            </p>
          </div>
          <button className="button button-danger button-small" onClick={() => setConfirm(true)}>
            Restaurar demo
          </button>
        </div>
      </Panel>
      {confirm && (
        <Modal title="Restaurar dados demonstrativos?" onClose={() => setConfirm(false)}>
          <p className="section-description">
            As alterações feitas nesta demonstração serão substituídas pelos exemplos iniciais. As
            preferências de tema serão mantidas. Esta ação não acessa servidores ou outros sistemas.
          </p>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={() => setConfirm(false)}>
              Manter meus dados
            </button>
            <button
              className="button button-danger"
              onClick={() => {
                reset();
                setConfirm(false);
                setDraft(createSeed().settings);
              }}
            >
              Restaurar demonstração
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
