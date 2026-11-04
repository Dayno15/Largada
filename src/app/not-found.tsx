'use client';
import Link from 'next/link';
import { Header, Footer } from '@/components/navigation';
export default function NotFound() {
  return (
    <>
      <Header />
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
      <Footer />
    </>
  );
}
