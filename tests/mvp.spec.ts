import { test, expect, type Page } from '@playwright/test';
import ExcelJS from 'exceljs';
import { readFile } from 'node:fs/promises';
import { ageAt, categoryFor, financials, validCPF } from '../src/lib/utils';
import { financeHeaders, participantHeaders, exportRows } from '../src/lib/export';
import { createSeed } from '../src/lib/data';

async function login(page: Page, role: 'atleta' | 'organizador' | 'admin') {
  await page.goto(`/entrar/?perfil=${role}`);
  await page.getByRole('button', { name: 'Preencher acesso' }).click();
  await page
    .getByRole('button', { name: `Entrar como ${role === 'admin' ? 'administrador' : role}` })
    .click();
  await expect(page).toHaveURL(new RegExp(`/${role}/`));
  await expect(page.locator('main h1')).toBeVisible();
}
async function prepareRegistration(page: Page, event = 'meia-do-cerrado') {
  await page.goto(`/inscricao/?evento=${event}`);
  await page.getByRole('button', { name: 'Preencher exemplo' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click();
  await expect(page.getByRole('heading', { name: 'Como prefere pagar?' })).toBeVisible();
}
async function readDb(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('corridaqui-demo-v2') || '{}'));
}

test('regras de CPF, idade, categorias, cálculo financeiro e colunas das planilhas', () => {
  expect(validCPF('529.982.247-25')).toBe(true);
  expect(validCPF('111.444.777-35')).toBe(true);
  expect(validCPF('111.111.111-11')).toBe(false);
  expect(validCPF('52998224724')).toBe(false);
  expect(ageAt('2000-12-07', '2026-12-06')).toBe(25);
  expect(ageAt('2000-12-06', '2026-12-06')).toBe(26);
  expect(categoryFor('1994-06-15', 'F', '2026-12-06')).toBe('Feminino · 30–39 anos');
  expect(categoryFor('1960-06-15', 'M', '2026-12-06')).toBe('Masculino · 60+ anos');
  const f = financials([
    { amount: 108, fee: 8, status: 'Confirmada' },
    { amount: 54, fee: 4, status: 'Pendente' },
    { amount: 54, fee: 4, status: 'Cancelada' },
  ]);
  expect(f).toEqual({ gross: 108, fees: 8, net: 100, pending: 54, count: 1 });
  const seed = createSeed();
  expect(exportRows(seed.registrations, 'inscritos').headers).toEqual(participantHeaders);
  expect(exportRows(seed.registrations, 'financeiro').headers).toEqual(financeHeaders);
  expect(exportRows(seed.registrations, 'inscritos').rows[0][3]).toBe('15/06/94');
  expect(exportRows(seed.registrations, 'inscritos').rows[0][10]).toBe('');
});

test('textos de apoio maiores preservam os títulos em desktop e celular', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('font-size', '16px');
  await expect(page.locator('.hero h1')).toHaveCSS('font-size', '64px');
  await expect(page.locator('.catalog-heading h2')).toHaveCSS('font-size', '29px');
  await expect(page.locator('.catalog-heading p')).toHaveCSS('font-size', '14px');
  await expect(page.locator('.event-card h3').first()).toHaveCSS('font-size', '15px');
  await expect(page.locator('.event-location').first()).toHaveCSS('font-size', '12px');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.hero h1')).toHaveCSS('font-size', '43px');
  await expect(page.locator('.catalog-heading h2')).toHaveCSS('font-size', '26px');
  await expect(page.locator('.event-card h3').first()).toHaveCSS('font-size', '19px');
  await expect(page.locator('.event-location').first()).toHaveCSS('font-size', '13px');
  await page.goto('/inscricao/?evento=meia-do-cerrado');
  await expect(page.getByLabel('Nome completo *', { exact: true })).toHaveCSS('font-size', '16px');
});

