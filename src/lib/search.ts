// Termo de busca do catálogo, compartilhado entre a busca do cabeçalho e o catálogo.
// Na primeira leitura, aceita ?busca= na URL (ex.: link compartilhado).
let term: string | null = null;
const listeners = new Set<() => void>();

export function getSearch() {
  if (term === null) term = new URLSearchParams(window.location.search).get('busca') ?? '';
  return term;
}
export function setSearch(value: string) {
  term = value;
  listeners.forEach((l) => l());
}
export function subscribeSearch(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
