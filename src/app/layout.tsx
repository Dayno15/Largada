import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppProvider } from '@/components/provider';
import './globals.css';
import './experience.css';
import './typography.css';

const manrope = localFont({
  src: [
    { path: '../fonts/manrope-400.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/manrope-500.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/manrope-600.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/manrope-700.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/manrope-800.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
});
export const metadata: Metadata = {
  title: { default: 'CorridaAqui — Seu próximo ponto de partida', template: '%s | CorridaAqui' },
  description:
    'Encontre seu próximo desafio. Eventos esportivos, inscrições e gestão em uma plataforma. MVP demonstrativo, sem cobranças reais.',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg` },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={manrope.variable}>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <AppProvider>
          <div id="conteudo">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
}
