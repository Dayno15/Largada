# CorridaAqui

MVP demonstrativo de inscrições e gestão de eventos esportivos. **Next.js + React + TypeScript, sem backend, banco de dados ou gateway real.**

## Rodar

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

Abra **http://localhost:3000**. O servidor aceita conexões em `0.0.0.0:3000`.

## Acessos de demonstração

Todos usam a senha **`demo123`**. A tela de login também tem o botão **Preencher acesso**.

| Área          | E-mail                        | Endereço        |
| ------------- | ----------------------------- | --------------- |
| Atleta        | `atleta@corridaqui.demo`      | `/atleta/`      |
| Organizador   | `organizador@corridaqui.demo` | `/organizador/` |
| Administrador | `admin@corridaqui.demo`       | `/admin/`       |

Consulta do atleta por CPF: **529.982.247-25**, código **123456**. Nenhum código ou e-mail é enviado.

> Estes acessos não são autenticação de produção. As verificações existem somente na interface. Não publique dados reais, senhas privadas ou chaves de pagamento neste MVP.

## O que está implementado

- **Portal público:** catálogo com busca sem acentos, filtros por modalidade/UF/status, ordenação, grade/lista e detalhes de cada evento.
- **Inscrição:** dados pessoais, validação de CPF e idade mínima, categoria por idade/sexo, distância, camiseta, kit, equipe, parceiro, observações e regulamento.
- **Checkout:** PIX sem valor financeiro, cartão fictício parcelado e boleto ilustrativo. É possível simular aprovação, recusa e pendência. Cupons são aplicados no resumo. Uma inscrição pendente pode ser retomada.
- **Atleta:** cadastro local, acesso por e-mail ou CPF/código, inscrições, comprovante HTML para baixar/imprimir, cancelamento simulado, perfil e preferências.
- **Organizador:** indicadores, eventos (criar/editar/duplicar/publicar/encerrar), distâncias, preços, vagas, taxa e seu responsável, capa local, inscritos, dorsal, status, entrega de kits, cupons, financeiro e recebimentos.
- **Administração:** visão geral de todos os eventos, inscrições e pagamentos; bruto/taxas/líquido/pendências; programação de repasses e simulação de recebimento; aprovação de organizadores; histórico de atividades; configurações e restauração da demo.
- **Aparência:** modo claro/escuro, três cores de marca e layout responsivo para celular, tablet e desktop.
- **Exportações:** Excel e CSV reais, gerados no navegador com dados fictícios e respeitando os filtros da tela.

Fora do escopo: cronometragem, chips, câmera, classificação, tempo real, importação de atletas, integrações bancárias e autenticação real.

## Roteiro rápido de apresentação

1. Explore os eventos no portal e abra **Meia do Cerrado**.
2. Clique em **Quero me inscrever → Preencher exemplo**. A demo usa um segundo atleta fictício quando o CPF de exemplo já está inscrito.
3. Escolha a distância e o kit, aceite o termo e avance.
4. Aplique **BEMVINDO10**. Teste PIX, cartão e boleto; use o controle de demonstração para aprovar, recusar ou deixar pendente.
5. Abra a área do atleta e baixe o comprovante.
6. Saia e entre como organizador. Veja a inscrição, altere seu status e exporte os dados filtrados.
7. Entre como administrador. Confira o financeiro, programe um repasse e simule o recebimento.
8. Em **Configurações**, altere a marca/tema ou restaure os dados iniciais.

## Dados e privacidade

- Há 8 eventos, 121 inscrições e 4 organizadores de exemplo.
- Os valores e os participantes são fictícios. Os arquivos originais foram consultados **apenas para requisitos e nomes das colunas**. Seus dados pessoais não foram importados nem versionados.
- As alterações ficam na chave `corridaqui-demo-v1` do `localStorage`. A sessão fica no `sessionStorage`, e não é compartilhada entre navegadores ou dispositivos.
- Nenhuma senha pessoal ou dado de cartão é coletado/salvo. A senha `demo123` é pública e serve apenas à demonstração.
- Não há comunicação com o sistema de referência. Nenhuma credencial desse sistema faz parte deste repositório.
- Limpar o armazenamento do navegador ou usar **Administração → Configurações → Restaurar demo** recomeça os exemplos.
- Com o armazenamento indisponível, o protótipo funciona em memória; as alterações não sobrevivem ao recarregar.

