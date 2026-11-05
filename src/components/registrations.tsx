'use client';
import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, Info, Save, UserRoundCheck } from 'lucide-react';
import { useApp } from './provider';
import { Badge, EmptyState, Field, Modal, Panel, SearchBox } from './ui';
import { ExportModal } from './exports';
import type { RaceEvent, Registration } from '@/lib/types';
import { categoryFor, clean, money, shortDate } from '@/lib/utils';
import { features } from '@/lib/features';

export function Registrations({
  events,
  kits = false,
  payments = false,
}: {
  events: RaceEvent[];
  kits?: boolean;
  payments?: boolean;
}) {
  const { db, update, toast } = useApp();
  const [search, setSearch] = useState(''),
    [eventId, setEventId] = useState(''),
    [status, setStatus] = useState(''),
    [kitStatus, setKitStatus] = useState(''),
    [page, setPage] = useState(1),
    [exporting, setExporting] = useState(false),
    [detail, setDetail] = useState<Registration | null>(null);
  const ids = events.map((e) => e.id),
    pageSize = 10;
  const rows = db.registrations
    .filter(
      (r) =>
        ids.includes(r.eventId) &&
        (!eventId || r.eventId === eventId) &&
        (!status || r.status === status) &&
        (!kitStatus || (kitStatus === 'delivered' ? r.kitDelivered : !r.kitDelivered)) &&
        clean(`${r.name} ${r.cpf} ${r.id} ${r.bib} ${r.email} ${r.category}`).includes(
          clean(search),
        ),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize)),
    safePage = Math.min(page, totalPages);
  const visible = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  function deliver(r: Registration) {
    update(
      (d) => ({
        ...d,
        registrations: d.registrations.map((x) =>
          x.id === r.id ? { ...x, kitDelivered: !x.kitDelivered } : x,
        ),
      }),
      `Kit ${r.kitDelivered ? 'devolvido' : 'entregue'} · ${r.id}`,
    );
    toast(r.kitDelivered ? 'Entrega desfeita na demonstração.' : 'Entrega do kit registrada.');
  }
  return (
    <>
      <Panel
        title={
          kits ? 'Entrega de kits' : payments ? 'Transações e pagamentos' : 'Inscrições recebidas'
        }
        description={`${rows.length} registros · ${eventId ? events.find((e) => e.id === eventId)?.name : 'Todos os seus eventos'}`}
        action={
          <button className="button button-outline button-small" onClick={() => setExporting(true)}>
            <Download size={14} />
            Exportar
          </button>
        }
      >
        <div className="toolbar">
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={
              kits
                ? 'Buscar nome, CPF ou número de peito...'
                : 'Buscar nome, CPF, e-mail ou inscrição...'
            }
          />
          <select
            aria-label="Filtrar por evento"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os eventos</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {['Confirmada', 'Pendente', 'Cancelada'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {kits && (
            <select
              aria-label="Status do kit"
              value={kitStatus}
              onChange={(e) => {
                setKitStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os kits</option>
              <option value="delivered">Entregues</option>
              <option value="pending">A retirar</option>
            </select>
          )}
        </div>
        {visible.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{kits ? 'Número' : 'Inscrição / atleta'}</th>
                    {kits && <th>Atleta</th>}
                    <th>Evento / modalidade</th>
                    <th>{kits ? 'Kit / camiseta' : 'Valor / pagamento'}</th>
                    <th>{kits ? 'Entrega' : 'Status'}</th>
                    <th className="align-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {kits ? (
                          <strong>#{r.bib}</strong>
                        ) : (
                          <div className="cell-person">
                            <span className="avatar">
                              {r.name
                                .split(' ')
                                .slice(0, 2)
                                .map((s) => s[0])
                                .join('')}
                            </span>
                            <span>
                              <strong>{r.name}</strong>
                              <small>
                                {r.id} · {shortDate(r.createdAt)}
                              </small>
                            </span>
                          </div>
                        )}
                      </td>
                      {kits && (
                        <td>
                          <strong>{r.name}</strong>
                          <small>{r.category}</small>
                        </td>
                      )}
                      <td>
                        <strong>{events.find((e) => e.id === r.eventId)?.name}</strong>
                        <small>
                          {r.distance}
                          {!kits && ` · ${r.category}`}
                        </small>
                      </td>
                      <td>
                        <strong>{kits ? r.kit : money(r.amount)}</strong>
                        <small>
                          {kits
                            ? `Camiseta ${r.shirt}`
                            : `${r.method}${r.method === 'Cartão' ? ` · ${r.installments}x` : ''}`}
                        </small>
                      </td>
                      <td>
                        <Badge>
                          {kits ? (r.kitDelivered ? 'Recebido' : 'A retirar') : r.status}
                        </Badge>
                      </td>
                      <td className="align-right">
                        <div className="row-actions">
                          {kits && (
                            <button
                              disabled={r.status !== 'Confirmada'}
                              title={
                                r.status !== 'Confirmada'
                                  ? 'Confirme o pagamento antes de entregar o kit'
                                  : undefined
                              }
                              className="button button-outline button-small"
                              onClick={() => deliver(r)}
                            >
                              <UserRoundCheck size={14} />
                              {r.kitDelivered ? 'Desfazer' : 'Entregar'}
                            </button>
                          )}
                          <button
                            className="icon-button"
                            aria-label={`Detalhes de ${r.name}`}
                            onClick={() => setDetail(r)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Exibindo {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, rows.length)} de {rows.length} registros
              </span>
              <div>
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .map((n) => (
                    <button
                      key={n}
                      className={n === safePage ? 'active' : ''}
                      onClick={() => setPage(n)}
                      aria-label={`Página ${n}`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                  aria-label="Próxima página"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </Panel>
      {kits && (
        <div className="info-message spaced">
          <Info size={17} />A entrega é uma simulação local, liberada apenas para inscrições
          confirmadas. Não há integração com leitores, chips ou cronometragem.
        </div>
      )}
      {exporting && (
        <ExportModal
          rows={rows}
          eventName={events.find((e) => e.id === eventId)?.name}
          onClose={() => setExporting(false)}
          initial={payments ? 'financeiro' : 'inscritos'}
        />
      )}{' '}
      {detail && (
        <RegistrationEditor
          registration={db.registrations.find((r) => r.id === detail.id) || detail}
          event={events.find((e) => e.id === detail.eventId)!}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
export function RegistrationEditor({
  registration: r,
  event,
  onClose,
}: {
  registration: Registration;
  event: RaceEvent;
  onClose: () => void;
}) {
  const { db, update, toast } = useApp();
  const [status, setStatus] = useState(r.status),
    [distance, setDistance] = useState(r.distance),
    [bib, setBib] = useState(r.bib),
    [shirt, setShirt] = useState(r.shirt),
    [error, setError] = useState('');
  function save(e: FormEvent) {
    e.preventDefault();
    if (
      db.registrations.some(
        (x) =>
          x.id !== r.id && x.eventId === r.eventId && x.bib === bib && x.status !== 'Cancelada',
      )
    ) {
      setError('Este número de peito já está em uso neste evento.');
      return;
    }
    const modality = event.distances.find((d) => d.name === distance);
    if (
      status !== 'Cancelada' &&
      modality &&
      db.registrations.filter(
        (x) =>
          x.id !== r.id &&
          x.eventId === r.eventId &&
          x.distance === distance &&
          x.status !== 'Cancelada',
      ).length >= modality.capacity
    ) {
      setError('Esta modalidade já atingiu o limite de vagas.');
      return;
    }
    update(
      (d) => ({
        ...d,
        registrations: d.registrations.map((x) =>
          x.id === r.id
            ? {
                ...x,
                status,
                distance,
                bib,
                shirt,
                category: categoryFor(r.birth, r.sex, event.date),
                paidAt:
                  status === 'Confirmada' ? r.paidAt || new Date().toISOString().slice(0, 10) : '',
                kitDelivered: status === 'Confirmada' ? x.kitDelivered : false,
              }
            : x,
        ),
      }),
      `Inscrição ${r.id} atualizada · ${status} · ${distance} · dorsal ${bib}`,
    );
    toast('Inscrição atualizada. A alteração foi registrada no histórico.');
    onClose();
  }
  return (
    <Modal title={`Inscrição ${r.id}`} onClose={onClose} wide>
      <div className="registration-detail-top">
        <span className="avatar large">{r.name.slice(0, 1)}</span>
        <div>
          <h3>{r.name}</h3>
          <p>
            {event.name} · {r.distance}
          </p>
        </div>
        <Badge>{r.status}</Badge>
      </div>
      <dl className="info-grid">
        <div>
          <dt>E-mail</dt>
          <dd>{r.email}</dd>
        </div>
        <div>
          <dt>CPF demonstrativo</dt>
          <dd>{r.cpf}</dd>
        </div>
        <div>
          <dt>Nascimento</dt>
          <dd>{shortDate(r.birth)}</dd>
        </div>
        <div>
          <dt>Celular</dt>
          <dd>{r.phone}</dd>
        </div>
        <div>
          <dt>Cidade / equipe</dt>
          <dd>
            {r.city}, {r.state} · {r.team || 'Sem equipe'}
          </dd>
        </div>
        <div>
          <dt>Categoria</dt>
          <dd>{r.category}</dd>
        </div>
        <div>
          <dt>Pagamento</dt>
          <dd>
            {money(r.amount)} · {r.method}
          </dd>
        </div>
        <div>
          <dt>Valor líquido / taxa</dt>
          <dd>
            {money(r.amount - r.fee)} / {money(r.fee)}
          </dd>
        </div>
        <div>
          <dt>{features.partner ? 'Kit / parceiro(a)' : 'Kit'}</dt>
          <dd>{features.partner ? `${r.kit} · ${r.partner || 'Individual'}` : r.kit}</dd>
        </div>
        <div>
          <dt>Cupom</dt>
          <dd>{r.coupon || 'Não utilizado'}</dd>
        </div>
      </dl>
      {r.notes && <p className="section-description">Observações: {r.notes}</p>}
      <hr className="divider" />
      <form onSubmit={save}>
        <div className="form-grid">
          <Field label="Status da inscrição">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Registration['status'])}
            >
              {['Confirmada', 'Pendente', 'Cancelada'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Modalidade">
            <select value={distance} onChange={(e) => setDistance(e.target.value)}>
              {event.distances.map((d) => (
                <option key={d.name}>{d.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Número de peito">
            <input
              type="number"
              min="1"
              required
              value={bib}
              onChange={(e) => setBib(e.target.value)}
            />
          </Field>
          <Field label="Tamanho da camiseta">
            <select value={shirt} onChange={(e) => setShirt(e.target.value)}>
              {['PP', 'P', 'M', 'G', 'GG', 'XGG'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="info-message spaced">
          <Info size={17} />
          Esta ação altera apenas a demonstração. O valor original da inscrição é preservado.
          Cancelamentos não processam estornos reais.
        </div>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="button button-ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button button-primary" type="submit">
            <Save size={15} />
            Salvar alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}
