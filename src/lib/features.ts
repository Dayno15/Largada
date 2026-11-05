/**
 * Funcionalidades que existem no código, mas ficam desligadas na demonstração por
 * estarem fora do escopo vendido em docs/PROPOSTA-LARGADA.md. A ideia é a demo não
 * mostrar mais do que a proposta entrega. Para religar uma delas, troque para `true`.
 */
export const features = {
  /** Sino de atividades recentes no topo dos painéis. */
  activityBell: false,
  /** Coração de favoritar nos cards do catálogo. */
  favorites: false,
  /** Botão "Compartilhar" na página do evento. */
  share: false,
  /** Links de WhatsApp e Strava na página do evento e os campos no editor de evento. */
  eventLinks: true,
  /**
   * "Já tenho inscrição — consultar" na página do evento, só com o CPF. A proposta
   * prevê consulta por CPF + código, na área do atleta (LGPD).
   */
  quickLookup: false,
  /** Campo "Parceiro(a) de dupla" na inscrição. */
  partner: false,
  /** Escolha de paleta (tema de cor) pelo atleta e pelo organizador. */
  personalAccent: true,
};

/**
 * Telas dos painéis que aparecem no menu apagadas, com "Em desenvolvimento" ao passar
 * o mouse. Para liberar uma tela, tire o id dela da lista.
 * - locked: o item fica no menu, mas a tela não abre.
 * - readOnly: a tela abre para ver, mas as ações dentro dela ficam desabilitadas.
 */
const inDevelopment = {
  locked: ['historico', 'repasses'],
  readOnly: ['depoimentos'],
};
export const DEV_LABEL = 'Em desenvolvimento';
export const isLocked = (id: string) => inDevelopment.locked.includes(id);
export const isReadOnly = (id: string) => inDevelopment.readOnly.includes(id);
