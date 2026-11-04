'use client';
import { useState, type FormEvent } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  Download,
  Info,
  Landmark,
  Plus,
  Wallet,
} from 'lucide-react';
import { useApp } from './provider';
import { Badge, EmptyState, Field, Modal, Panel, Stat } from './ui';
import { ExportModal } from './exports';
import type { RaceEvent } from '@/lib/types';
import { financials, money, shortDate, uid } from '@/lib/utils';

export function Finance({
  events,
  transfersOnly = false,
}: {
  events: RaceEvent[];
  transfersOnly?: boolean;
}) {
  const { db, session, update, toast } = useApp();
  const [selected, setSelected] = useState(''),
    [exporting, setExporting] = useState(false),
    [creating, setCreating] = useState(false),
    [amount, setAmount] = useState(''),
    [transferEvent, setTransferEvent] = useState(events[0]?.id || ''),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [error, setError] = useState('');
  const isAdmin = session?.role === 'admin';
  const visible = events.filter((e) => !selected || e.id === selected);
  const ids = visible.map((e) => e.id);
  const rows = db.registrations.filter((r) => ids.includes(r.eventId));
  const totals = financials(rows),
    transfers = db.transfers.filter((t) => ids.includes(t.eventId));
  const sent = transfers.filter((t) => t.status === 'Recebido').reduce((s, t) => s + t.amount, 0),
    scheduled = transfers
      .filter((t) => t.status === 'Programado')
      .reduce((s, t) => s + t.amount, 0);
  const balance = Math.max(0, totals.net - sent - scheduled);
  const eventBalance = (id: string) =>
    Math.max(
      0,
      financials(db.registrations.filter((r) => r.eventId === id)).net -
        db.transfers.filter((t) => t.eventId === id).reduce((s, t) => s + t.amount, 0),
    );
  function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!transferEvent || value <= 0 || value > eventBalance(transferEvent)) {
      setError('Informe um valor positivo, dentro do saldo disponível para este evento.');
      return;
    }
    update(
      (d) => ({
        ...d,
        transfers: [
          {
            id: uid('REP'),
            eventId: transferEvent,
            amount: value,
            date,
            status: 'Programado',
            bank: 'Banco demonstrativo · Conta •••• 4821',
          },
          ...d.transfers,
        ],
      }),
      `Repasse de ${money(value)} programado · ${events.find((e) => e.id === transferEvent)?.name}`,
    );
    setCreating(false);
    setAmount('');
    toast(
      isAdmin ? 'Repasse simulado agendado.' : 'Solicitação de recebimento registrada na demo.',
    );
  }
  return (
    <>
      <div className="toolbar finance-toolbar">
        <span className="filter-label">Visão financeira</span>
        <select
          aria-label="Selecionar evento financeiro"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Todos os eventos</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <span className="toolbar-spacer" />
        <button className="button button-outline" onClick={() => setExporting(true)}>
          <Download size={15} />
          Exportar financeiro
        </button>
      </div>
      <div className="stat-grid">
        <Stat
          label="Receita bruta confirmada"
          value={money(totals.gross)}
          detail={`${totals.count} pagamentos aprovados`}
          icon={CircleDollarSign}
        />
        <Stat
          label="Taxas da plataforma"
          value={money(totals.fees)}
          detail="Somente pagamentos confirmados"
          icon={Banknote}
        />
        <Stat
          label="Receita líquida"
          value={money(totals.net)}
          detail="Bruto menos taxas de serviço"
          icon={Wallet}
        />
        <Stat
          label="Pendente de pagamento"
          value={money(totals.pending)}
          detail="Não compõe o saldo para repasse"
          icon={Landmark}
        />
      </div>
      {!transfersOnly && (
        <div className="two-col finance-breakdown">
          <Panel
            title="Receita por evento"
            description="Valores de inscrições com pagamento confirmado."
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Bruto</th>
                    <th>Taxas</th>
                    <th>Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((event) => {
                    const f = financials(rows.filter((r) => r.eventId === event.id));
                    return (
                      <tr key={event.id}>
                        <td>
                          <strong>{event.name}</strong>
                          <small>{f.count} confirmadas</small>
                        </td>
                        <td>{money(f.gross)}</td>
                        <td>{money(f.fees)}</td>
                        <td>
                          <strong>{money(f.net)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Como os atletas pagam" description="Distribuição dos pagamentos aprovados.">
            {(['PIX', 'Cartão', 'Boleto'] as const).map((method) => {
              const count = rows.filter(
                (r) => r.status === 'Confirmada' && r.method === method,
              ).length;
              const percent = totals.count ? Math.round((count / totals.count) * 100) : 0;
              return (
                <div className="method-row" key={method}>
                  <div>
                    <span>{method}</span>
                    <strong>
                      {percent}% <small>· {count} pagamentos</small>
                    </strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="finance-mini-balance">
              <span>Disponível para {isAdmin ? 'repasse' : 'receber'}</span>
              <strong>{money(balance)}</strong>
              <small>Já descontados os repasses recebidos e programados.</small>
            </div>
          </Panel>
        </div>
      )}
      <Panel
        title={isAdmin ? 'Repasses aos organizadores' : 'Meus recebimentos'}
        description="Movimentações fictícias, sem conexão com bancos ou gateway."
        action={
          <button
            className="button button-primary button-small"
            disabled={!events.length}
            onClick={() => setCreating(true)}
          >
            <Plus size={14} />
            {isAdmin ? 'Programar repasse' : 'Solicitar recebimento'}
          </button>
        }
      >
        <div className="transfer-summary">
          <div>
            <ArrowDownLeft size={18} />
            <span>
              Já recebido<strong>{money(sent)}</strong>
            </span>
          </div>
          <div>
            <ArrowUpRight size={18} />
            <span>
              Programado<strong>{money(scheduled)}</strong>
            </span>
          </div>
          <div>
            <Wallet size={18} />
            <span>
              Disponível<strong>{money(balance)}</strong>
            </span>
          </div>
        </div>
        {transfers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Repasse / evento</th>
                  <th>Conta de destino</th>
                  <th>Data prevista</th>
                  <th>Valor</th>
                  <th>Situação</th>
                  {isAdmin && <th>Ação</th>}
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{events.find((e) => e.id === t.eventId)?.name}</strong>
                      <small>{t.id}</small>
                    </td>
                    <td>{t.bank}</td>
                    <td>{shortDate(t.date)}</td>
                    <td>
                      <strong>{money(t.amount)}</strong>
                    </td>
                    <td>
                      <Badge>{t.status}</Badge>
                    </td>
                    {isAdmin && (
                      <td>
                        {t.status === 'Programado' ? (
                          <button
                            className="text-link"
                            onClick={() => {
                              update(
                                (d) => ({
                                  ...d,
                                  transfers: d.transfers.map((x) =>
                                    x.id === t.id ? { ...x, status: 'Recebido' } : x,
                                  ),
                                }),
                                `Repasse ${t.id} marcado como recebido (simulação)`,
                              );
                              toast('Recebimento confirmado apenas na demonstração.');
                            }}
                          >
                            Simular recebimento
                            <ArrowDownLeft size={14} />
                          </button>
                        ) : (
                          <span className="muted">Concluído</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nenhum recebimento por aqui"
            text="Os repasses programados e concluídos aparecerão nesta área."
          />
        )}
      </Panel>
      <div className="info-message spaced">
        <Info size={17} />O saldo considera apenas inscrições confirmadas. Não há liquidação,
        transferência bancária ou cobrança real. Cancelar uma inscrição retira sua receita dos
        totais, mas não reverte repasses já simulados.
      </div>
      {exporting && (
        <ExportModal
          initial="financeiro"
          rows={rows}
          eventName={events.find((e) => e.id === selected)?.name}
          onClose={() => setExporting(false)}
        />
      )}{' '}
      {creating && (
        <Modal
          title={
            isAdmin ? 'Programar repasse demonstrativo' : 'Solicitar recebimento demonstrativo'
          }
          onClose={() => setCreating(false)}
        >
          <form onSubmit={create}>
            <div className="form-grid">
              <Field label="Evento" full>
                <select
                  value={transferEvent}
                  onChange={(e) => setTransferEvent(e.target.value)}
                  required
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Valor (R$)" hint={`Disponível: ${money(eventBalance(transferEvent))}`}>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={eventBalance(transferEvent)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>
              <Field label="Data prevista">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </Field>
            </div>
            <div className="info-message spaced">
              <Info size={17} />
              Conta bancária fictícia. Este agendamento não movimenta dinheiro.
            </div>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
              <button className="button button-primary" type="submit">
                Confirmar simulação
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
