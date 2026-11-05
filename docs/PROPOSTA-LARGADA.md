# Proposta Largada

Nov 5, 2026 · @Ismael

**Para:** \[Nome do cliente\] **De:** Dayno e Bruno

Propomos o desenvolvimento do Largada, uma plataforma de inscrições e gestão de eventos esportivos, em duas opções: **Essencial, por R$ 6.500**, e **Completa, por R$ 8.000**. As duas atendem a todos os requisitos pedidos: três painéis, inscrição online, pagamento e exportação de planilhas. A diferença está no acesso de cada usuário.

## Apresentação

O Largada permite que organizadores publiquem eventos (corrida de rua, trail, MTB, ciclismo e triathlon), recebam inscrições e pagamentos online e acompanhem tudo em um painel. Atletas encontram as provas, se inscrevem e pagam por PIX, cartão ou boleto.

Uma demonstração funcional já está pronta para vocês navegarem: \[link da demonstração\]. Ela mostra as telas e o fluxo completo, ainda com dados fictícios e sem cobranças reais.

## Incluído nas duas opções

- **Portal público de eventos:** catálogo com busca e filtros por modalidade, estado e status; página de cada evento com distâncias, preços, local, regulamento e perguntas frequentes.
- **Inscrição online:** dados do atleta, validação de CPF e idade mínima, categoria por idade e sexo, distância, camiseta, kit e equipe.
- **Checkout de pagamento:** PIX, cartão de crédito parcelado e boleto, com cupons de desconto e confirmação automática do pagamento.
- **E-mail de confirmação da inscrição** com o comprovante e o código de inscrição.
- **Painel do organizador:** criar e editar eventos, distâncias, preços e vagas; lista de inscritos, número de peito, entrega de kits, cupons e financeiro.
- **Painel do administrador:** visão de todos os eventos, inscrições e pagamentos; aprovação de organizadores; controle de repasses.
- **Exportação de planilhas** em Excel e CSV, respeitando os filtros da tela.
- **Layout responsivo** para celular, tablet e computador, com modo claro e escuro.
- **Publicação** do sistema no domínio de vocês.

## As duas opções

A Essencial é mais simples de usar e de manter: o atleta não precisa criar conta. A Completa dá conta com login para todos e recuperação de senha por e-mail.

|  | Essencial | Completa |
| --- | --- | --- |
| Três painéis, inscrição, pagamento e planilhas | Sim | Sim |
| E-mail de confirmação da inscrição | Sim | Sim |
| Como o atleta consulta a inscrição | CPF + código de inscrição, sem cadastro | Conta própria com e-mail e senha |
| Área do atleta com histórico de inscrições e comprovantes | Por inscrição consultada | Todas as inscrições em um só lugar |
| Login de organizador e administrador | Sim | Sim |
| Recuperação de senha por e-mail | Não (o administrador redefine) | Sim, para todos os perfis |
| Servidor de e-mail para contas | Não | Sim |
| Painel (portal, painéis e planilhas) | R$ 2.500 | R$ 4.000 |
| Checkout de pagamentos | R$ 4.000 | R$ 4.000 |
| **Total** | **R$ 6.500** | **R$ 8.000** |

Na Essencial, o atleta só vê a inscrição informando o CPF **e** o código que recebe no comprovante. Assim, ninguém consulta os dados de outra pessoa sabendo apenas o CPF, como pede a LGPD.

**Esforço estimado:** cerca de **200 horas** na Essencial e **240 horas** na Completa, com dois desenvolvedores dedicados ao projeto.

## Pagamentos online

Os pagamentos passam por um gateway brasileiro (por exemplo Asaas, Pagar.me ou Mercado Pago), escolhido junto com vocês. Fazemos toda a integração: PIX, cartão, boleto, confirmação automática e repasse aos organizadores.

- **Conta no gateway:** aberta no CNPJ de vocês, que recebem o dinheiro diretamente. Nós não intermediamos valores.
- **Taxas do gateway:** cobradas pelo gateway a cada transação e pagas por vocês. Hoje ficam por volta de 1% no PIX e de 3% a 5% no cartão, conforme o plano contratado. A taxço da plataforma pode ser repassada ao atleta, configurável por evento.
- **Repasse aos organizado**a de servi**res:** feito pela divisão automática de pagamento (split) do gateway, quando disponível no plano contratado, ou programado pelo administrador no painel.
- **Estornos e contestações:** seguem as regras do gateway e são tratados por vocês no painel dele; o sistema registra o status da inscrição.

## Prazos e etapas

A Essencial fica pronta em cerca de **6 semanas** e a Completa em cerca de **8 semanas**, contadas a partir da assinatura e do envio dos acessos necessários (domínio e conta no gateway). Cada etapa termina com uma entrega que vocês testam e aprovam.

1. **Painéis e portal** (Essencial: semanas 1 a 3; Completa: semanas 1 a 4): portal público, inscrição, painéis do organizador e do administrador, planilhas e banco de dados real.
2. **Contas e e-mails** (só Completa: semanas 5 e 6): conta do atleta, login de todos os perfis e recuperação de senha.
3. **Checkout de pagamentos** (Essencial: semanas 4 e 5; Completa: semana 7): integração com o gateway, confirmação automática e repasses.
4. **Testes e publicação** (última semana): testes com pagamentos reais de valor baixo, ajustes finais e publicação no domínio de vocês.

Estão incluídas **duas rodadas de ajustes** por etapa, sobre o que foi combinado nesta proposta.

## Condições de pagamento

O pagamento é dividido em parcelas ligadas às entregas, por PIX ou transferência.

