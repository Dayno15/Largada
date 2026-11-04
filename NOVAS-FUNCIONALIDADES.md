# Largada — Novas Funcionalidades (Nov/2026)

Documentação das melhorias implementadas após análise dos principais concorrentes brasileiros:
Central de Corridas, Corrida e Aventura, NaCorrida e Eu Na Corrida.

---

## 1. Modelo de dados expandido

**Arquivo:** `src/lib/types.ts`

Adicionamos campos opcionais à interface `RaceEvent` para suportar as novas funcionalidades:

```ts
export interface RaceEvent {
  // ... campos já existentes ...
  registrationStart?: string;  // data de abertura das inscrições (para countdown)
  whatsapp?: string;           // link direto para WhatsApp do organizador
  strava?: string;             // link para rota no Strava
  results?: EventResult[];     // resultados pós-prova
}

export interface EventResult {
  pos:      number;  // posição geral
  name:     string;  // nome do atleta
  distance: string;  // ex: "5km", "10km"
  category: string;  // ex: "M 30-39"
  time:     string;  // tempo bruto ex: "00:17:42"
  pace:     string;  // ritmo ex: "03:32/km"
}
```

Todos os campos são opcionais (`?`), então os dados existentes continuam funcionando sem alteração.

---

## 2. Dados de seed atualizados

**Arquivo:** `src/lib/data.ts`

Os eventos de exemplo foram atualizados com os novos campos:

| Evento | Novidades |
|---|---|
| Meia do Cerrado | `whatsapp` do organizador |
| Trail Serra dos Pireneus | `whatsapp` + `strava` da rota |
| Giro do Lago *(Em breve)* | `registrationStart: '2026-11-20'` + `whatsapp` |
| Triathlon de Verão *(Em breve)* | `registrationStart: '2026-12-01'` + `whatsapp` |
| Corrida do Parque *(Encerrado)* | Array `results` com 10 atletas classificados |

---

## 3. Página do evento — melhorias

**Arquivo:** `src/components/event-detail.tsx`

### 3.1 Links úteis (WhatsApp e Strava)

Na aba **"Sobre a prova"**, logo abaixo do mapa, aparecem botões de acesso rápido quando o organizador cadastrou os links:

- **WhatsApp** — abre conversa direta com o organizador (ícone MessageCircle)
- **Strava** — abre a rota do percurso no Strava (ícone Timer)

Os botões só renderizam se os campos `event.whatsapp` / `event.strava` existirem no evento.

```
[  WhatsApp do Organizador  ]   [  Ver Rota no Strava  ]
```

### 3.2 Aba "Resultados"

Uma nova aba aparece automaticamente quando o evento tem `results` preenchido (geralmente eventos com status "Encerrado").

A tabela exibe: **Pos / Atleta / Distância / Categoria / Tempo / Ritmo**

Comportamento:
- Se o evento ainda não tem resultados, a aba não aparece
- Uma mensagem informativa acima da tabela explica que são resultados oficiais
- Ícone Trophy no header da aba

### 3.3 Painel de inscrição contextual (aside direito)

Antes o botão de inscrição era sempre o mesmo, independente do estado do evento. Agora ele se adapta a 4 situações:

| Estado | O que aparece |
|---|---|
| **Inscrições abertas** (com vagas) | Botão "Inscrever-se agora" verde |
| **Esgotado** (capacity atingida) | Badge vermelho "Vagas esgotadas" + botão desabilitado |
| **Em breve** | Contador "Inscrições abrem em X dias" + data exata ou "em breve" |
| **Encerrado** | Badge cinza "Inscrições encerradas" + botão desabilitado |

Lógica de cálculo dos dias:
```ts
const soldOut = open && inscritos.length >= event.capacity;
const daysUntilStart = event.registrationStart
  ? Math.max(0, Math.ceil((new Date(event.registrationStart + 'T12:00:00').getTime() - Date.now()) / 86400000))
  : null;
```

### 3.4 "Já tenho inscrição — consultar"