test('catálogo filtra por modalidade, busca sem acentos, estado e status', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.event-card')).toHaveCount(8);
  await page.getByRole('button', { name: /^Trail Run/ }).click();
  await expect(page.locator('.event-card')).toHaveCount(1);
  await expect(page.locator('.event-card h3')).toHaveText('Trail Serra dos Pireneus');
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await page.getByRole('textbox', { name: 'Buscar eventos' }).fill('brasilia');
  await expect(page.locator('.event-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await page.getByLabel('Estado', { exact: true }).selectOption('GO');
  await expect(page.locator('.event-card')).toHaveCount(2);
  await page.getByLabel('Em breve', { exact: true }).check();
  await expect(page.locator('.event-card h3')).toHaveText('Giro do Lago');
  await page.getByRole('button', { name: 'Visualização em lista' }).click();
  await expect(page.locator('.events-grid')).toHaveClass(/list-view/);
});

test('menu e filtros funcionam em celular sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Minhas inscrições' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar menu', exact: true }).click();
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /^MTB/ }).click();
  await dialog.getByRole('button', { name: 'Ver 1 eventos' }).click();
  await expect(page.locator('.event-card')).toHaveCount(1);
  await expect(page.locator('.event-card h3')).toHaveText('Desafio Pedal das Águas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('login rejeita acesso inválido e separa as áreas por perfil', async ({ page }) => {
  await page.goto('/admin/');
  await expect(page).toHaveURL(/entrar\/\?perfil=admin/);
  await page.getByLabel('E-mail', { exact: true }).fill('admin@corridaqui.demo');
  await page.getByLabel('Senha', { exact: true }).fill('incorreta');
  await page.getByRole('button', { name: 'Entrar como administrador' }).click();
  await expect(page.locator('.error-message[role="alert"]')).toContainText(
    'Acesso não reconhecido',
  );
  await page.getByRole('button', { name: 'Preencher acesso' }).click();
  await page.getByRole('button', { name: 'Entrar como administrador' }).click();
  await expect(page.getByRole('heading', { name: 'Visão geral da plataforma.' })).toBeVisible();
  await page.goto('/organizador/');
  await expect(page).toHaveURL(/entrar\/\?perfil=organizador/);
});

test('consulta do atleta por CPF e código inteiramente simulado', async ({ page }) => {
  await page.goto('/entrar/?perfil=atleta');
  await page.getByRole('button', { name: 'Consultar por CPF' }).click();
  await page.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
  await page.getByRole('button', { name: 'Gerar código demonstrativo' }).click();
  await page.getByLabel('Código de acesso').fill('000000');
  await page.getByRole('button', { name: 'Entrar como atleta' }).click();
  await expect(page.locator('.error-message[role="alert"]')).toContainText('Código incorreto');
  await page.getByLabel('Código de acesso').fill('123456');
  await page.getByRole('button', { name: 'Entrar como atleta' }).click();
  await expect(page).toHaveURL(/atleta/);
  await expect(page.locator('.athlete-ticket h3')).toHaveText([
    'Meia do Cerrado',
    'Corrida do Parque',
  ]);
});

