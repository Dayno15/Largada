import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="container standalone">
      <div className="empty-state">
        <span className="eyebrow">404 · UM DESVIO NO PERCURSO</span>
        <h1>Vamos voltar para a pista?</h1>
        <p>A página que você procura não está por aqui.</p>
        <Link href="/" className="button button-primary">
          Explorar eventos
        </Link>
      </div>
    </main>
  );
}
