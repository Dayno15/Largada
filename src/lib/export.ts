import type { Organizer, RaceEvent, Registration } from './types';
import { dateLabel, money, shortDate } from './utils';

export const participantHeaders = [
  'Número',
  'Nome completo',
  'Categoria',
  'Nasc.(dd/mm/aa)',
  'Sexo(M/F)',
  'Equipe',
  'Cidade',
  'Estado',
  'CPF',
  'Celular',
  'Chip',
  'Distância',
  'Nº Voltas',
  'Tempo Mínimo',
  'Tamanho',
  'Foto (URL)',
  'Troca de Titularidade',
  'Troca de Categoria',
  'Troca de Modalidade',
  'Parceiro dupla',
];
export const financeHeaders = [
  'Nome',
  'Status',
  'Pagou?',
  'Distância',
  'Cupom usado',
  'Valor Líquido',
  'Forma de Pagamento',
  'Data Pagamento',
];
export function exportRows(rows: Registration[], kind: 'inscritos' | 'financeiro') {
  if (kind === 'financeiro')
    return {
      headers: financeHeaders,
      rows: rows.map((r) => [
        r.name,
        r.status,
        r.status === 'Confirmada' ? 'Sim' : 'Não',
        r.distance,
        r.coupon,
        Math.round((r.amount - r.fee) * 100) / 100,
        r.method,
        r.paidAt ? shortDate(r.paidAt) : '',
      ]),
    };
  return {
    headers: participantHeaders,
    rows: rows.map((r) => [
      r.bib,
      r.name,
      r.category,
      r.birth ? dateLabel(r.birth, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '',
      r.sex,
      r.team,
      r.city,
      r.state,
      r.cpf,
      r.phone,
      '',
      r.distance,
      '',
      '',
      r.shirt,
      '',
      '',
      '',
      '',
      r.partner,
    ]),
  };
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function safeCell(v: unknown) {
  const value = String(v ?? '');
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}
export async function downloadSpreadsheet(
  headers: string[],
  rows: unknown[][],
  filename: string,
  format: 'xlsx' | 'csv',
  sheetName = 'Inscritos',
) {
  if (format === 'csv') {
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${safeCell(v).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');
    downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), filename + '.csv');
    return;
  }
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CorridaAqui · Demonstração';
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row.map((v) => (typeof v === 'number' ? v : safeCell(v)))));
  sheet.getRow(1).height = 28;
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF176C55' } };
    cell.alignment = { vertical: 'middle' };
  });
  sheet.columns.forEach((col, i) => {
    col.width = Math.max(16, Math.min(34, headers[i].length + 5));
  });
  sheet.eachRow((row, n) => {
    if (n > 1) {
      row.height = 23;
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle' };
        if (n % 2 === 0)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F6F1' } };
      });
    }
  });
  if (sheetName === 'Financeiro') {
    sheet.getColumn(6).numFmt = '"R$" #,##0.00';
  }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename + '.xlsx',
  );
}
export async function exportRegistrations(
  rows: Registration[],
  kind: 'inscritos' | 'financeiro',
  format: 'xlsx' | 'csv',
  eventName = 'todos-os-eventos',
) {
  const data = exportRows(rows, kind);
  const slug = eventName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  await downloadSpreadsheet(
    data.headers,
    data.rows,
    `${kind}_${slug}_${new Date().toISOString().slice(0, 10)}`,
    format,
    kind === 'financeiro' ? 'Financeiro' : 'Inscritos',
  );
}
export const exportOrganizers = (rows: Organizer[]) =>
  downloadSpreadsheet(
    ['Organização', 'Responsável', 'E-mail', 'Cidade', 'Status'],
    rows.map((o) => [o.name, o.contact, o.email, o.city, o.status]),
    'organizadores-demonstracao',
    'xlsx',
    'Organizadores',
  );
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]!,
  );
export function downloadReceipt(reg: Registration, event: RaceEvent) {
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Comprovante ${escape(reg.id)}</title><style>body{font:14px Arial,sans-serif;color:#24382c;margin:60px;line-height:1.8}main{max-width:650px;margin:auto;border:1px solid #dde3dc;padding:40px}h1{font-size:28px;color:#176c55}h2{font-size:22px}small{color:#758078}table{width:100%;border-collapse:collapse;margin:25px 0}td{padding:10px 0;border-bottom:1px solid #e7eae5}td:last-child{text-align:right;font-weight:600}.notice{background:#edf4ec;padding:15px;font-size:12px}</style><main><h1>corridaaqui.</h1><small>COMPROVANTE DE INSCRIÇÃO · ${escape(reg.id)}</small><h2>${escape(event.name)}</h2><p>${escape(event.city)}, ${escape(event.state)} · ${shortDate(event.date)} · ${event.time}</p><table>${[
    ['Atleta', reg.name],
    ['Documento', reg.cpf],
    ['Modalidade', reg.distance],
    ['Categoria', reg.category],
    ['Camiseta', reg.shirt],
    ['Kit', reg.kit],
    ['Situação', reg.status],
    ['Forma de pagamento', reg.method],
    ['Total', money(reg.amount)],
  ]
    .map(([a, b]) => `<tr><td>${escape(a)}</td><td>${escape(b)}</td></tr>`)
    .join(
      '',
    )}</table><p>Retirada do kit: ${escape(event.kitPickup)}</p><div class="notice">DEMONSTRAÇÃO — Este comprovante contém dados fictícios e não é válido para participação em eventos reais. Nenhuma cobrança foi realizada.</div></main></html>`;
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `comprovante-${reg.id}.html`);
}