| Parcela | Essencial (3x) | Completa (4x) |
| --- | --- | --- |
| Na assinatura | R$ 2.600 | R$ 2.000 |
| Entrega dos painéis e portal | R$ 1.950 | R$ 2.000 |
| Entrega das contas e e-mails | — | R$ 2.000 |
| Publicação com pagamentos funcionando | R$ 1.950 | R$ 2.000 |
| **Total** | **R$ 6.500** | **R$ 8.000** |

O contrato pode ser firmado com pessoa física.

## Garantia, custos mensais e limites

**Garantia:** corrigimos sem custo qualquer erro do sistema por **60 dias** após a publicação. O código-fonte é entregue a vocês após o pagamento integral.

**Custos externos:** hospedagem, banco de dados, domínio e serviço de e-mail não estão incluídos no valor do sistema e são de responsabilidade de vocês, contratados em contas no nome de vocês. São custos recorrentes:

- Hospedagem e banco de dados: \[valor estimado\] por mês, conforme o volume de acessos.
- Domínio: cerca de R$ 40 por ano (.com.br).
- Envio de e-mails: gratuito até alguns milhares de e-mails por mês na maioria dos serviços.
- Taxas do gateway por transação, como descrito em Pagamentos online.

Se algum desses serviços deixar de ser pago, o sistema pode ficar fora do ar. Caso seja necessário intervir no ambiente para restabelecer o funcionamento, poderá ser cobrada uma taxa de restabelecimento de \[valor\].

Manutenção mensal e novas funcionalidades depois da garantia podem ser contratadas à parte: \[valor da manutenção mensal\].

**Não estão incluídos nesta proposta:** cronometragem e leitura de chip, aplicativo para celular nas lojas, importação automática de resultados, emissão de nota fiscal para atletas, integração com sistemas de terceiros, criação de logotipo e textos de marketing. Esses itens podem ser orçados separadamente.

## Próximos passos

Esta proposta vale por **15 dias**, até Nov 20, 2026.

1. Vocês escolhem a opção Essencial ou Completa.
2. Assinamos o contrato e é feito o pagamento da primeira parcela.
3. Vocês enviam o domínio e abrem a conta no gateway escolhido; nós ajudamos nessa etapa.
4. Começamos o desenvolvimento e marcamos a primeira entrega.

Contato: \[telefone ou WhatsApp\]

## Anexo: especificação do sistema

Esta lista define o escopo do projeto. Funcionalidades fora dela não estão incluídas e podem ser orçadas à parte.

| Módulo | Funcionalidade | Essencial | Completa |
| --- | --- | --- | --- |
| Portal público | Catálogo de eventos em grade ou lista | Sim | Sim |
| Portal público | Busca por nome, cidade, modalidade ou distância | Sim | Sim |
| Portal público | Filtros por modalidade, estado e status; ordenação | Sim | Sim |
| Portal público | Página do evento: distâncias, preços, local com mapa, regulamento e perguntas frequentes | Sim | Sim |
| Portal público | Aviso de vagas, inscrições em breve, esgotado e encerrado | Sim | Sim |
| Portal público | Aba de resultados por evento | Sim | Sim |
| Inscrição | Formulário com dados do atleta, camiseta, kit, equipe e observações | Sim | Sim |
| Inscrição | Validação de CPF e idade mínima; categoria por idade e sexo | Sim | Sim |
| Inscrição | Aceite do regulamento | Sim | Sim |
| Inscrição | E-mail de confirmação com comprovante e código de inscrição | Sim | Sim |
| Checkout | Pagamento por PIX, cartão parcelado e boleto | Sim | Sim |
| Checkout | Cupons de desconto percentual ou fixo | Sim | Sim |
| Checkout | Confirmação automática do pagamento | Sim | Sim |
| Checkout | Retomar pagamento pendente | Sim | Sim |
| Área do atleta | Consulta da inscrição por CPF + código, sem cadastro | Sim | — |
| Área do atleta | Conta com e-mail e senha | — | Sim |
| Área do atleta | Histórico de todas as inscrições e comprovantes | — | Sim |
| Área do atleta | Carteirinha virtual com QR Code | Sim | Sim |
| Área do atleta | Edição de perfil | — | Sim |
| Acesso | Login e logout de organizador e administrador | Sim | Sim |
| Acesso | Recuperação de senha por e-mail, todos os perfis | — | Sim |
| Acesso | Redefinição de senha feita pelo administrador | Sim | Sim |
| Painel do organizador | Indicadores: inscrições, receita e vagas | Sim | Sim |
| Painel do organizador | Criar, editar, duplicar, publicar e encerrar eventos | Sim | Sim |
| Painel do organizador | Distâncias, preços, vagas, taxa de serviço e capa do evento | Sim | Sim |
| Painel do organizador | Lista de inscritos, status e número de peito | Sim | Sim |
| Painel do organizador | Controle de entrega de kits | Sim | Sim |
| Painel do organizador | Criação e controle de cupons | Sim | Sim |
| Painel do organizador | Financeiro e recebimentos | Sim | Sim |
| Painel do administrador | Visão geral de eventos, inscrições e pagamentos | Sim | Sim |
| Painel do administrador | Valores bruto, taxas, líquido e pendências | Sim | Sim |
| Painel do administrador | Programação e registro de repasses | Sim | Sim |
| Painel do administrador | Cadastro e aprovação de organizadores | Sim | Sim |
| Painel do administrador | Histórico de atividades | Sim | Sim |
| Exportação | Planilhas Excel e CSV de inscritos e financeiro, com filtros | Sim | Sim |
| Aparência | Layout para celular, tablet e computador | Sim | Sim |
| Aparência | Modo claro e escuro; cor da marca configurável | Sim | Sim |
| Publicação | Banco de dados, hospedagem configurada e publicação no domínio | Sim | Sim |
|  |  |  |  |