Inspirado no NaCorrida e Corrida e Aventura: o atleta pode consultar sua inscrição existente sem precisar fazer login, digitando apenas o CPF.

**Onde aparece:** Abaixo do botão de inscrição (quando as inscrições estão abertas ou encerradas)

**Fluxo:**
1. Atleta clica em "Já tenho inscrição — consultar"
2. Modal abre com campo para digitar o CPF
3. Sistema busca em `db.registrations` filtrando por `eventId` + CPF normalizado
4. **Se encontrado:** exibe nome, ID da inscrição, distância, status do pagamento, número dorsal e kit escolhido
5. **Se não encontrado:** exibe mensagem de erro com orientação

Estados do resultado:
- `null` — modal ainda não foi usado
- `'not-found'` — CPF não encontrado neste evento
- `Registration` — objeto completo da inscrição encontrada

---

## 4. Funcionalidades adicionais implementadas

### 4.1 Badge de countdown nos cards do catálogo
**Arquivo:** `src/components/catalog.tsx`

Eventos com status "Em breve" exibem no card: "Inscrições em X dias" com ícone de calendário (classe `.countdown-notice`). O atleta vê o prazo direto na listagem sem precisar entrar no evento.

### 4.2 Carteirinha virtual do atleta
**Arquivo:** `src/components/athlete.tsx`

Na área do atleta, inscrições com status "Confirmada" têm um botão com ícone `CreditCard`. O modal exibe:
- Nome completo, evento, distância, categoria, número de peito
- QR Code gerado com `qrcode.react` (valor: `LARGADA:<id>:<eventId>`)
- Data e local da prova

### 4.3 Novos campos no editor de evento
**Arquivo:** `src/components/event-editor.tsx` — aba Informações

O organizador pode cadastrar:
- **Abertura das inscrições** (`registrationStart`) — alimenta o countdown
- **WhatsApp do evento** (`whatsapp`) — link direto
- **Rota no Strava** (`strava`) — link externo

### 4.4 Estilos CSS
**Arquivo:** `src/app/globals.css`

Classes adicionadas: `.countdown-notice`, `.event-links`, `.booking-countdown`, `.find-result`, `.virtual-card`, `.virtual-card-header`, `.virtual-card-event`, `.virtual-card-body`, `.virtual-card-info`, `.virtual-card-qr`.

---

## 5. Resumo dos arquivos modificados

| Arquivo | Status | O que mudou |
|---|---|---|
| `src/lib/types.ts` | Concluido | Novos campos em `RaceEvent`, nova interface `EventResult` |
| `src/lib/data.ts` | Concluido | Seed data com whatsapp, strava, registrationStart, results |
| `src/components/event-detail.tsx` | Concluido | Links úteis, aba Resultados, painel contextual, busca por CPF |
| `src/components/catalog.tsx` | Concluido | Badge countdown nos cards Em breve |
| `src/components/athlete.tsx` | Concluido | Carteirinha virtual com QR Code |
| `src/components/event-editor.tsx` | Concluido | Campos whatsapp, strava, registrationStart |
| `src/app/globals.css` | Concluido | CSS das novas funcionalidades |

---

## 6. Como testar

```bash
cd /home/dayno/lb/lbd/corridaqui
npm run dev
```

Acesse `http://localhost:3000` e navegue para:

- **Resultados:** Entre em qualquer evento com status "Encerrado" (ex: Corrida do Parque) → aba "Resultados"
- **Countdown:** Entre em um evento "Em breve" (ex: Giro do Lago) → aside direito mostra dias restantes
- **WhatsApp/Strava:** Entre em Trail Serra dos Pireneus → aba "Sobre a prova" → botões no final
- **Busca por CPF:** Entre em qualquer evento aberto → botão "Já tenho inscrição — consultar"
  - Use o CPF `111.111.111-11` (ou consulte `src/lib/data.ts` → array `registrations`)

---

*Baseado na análise de: Central de Corridas, Corrida e Aventura, NaCorrida, Eu Na Corrida — Nov/2026*
