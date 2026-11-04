export const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dateLabel = (v: string, options?: Intl.DateTimeFormatOptions) =>
  new Date(`${v.slice(0, 10)}T12:00:00`).toLocaleDateString(
    'pt-BR',
    options || { day: '2-digit', month: 'short', year: 'numeric' },
  );
export const shortDate = (v: string) =>
  dateLabel(v, { day: '2-digit', month: '2-digit', year: 'numeric' });
export const asset = (path: string) =>
  /^(data:|https?:)/.test(path) ? path : `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
export const clean = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
// Also works for a phone opening the demo over plain HTTP on a local network.
export const uid = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8) || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)}`;
export const states = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];
export function validCPF(input: string) {
  const cpf = input.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += Number(cpf[i]) * (t + 1 - i);
    const digit = ((sum * 10) % 11) % 10;
    if (digit !== Number(cpf[t])) return false;
  }
  return true;
}
export function ageAt(birth: string, eventDate: string) {
  const b = new Date(birth + 'T12:00:00'),
    e = new Date(eventDate + 'T12:00:00');
  let age = e.getFullYear() - b.getFullYear();
  if (e.getMonth() < b.getMonth() || (e.getMonth() === b.getMonth() && e.getDate() < b.getDate()))
    age--;
  return age;
}
export function categoryFor(birth: string, sex: string, eventDate: string) {
  const age = ageAt(birth, eventDate);
  const band =
    age < 20
      ? '16–19 anos'
      : age >= 60
        ? '60+ anos'
        : `${Math.floor(age / 10) * 10}–${Math.floor(age / 10) * 10 + 9} anos`;
  return `${sex === 'F' ? 'Feminino' : sex === 'M' ? 'Masculino' : 'Aberta'} · ${band}`;
}
export const financials = (rows: { amount: number; fee: number; status: string }[]) => {
  const paid = rows.filter((r) => r.status === 'Confirmada');
  const gross = paid.reduce((s, r) => s + r.amount, 0);
  const fees = paid.reduce((s, r) => s + r.fee, 0);
  return {
    gross,
    fees,
    net: gross - fees,
    pending: rows.filter((r) => r.status === 'Pendente').reduce((s, r) => s + r.amount, 0),
    count: paid.length,
  };
};
