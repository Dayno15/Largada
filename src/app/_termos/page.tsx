import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/navigation';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso da plataforma CorridaAqui.',
};

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="container standalone">
        <div style={{ maxWidth: 740 }}>
          <span className="eyebrow">LEGAL</span>
          <h1 style={{ marginBottom: 8 }}>Termos de Uso</h1>
          <p className="muted" style={{ marginBottom: 40, fontSize: 13 }}>
            Última atualização: novembro de 2026 · Versão provisória de demonstração
          </p>

          <div className="section-description">
            <p>
              Bem-vindo à CorridaAqui. Ao acessar ou utilizar nossa plataforma, você concorda com
              estes Termos de Uso. Leia com atenção antes de prosseguir.
            </p>
          </div>

          <div className="form-section">
            <h3>1. Aceitação dos termos</h3>
            <p className="section-description">
              O uso da plataforma CorridaAqui implica a aceitação integral e irrestrita destes
              Termos de Uso e da nossa Política de Privacidade. Caso não concorde com qualquer
              disposição, recomendamos que não utilize os serviços.
            </p>
          </div>

          <div className="form-section">
            <h3>2. Descrição dos serviços</h3>
            <p className="section-description">
              A CorridaAqui é uma plataforma de gestão e inscrição em eventos esportivos que
              conecta atletas a organizadores de provas de corrida de rua, trail run, ciclismo,
              MTB e triathlon. Facilitamos o processo de inscrição, pagamento e acompanhamento
              de eventos.
            </p>
          </div>

          <div className="form-section">
            <h3>3. Cadastro e conta</h3>
            <p className="section-description">
              Para utilizar determinadas funcionalidades, é necessário criar uma conta com
              informações verdadeiras e atualizadas. Você é responsável pela confidencialidade
              da sua senha e por todas as atividades realizadas em sua conta. Em caso de uso
              não autorizado, entre em contato imediatamente pelo e-mail oi@corridaqui.demo.
            </p>
          </div>

          <div className="form-section">
            <h3>4. Inscrições e pagamentos</h3>
            <p className="section-description">
              As inscrições nos eventos são processadas diretamente pela plataforma. Os valores,
              formas de pagamento e parcelamentos disponíveis são definidos por cada organizador.
              Após a confirmação do pagamento, a inscrição é validada e o comprovante fica
              disponível na área do atleta.
            </p>
          </div>

          <div className="form-section">
            <h3>5. Cancelamentos e reembolsos</h3>
            <p className="section-description">
              As políticas de cancelamento e reembolso variam de acordo com cada evento e são
              definidas pelo organizador. A CorridaAqui não se responsabiliza por cancelamentos
              de eventos por parte dos organizadores. Em caso de cancelamento pelo atleta, as
              condições de reembolso seguem o regulamento específico do evento.
            </p>
          </div>

          <div className="form-section">
            <h3>6. Responsabilidade do atleta</h3>
            <p className="section-description">
              O atleta declara estar em condições físicas adequadas para participar dos eventos
              nos quais se inscreve. A CorridaAqui não se responsabiliza por acidentes, lesões
              ou danos ocorridos durante a realização de qualquer evento.
            </p>
          </div>

          <div className="form-section">
            <h3>7. Propriedade intelectual</h3>
            <p className="section-description">
              Todo o conteúdo da plataforma CorridaAqui — incluindo textos, imagens, logotipos
              e software — é protegido por direitos autorais e não pode ser reproduzido ou
              distribuído sem autorização prévia.
            </p>
          </div>

          <div className="form-section">
            <h3>8. Alterações nos termos</h3>
            <p className="section-description">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
              As alterações entram em vigor imediatamente após a publicação. O uso continuado
              da plataforma após as modificações constitui aceitação dos novos termos.
            </p>
          </div>

          <div className="form-section">
            <h3>9. Contato</h3>
            <p className="section-description">
              Dúvidas sobre estes termos podem ser enviadas para{' '}
              <a href="mailto:oi@corridaqui.demo" style={{ color: 'var(--brand-ink)' }}>
                oi@corridaqui.demo
              </a>
              .
            </p>
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link href="/privacidade/" className="text-link">
              Ver Política de Privacidade
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
