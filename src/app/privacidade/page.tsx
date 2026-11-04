import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/navigation';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a CorridaAqui coleta, usa e protege seus dados pessoais.',
};

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="container standalone">
        <div style={{ maxWidth: 740 }}>
          <span className="eyebrow">LEGAL</span>
          <h1 style={{ marginBottom: 8 }}>Política de Privacidade</h1>
          <p className="muted" style={{ marginBottom: 40, fontSize: 13 }}>
            Última atualização: novembro de 2026 · Versão provisória de demonstração
          </p>

          <div className="section-description">
            <p>
              A CorridaAqui respeita a sua privacidade e está comprometida com a proteção dos
              seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD —
              Lei nº 13.709/2018).
            </p>
          </div>

          <div className="form-section">
            <h3>1. Dados coletados</h3>
            <p className="section-description">
              Coletamos os seguintes dados para prestação dos nossos serviços:
            </p>
            <ul className="section-description" style={{ paddingLeft: 20 }}>
              <li>Dados de identificação: nome completo, CPF, data de nascimento e sexo.</li>
              <li>Dados de contato: e-mail, telefone e endereço.</li>
              <li>Dados de saúde limitados: informações de emergência fornecidas voluntariamente.</li>
              <li>Dados de pagamento: processados por gateways seguros; não armazenamos dados de cartão.</li>
              <li>Dados de navegação: cookies e logs de acesso para melhoria da plataforma.</li>
            </ul>
          </div>

          <div className="form-section">
            <h3>2. Como utilizamos seus dados</h3>
            <p className="section-description">
              Seus dados são utilizados para: processar inscrições e pagamentos; enviar
              comprovantes e comunicações relacionadas ao evento; cumprir obrigações legais
              e contratuais; melhorar a experiência na plataforma; e, com seu consentimento,
              enviar comunicações de marketing.
            </p>
          </div>

          <div className="form-section">
            <h3>3. Compartilhamento de dados</h3>
            <p className="section-description">
              Seus dados poderão ser compartilhados com os organizadores dos eventos nos quais
              você se inscrever, estritamente para fins de gestão da prova. Não vendemos nem
              cedemos seus dados a terceiros para fins comerciais.
            </p>
          </div>

          <div className="form-section">
            <h3>4. Cookies</h3>
            <p className="section-description">
              Utilizamos cookies essenciais para o funcionamento da plataforma e cookies
              analíticos para entender como os usuários interagem com o site. Você pode
              gerenciar as preferências de cookies nas configurações do seu navegador.
            </p>
          </div>

          <div className="form-section">
            <h3>5. Seus direitos (LGPD)</h3>
            <p className="section-description">
              Nos termos da LGPD, você tem direito a: confirmar a existência de tratamento
              dos seus dados; acessar seus dados; corrigir dados incompletos ou inexatos;
              solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;
              revogar o consentimento; e opor-se ao tratamento em caso de descumprimento.
              Para exercer seus direitos, entre em contato pelo e-mail{' '}
              <a href="mailto:privacidade@corridaqui.demo" style={{ color: 'var(--brand-ink)' }}>
                privacidade@corridaqui.demo
              </a>
              .
            </p>
          </div>

          <div className="form-section">
            <h3>6. Retenção de dados</h3>
            <p className="section-description">
              Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas
              nesta política ou conforme exigido por lei. Dados de inscrições são mantidos por
              até 5 anos para fins fiscais e legais.
            </p>
          </div>

          <div className="form-section">
            <h3>7. Segurança</h3>
            <p className="section-description">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
              contra acesso não autorizado, alteração, divulgação ou destruição, incluindo
              criptografia em trânsito e em repouso.
            </p>
          </div>

          <div className="form-section">
            <h3>8. Contato</h3>
            <p className="section-description">
              Nosso Encarregado de Proteção de Dados (DPO) pode ser contactado pelo e-mail{' '}
              <a href="mailto:privacidade@corridaqui.demo" style={{ color: 'var(--brand-ink)' }}>
                privacidade@corridaqui.demo
              </a>
              .
            </p>
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link href="/termos/" className="text-link">
              Ver Termos de Uso
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
