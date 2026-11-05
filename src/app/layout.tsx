import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Lora } from 'next/font/google';
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
const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  weight: ['400', '600', '700'],
});
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'CorridaAqui · Eventos esportivos', template: '%s | CorridaAqui' },
  description: 'Calendário de eventos esportivos com inscrição online e painel para organizadores.',
  icons: { icon: `${base}/icon.svg`, apple: `${base}/icon.svg` },
  manifest: `${base}/manifest.json`,
  appleWebApp: { capable: true, title: 'CorridaAqui' },
  openGraph: {
    title: 'CorridaAqui · Eventos esportivos',
    description:
      'Calendário de eventos esportivos com inscrição online e painel para organizadores.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'CorridaAqui',
    images: [{ url: `${base}/images/running.jpg`, width: 1200, height: 630, alt: 'CorridaAqui' }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      data-accent="blue"
      suppressHydrationWarning
      className={`${manrope.variable} ${lora.variable}`}
    >
      <body suppressHydrationWarning>
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
