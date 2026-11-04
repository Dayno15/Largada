'use client';
import { useState } from 'react';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { exportRegistrations, financeHeaders, participantHeaders } from '@/lib/export';
import { Field, Modal } from './ui';
import { useApp } from './provider';

export function ExportModal({
  rows,
  eventName,
  onClose,
  initial = 'inscritos',
}: {
  rows: Registration[];
  eventName?: string;
  onClose: () => void;
  initial?: 'inscritos' | 'financeiro';
}) {
  const { toast } = useApp();
  const [kind, setKind] = useState(initial),
    [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx'),
    [scope, setScope] = useState('all'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const filtered = scope === 'confirmed' ? rows.filter((r) => r.status === 'Confirmada') : rows;
  async function download() {
    setBusy(true);
    setError('');
    try {
      await exportRegistrations(filtered, kind, format, eventName);
      toast(`${filtered.length} registros fictícios exportados com sucesso.`);
      onClose();
    } catch {
      setError('Não foi possível gerar o arquivo. Tente novamente ou escolha CSV.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Exportar dados do evento" onClose={onClose}>
      <p className="section-description">
        A exportação usa os filtros da tela e as colunas dos modelos fornecidos. Os dados são
        exclusivamente fictícios.
      </p>
      <div className="export-options">
        <label className={`option-card ${kind === 'inscritos' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="export-kind"
            checked={kind === 'inscritos'}
            onChange={() => setKind('inscritos')}
          />
          <FileSpreadsheet size={25} />
          <span>
            <strong>Lista de inscritos</strong>
            <small>20 colunas · Atleta, categoria, equipe, documento e kit</small>
          </span>
        </label>
        <label className={`option-card ${kind === 'financeiro' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="export-kind"
            checked={kind === 'financeiro'}
            onChange={() => setKind('financeiro')}
          />
          <FileSpreadsheet size={25} />
          <span>
            <strong>Relatório financeiro</strong>
            <small>8 colunas · Status, valor líquido, cupom e pagamento</small>
          </span>
        </label>
      </div>
      <div className="form-grid spaced">
        <Field label="Formato do arquivo">
          <select value={format} onChange={(e) => setFormat(e.target.value as 'xlsx' | 'csv')}>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv) · separador ponto e vírgula</option>
          </select>
        </Field>
        <Field label="Quais inscrições?">
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">Todas as inscrições filtradas</option>
            <option value="confirmed">Somente confirmadas</option>
          </select>
        </Field>
      </div>
      <details className="export-columns">
        <summary>Conferir colunas do arquivo</summary>
        <p>{(kind === 'inscritos' ? participantHeaders : financeHeaders).join(' · ')}</p>
      </details>
      <div className="info-message spaced">
        <Info size={17} />
        <span>
          <strong>{filtered.length} registros</strong> serão exportados.
          {kind === 'inscritos' &&
            ' Campos de chip e tempos permanecem vazios: cronometragem está fora do escopo.'}
        </span>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      <div className="modal-actions">
        <button className="button button-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          disabled={busy || !filtered.length}
          className="button button-primary"
          onClick={download}
        >
          {busy ? <span className="spinner" /> : <Download size={16} />}{' '}
          {busy ? 'Gerando arquivo...' : 'Baixar arquivo'}
        </button>
      </div>
    </Modal>
  );
}