test('login troca atleta/organizador e tema sem duplicar o formulário', async ({ page }) => {
  await page.goto('/entrar/?perfil=atleta');
  await page.getByRole('tab', { name: 'Organizador' }).click();
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('tab', { name: 'Atleta' }).click();
  await page.getByRole('button', { name: 'Ativar tema claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('form.login-form')).toHaveCount(1);
  await expect(page.locator('.demo-account')).toHaveCount(1);
});

test('depoimento só para prova já corrida e não vai para a home sem aprovação', async ({
  page,
}) => {
  await page.goto('/entrar/?perfil=atleta');
  await expect(page.getByRole('tab')).toHaveText(['Atleta', 'Organizador']);
  await login(page, 'atleta');
  const past = page.locator('.athlete-ticket').filter({ hasText: 'Corrida do Parque' });
  const future = page.locator('.athlete-ticket').filter({ hasText: 'Meia do Cerrado' });
  await expect(future.getByRole('button', { name: 'Deixar depoimento' })).toHaveCount(0);
  await past.getByRole('button', { name: 'Deixar depoimento' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Seu depoimento').fill('Curto');
  await dialog.getByRole('button', { name: 'Enviar depoimento' }).click();
  await expect(dialog.getByRole('alert')).toContainText('20 caracteres');
  const text = 'Prova bem organizada, kit retirado sem fila e percurso sinalizado.';
  await dialog.getByLabel('Seu depoimento').fill(text);
  await dialog.getByRole('button', { name: 'Enviar depoimento' }).click();
  await expect(past).toContainText('Depoimento enviado');
  await page.goto('/');
  await expect(page.locator('.testimonials-track')).toBeVisible();
  await expect(page.locator('.testimonials-track')).not.toContainText(text);
  await login(page, 'admin');
  // Depoimentos abre para ver, mas as ações ficam em desenvolvimento.
  const navItem = page.locator('.workspace-nav button').filter({ hasText: 'Depoimentos' });
  await expect(navItem).toHaveAttribute('data-tooltip', 'Em desenvolvimento');
  await navItem.click();
  await expect(page.locator('main h1')).toHaveText('Depoimentos');
  await expect(page.locator('.dev-notice')).toContainText('Em desenvolvimento');
  const item = page.locator('.testimonial-admin-item').filter({ hasText: text });
  await expect(item.locator('.badge')).toHaveText('Oculto');
  const show = item.getByRole('button', { name: 'Mostrar no site' });
  await expect(show).toHaveAttribute('aria-disabled', 'true');
  await show.click({ force: true });
  await expect(item.locator('.badge')).toHaveText('Oculto');
  await page.goto('/');
  await expect(page.locator('.testimonials-track')).not.toContainText(text);
});

test('cadastro local cria perfil e preserva dados editados', async ({ page }) => {
  await page.goto('/entrar/?perfil=atleta');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await page.getByLabel('Nome completo').fill('Alex Costa');
  await page.getByLabel('CPF', { exact: true }).fill('11144477735');
  await page.getByLabel('E-mail', { exact: true }).fill('alex@exemplo.test');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Criar perfil demonstrativo' }).click();
  await expect(page.locator('main h1')).toContainText('Alex');
  await expect(page.getByRole('heading', { name: 'Você ainda não tem inscrições' })).toBeVisible();
  await page.getByRole('button', { name: 'Meus dados', exact: true }).click();
  await page.getByLabel('Cidade', { exact: true }).fill('Paracatu');
  await page.getByRole('button', { name: 'Salvar meus dados' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Meus dados', exact: true }).click();
  await expect(page.getByLabel('Cidade', { exact: true })).toHaveValue('Paracatu');
});

test('inscrição completa com kit, cupom, cartão parcelado, recusa e aprovação', async ({
  page,
}, testInfo) => {
  await page.goto('/evento/?id=meia-do-cerrado');
  await page.getByRole('link', { name: 'Quero me inscrever' }).click();
  await page.getByRole('button', { name: 'Preencher exemplo' }).click();
  await page.getByRole('radio', { name: /10 km/ }).check();
  await page.getByLabel('Kit do atleta', { exact: true }).selectOption('Completo');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click();
  await expect(page.getByRole('heading', { name: 'Como prefere pagar?' })).toBeVisible();
  await page.getByLabel('Tem um cupom?').fill('BEMVINDO10');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.locator('.checkout-summary .total strong')).toContainText('130,25');
  await page.getByRole('button', { name: 'Cartão', exact: true }).click();
  await page.getByLabel('Parcelamento sem juros').selectOption('3');
  await page.getByLabel('Resultado do pagamento simulado').selectOption('declined');
  await page.getByRole('button', { name: /Simular pagamento de/ }).click();
  await expect(page.locator('.error-message[role="alert"]')).toContainText('Pagamento recusado');
  await page.getByLabel('Resultado do pagamento simulado').selectOption('success');
  await page.getByRole('button', { name: /Simular pagamento de/ }).click();
  await expect(page.locator('.checkout-header h1')).toHaveText('Inscrição confirmada.');
  const db = await readDb(page);
  const reg = db.registrations.find((r: { email: string }) => r.email === 'alex@exemplo.test');
  expect(reg.status).toBe('Confirmada');
  expect(reg.amount).toBe(130.25);
  expect(reg.installments).toBe(3);
  expect(reg.discount).toBeCloseTo(13.4);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar comprovante' }).click();
  const download = await downloadPromise;
  const path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  const receipt = await readFile(path, 'utf8');
  expect(receipt).toContain('DEMONSTRAÇÃO');
  expect(receipt).toContain('Alex Costa');
  await page.getByRole('link', { name: 'Ir para minha área' }).click();
  await expect(page.locator('.athlete-ticket')).toHaveCount(1);
  await expect(page.locator('.athlete-ticket .badge')).toHaveText('Confirmada');
  await page.screenshot({
    path: testInfo.outputPath('atleta-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
});

test('PIX pendente pode ser retomado e depois confirmado na área do atleta', async ({ page }) => {
  await prepareRegistration(page, 'trail-serra-dos-pireneus');
  await expect(page.locator('.demo-qr svg')).toBeVisible();
  await page.getByLabel('Resultado do pagamento simulado').selectOption('pending');
  await page.getByRole('button', { name: /Simular pagamento de/ }).click();
  await expect(page.locator('.confirmation-panel .badge')).toHaveText('Pendente');
  await page.getByRole('link', { name: 'Ir para minha área' }).click();
  const ticket = page.locator('.athlete-ticket').filter({ hasText: 'Trail Serra' });
  await ticket.getByRole('button', { name: 'Pagar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Como prefere pagar?' })).toBeVisible();
  await page.getByRole('button', { name: /Simular pagamento de/ }).click();
  await expect(page.locator('.confirmation-panel .badge')).toHaveText('Confirmada');
});

test('boleto é ilustrativo e cancelar inscrição atualiza o estado local', async ({ page }) => {
  await prepareRegistration(page, 'pedal-das-aguas');
  await page.getByRole('button', { name: 'Boleto', exact: true }).click();
  await expect(page.locator('.boleto-payment code')).toContainText('DEMO');
  await page.getByRole('button', { name: /Simular pagamento de/ }).click();
  await page.getByRole('link', { name: 'Ir para minha área' }).click();
  const ticket = page.locator('.athlete-ticket').filter({ hasText: 'Pedal das Águas' });
  await ticket.getByRole('button', { name: 'Ver detalhes' }).click();
  await page.getByRole('button', { name: 'Cancelar inscrição demonstrativa' }).click();
  await page.getByRole('button', { name: 'Confirmar cancelamento' }).click();
  await expect(ticket.locator('.badge')).toHaveText('Cancelada');
});

test('organizador cria e publica evento local com preço e taxa configuráveis', async ({ page }) => {
  await login(page, 'organizador');
  await page.getByRole('button', { name: 'Novo evento', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByRole('button', { name: 'Salvar evento' }).click();
  await expect(modal.getByRole('alert')).toContainText('Preencha');
  await modal.getByLabel('Nome do evento *', { exact: true }).fill('Corrida de Apresentação');
  await modal
    .getByLabel('Descrição do evento *')
    .fill('Uma corrida fictícia para demonstrar a gestão completa do evento.');
  await modal.getByRole('button', { name: 'Próxima etapa' }).click();
  await modal.getByLabel('Valor da modalidade 1').fill('50');
  await modal.getByLabel('Vagas da modalidade 1').fill('100');
  await modal.getByLabel('Quem paga a taxa?').selectOption('organizador');
  await modal.getByRole('button', { name: 'Próxima etapa' }).click();
  await modal.getByLabel('Situação do evento').selectOption('Inscrições abertas');
  await modal.getByRole('button', { name: 'Salvar evento' }).click();
  await expect(modal).not.toBeVisible();
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Buscar eventos' }).fill('Corrida de Apresentação');
  await expect(page.locator('.event-card')).toHaveCount(1);
  await page.locator('.event-card').click();
  await expect(page.locator('.booking-price strong')).toContainText('50,00');
  await expect(page.locator('.booking-price')).toContainText('Taxa de serviço inclusa');
});

test('exportações reais Excel e CSV mantêm as colunas e filtros dos modelos', async ({
  page,
}, testInfo) => {
  await login(page, 'organizador');
  await page.goto('/organizador/?aba=inscricoes');
  await page.getByLabel('Filtrar por evento').selectOption('meia-do-cerrado');
  await page.getByLabel('Filtrar por status').selectOption('Confirmada');
  const db = await readDb(page);
  const expected = db.registrations.filter(
    (r: { eventId: string; status: string }) =>
      r.eventId === 'meia-do-cerrado' && r.status === 'Confirmada',
  ).length;
  await page.getByRole('button', { name: 'Exportar', exact: true }).click();
  let promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo' }).click();
  let download = await promise;
  let path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet = workbook.worksheets[0];
  expect((sheet.getRow(1).values as string[]).slice(1)).toEqual(participantHeaders);
  expect(sheet.rowCount).toBe(expected + 1);
  expect(sheet.getCell('K2').value).toBe('');
  await page.getByRole('button', { name: 'Exportar', exact: true }).click();
  await page.getByLabel('Relatório financeiro', { exact: false }).check();
  await page.getByLabel('Formato do arquivo').selectOption('csv');
  promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo' }).click();
  download = await promise;
  path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  const csv = await readFile(path, 'utf8');
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv.split('\r\n')[0]).toBe('\uFEFF' + financeHeaders.map((h) => `"${h}"`).join(';'));
  expect(csv.split('\r\n')).toHaveLength(expected + 1);
});

test('admin aprova organizador; Atividades e Repasses ficam em desenvolvimento', async ({
  page,
}) => {
  await login(page, 'admin');
  await page.goto('/admin/?aba=organizadores');
  const organizer = page.locator('.organizer-card').filter({ hasText: 'Rota Livre' });
  await organizer.getByRole('button', { name: 'Aprovar cadastro' }).click();
  await expect(organizer.locator('.badge')).toHaveText('Aprovado');
  // Aparecem no menu, apagados e com aviso, mas não abrem (src/lib/features.ts).
  for (const label of ['Atividades', 'Repasses']) {
    const item = page.locator('.workspace-nav button').filter({ hasText: label });
    await expect(item).toHaveAttribute('aria-disabled', 'true');
    await expect(item).toHaveAttribute('data-tooltip', 'Em desenvolvimento');
    await item.click({ force: true });
    await expect(page.locator('main h1')).toHaveText('Organizadores');
  }
  for (const aba of ['historico', 'repasses']) {
    await page.goto(`/admin/?aba=${aba}`);
    await expect(page.locator('main h1')).toHaveText('Visão geral');
  }
  // Sem atalho para repasses pelo Financeiro.
  await page.goto('/admin/?aba=financeiro');
  await expect(page.locator('main h1')).toHaveText('Financeiro');
  await expect(page.getByRole('button', { name: 'Programar repasse' })).toHaveCount(0);
  // O registro de atividades continua por trás.
  const db = await readDb(page);
  expect(db.activities.some((a: { text: string }) => a.text.includes('Rota Livre aprovado'))).toBe(
    true,
  );
  // A paleta da marca nas configurações do admin.
  await page.goto('/admin/?aba=configuracoes');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'blue');
  await page.getByRole('button', { name: 'Cor terracota', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'terra');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'terra');
});

test('cupons do organizador aparecem no checkout, tema e cor persistem', async ({ page }) => {
  await login(page, 'organizador');
  await page.goto('/organizador/?aba=cupons');
  await page.getByRole('button', { name: 'Criar cupom', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel('Código do cupom').fill('APRESENTACAO');
  await modal.getByLabel('Valor do desconto').fill('15');
  await modal.getByRole('button', { name: 'Criar cupom', exact: true }).click();
  await expect(page.locator('tbody')).toContainText('APRESENTACAO');
  await page.goto('/organizador/?aba=perfil');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'blue');
  await page.getByRole('button', { name: 'Cor terracota', exact: true }).click();
  await page.getByRole('button', { name: 'Alternar tema', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'terra');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'terra');
  await page.goto('/inscricao/?evento=meia-do-cerrado');
  await page.getByRole('button', { name: 'Preencher exemplo' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continuar para pagamento' }).click();
  await page.getByLabel('Tem um cupom?').fill('APRESENTACAO');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.locator('.coupon-applied').first()).toContainText('APRESENTACAO');
});

test('responsividade: páginas públicas e painéis de 320px a desktop', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const checkOverflow = async (route: string, width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    expect(overflow, `${route} transbordou em ${width}px`).toBe(false);
  };
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const route of [
      '/',
      '/evento/?id=meia-do-cerrado',
      '/inscricao/?evento=meia-do-cerrado',
      '/entrar/?perfil=admin',
    ]) {
      await checkOverflow(route, width);
    }
  }
  await login(page, 'admin');
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const view of [
      'visao-geral',
      'eventos',
      'inscricoes',
      'financeiro',
      'organizadores',
      'configuracoes',
      'repasses',
      'pagamentos',
      'historico',
    ]) {
      await checkOverflow(`/admin/?aba=${view}`, width);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Abrir menu do painel' }).click();
  await page.getByRole('button', { name: 'Pagamentos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Transações e pagamentos' })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('admin-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  });
  expect(errors).toEqual([]);
});