## Exportações compatíveis com os modelos

**Inscritos (20 colunas):** Número, Nome completo, Categoria, Nasc.(dd/mm/aa), Sexo(M/F), Equipe, Cidade, Estado, CPF, Celular, Chip, Distância, Nº Voltas, Tempo Mínimo, Tamanho, Foto (URL), Troca de Titularidade, Troca de Categoria, Troca de Modalidade, Parceiro dupla.

**Financeiro (8 colunas):** Nome, Status, Pagou?, Distância, Cupom usado, Valor Líquido, Forma de Pagamento, Data Pagamento.

Os campos fora do escopo, como chip e tempos, ficam vazios. Valor líquido corresponde ao total menos a taxa de serviço. CSV usa UTF-8 com BOM e ponto e vírgula, adequado ao Excel em português. Células de texto são protegidas contra interpretação como fórmulas.

## Alterar cores e tema

- Tokens de marca e overrides: `src/app/globals.css`, no início do arquivo.
- Estilos de eventos, checkout e painéis: `src/app/experience.css`.
- Escala dos textos de apoio, menus e formulários (sem alterar títulos): `src/app/typography.css`.
- Dados fictícios: `src/lib/data.ts`.
- Modelo de dados: `src/lib/types.ts`.
- Exportações e colunas: `src/lib/export.ts`.
- Persistência local, sessão e preferências: `src/components/provider.tsx`.

As paletas **verde-petróleo, azul e terracota** também podem ser escolhidas pela interface em Preferências/Perfil/Configurações. A escolha persiste neste navegador.

## Publicação estática / GitHub Pages

O projeto usa `output: 'export'` e `trailingSlash: true`. **Não precisa de servidor Next.js em produção.** As rotas de evento usam query string para permitir eventos criados localmente sem rebuild.

```bash
npm run build
npm start
```

O site estático é gerado em **`out/`**. `npm start` serve essa pasta na porta 3000 (pare o servidor de desenvolvimento antes de usar a mesma porta).

Para publicar em `usuario.github.io/corridaqui/`, faça o build com o caminho do repositório:

```bash
NEXT_PUBLIC_BASE_PATH=/corridaqui npm run build
```

Para `usuario.github.io` na raiz ou domínio próprio, deixe a variável vazia. O caminho é incorporado durante o build; não é uma configuração em tempo de execução.

O workflow **`.github/workflows/pages.yml`** já calcula o caminho do repositório e publica `out/` **somente quando acionado manualmente**. Um push não publica o site. Quando quiser disponibilizar a demo, selecione **Settings → Pages → Source: GitHub Actions** e execute **Actions → Publicar demonstração no GitHub Pages → Run workflow**. Repositórios privados podem exigir um plano compatível com GitHub Pages; a visibilidade do site é separada da visibilidade do código.

### ngrok

Com o site rodando na porta 3000:

```bash
ngrok http 3000
```

Para apresentar, prefira o build estático (`npm run build` + `npm start`). Assim não há recompilações nem ferramentas de desenvolvimento expostas.

## Validação

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```

Os testes Playwright cobrem filtros, login/perfis, cadastro, CPF/código, inscrição com cupom/kit/parcelamento, recusa/aprovação/pendência, retomada de pagamento, cancelamento, evento publicado, exportações Excel/CSV, aprovação de organizador, repasse, tema e responsividade entre 320 e 1440 px.

Se Chromium não estiver disponível: `npx playwright install chromium`. Para testar um build já servido em outra porta: `TEST_BASE_URL=http://localhost:3001 npm test`.

## Créditos

Fotografias de demonstração obtidas no Unsplash, armazenadas em `public/images/` para não depender de chamadas externas durante a apresentação. Ícones Lucide. Tipografia Manrope (OFL), incluída localmente em `src/fonts/`. Veja `THIRD_PARTY_NOTICES.md`.
