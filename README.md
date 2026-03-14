# Ops Copilot - Teste Tecnico Full-Stack

## Visao geral do produto
Ops Copilot e um mini sistema para operacoes internas, com foco em registro de incidentes e tarefas via tickets, incluindo suporte de IA para resumo e proximos passos.

Funcionalidades implementadas:
- criacao de ticket
- listagem de tickets
- busca por titulo e descricao
- filtros por status, prioridade e tags
- paginacao
- tela de detalhe do ticket
- edicao de ticket
- autenticacao com rotas protegidas
- resumo com IA (real ou mock fallback)

### Credenciais de teste
- Email: `admin@opscopilot.com`
- Senha: `123456`

### Rotas principais da aplicacao
- `/login`
- `/tickets`
- `/tickets/new`
- `/tickets/[id]`
- `/tickets/[id]/edit`

### URL do sistema em producao
- `https://ops-copilot-40ipz9i8j-julio-paulos-projects.vercel.app`

## Stack tecnica
| Camada | Tecnologia | Versao |
|---|---|---|
| Framework | Next.js (App Router) | `16.1.6` |
| UI | React | `19.2.3` |
| Linguagem | TypeScript | `^5` (strict = true) |
| Estilo | Tailwind CSS | `^4` |
| Componentes | shadcn/ui | CLI `^4.0.6` |
| Auth | NextAuth (Credentials) | `^5.0.0-beta.30` |
| ORM | Prisma | `6.19.2` |
| Banco | PostgreSQL | `postgres:15` |
| Validacao | Zod | `^4.3.6` |
| Formulario | React Hook Form | `^7.71.2` |
| IA | OpenAI + Gemini | `^6.27.0` / `^0.24.1` |
| Testes | Vitest | `^4.1.0` |

## Arquitetura
- Frontend e backend no mesmo projeto Next.js.
- Backend implementado com Route Handlers em `src/app/api/*`.
- Persistencia com Prisma + PostgreSQL.
- Auth com NextAuth Credentials + middleware.
- IA com interface `AIProvider`, provider real e fallback mock.

```mermaid
flowchart TD
    user[Usuario] --> ui[Telas Next.js]
    ui --> auth[NextAuth Credentials]
    ui --> api[Route Handlers API]
    api --> val[Validacao Zod]
    api --> prisma[Prisma Client]
    prisma --> db[(PostgreSQL)]
    api --> ai[AIProvider]
    api --> rate[Rate limit 10 req por minuto por usuario]
    api --> cache[Cache em memoria 24h por ticket]
```

## Fluxos funcionais (Mermaid)
### 1) Fluxo de login e protecao
```mermaid
flowchart LR
    u[Usuario] --> login[Tela login]
    login --> signin[Sign in credentials]
    signin --> authz[Authorize no NextAuth]
    authz --> users[(Tabela users)]
    users --> authz
    authz -->|sucesso| tickets[Tela tickets]
    authz -->|falha| login
```

### 2) Fluxo de tickets (listar, criar, editar)
```mermaid
flowchart TD
    ui[Tela tickets e formulario] --> listApi[GET api tickets]
    ui --> createApi[POST api tickets]
    ui --> updateApi[PATCH api tickets por id]
    listApi --> prisma[Prisma]
    createApi --> prisma
    updateApi --> prisma
    prisma --> ticketsDb[(Tabela tickets)]
```

### 3) Fluxo de IA (resumo e fallback)
```mermaid
flowchart TD
    n1["Tela detalhe do ticket"] --> n2["POST /api/ai/summarize"]
    n2 --> n3["Entrada: ticketId ou title + description"]
    n3 --> n4["Enriquecimento com tickets semelhantes"]
    n4 --> n5["Selecao de provider"]
    n5 -->|com chave| n6["GeminiProvider ou OpenAIProvider"]
    n5 -->|sem chave| n7["MockAIProvider"]
    n6 --> n8["Validacao e normalizacao da resposta"]
    n7 --> n8
    n8 --> n9["Cache por ticketId (24h)"]
    n9 --> n10["Saida: summary, nextSteps, riskLevel, categories"]
```

## Requisitos do teste tecnico atendidos
### Dominio Ticket
- `id`
- `title`
- `description`
- `status` (`OPEN | IN_PROGRESS | DONE`)
- `priority` (`LOW | MEDIUM | HIGH`)
- `tags` (`string[]`)
- `createdAt`
- `updatedAt`

### API de IA obrigatoria
- Endpoint: `POST /api/ai/summarize`
- Entrada: `ticketId` ou `{ title, description }`
- Saida: `summary`, `nextSteps`, `riskLevel`, `categories`
- Contrato: `AIProvider.generateSummary(input): Promise<AIResponse>`
- Fallback sem chave: `MockAIProvider`
- Cache por `ticketId`: implementado em memoria com TTL de 24h

### Autenticacao obrigatoria
- Implementada com NextAuth Credentials.
- Rotas de criacao e edicao de tickets protegidas por sessao.

### Extras implementados
- edicao de ticket
- mudanca de status
- rate limit no endpoint de IA

## Decisoes tecnicas
- PostgreSQL foi escolhido para suportar melhor enums e `String[]` no schema do ticket.
- NextAuth Credentials simplifica protecao de UI e API com uma estrategia unica.
- Validacao com Zod no frontend e backend para manter contrato consistente.
- Fallback mock garante funcionalidade mesmo sem chave de IA configurada.

## Variaveis de ambiente
Use `.env.example` como base:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` (opcional)
- `GEMINI_API_KEY` (opcional)

## Como rodar localmente
### Opcao A - Docker Compose
1. Copie `.env.example` para `.env`.
2. Execute:
```bash
docker compose up --build
```
3. Acesse `http://localhost:3000`.

### Opcao B - Sem Docker
1. Instale dependencias:
```bash
npm install
```
2. Gere client Prisma:
```bash
npx prisma generate
```
3. Aplique schema:
```bash
npx prisma db push
```
4. Rode seed:
```bash
npx prisma db seed
```
5. Inicie app:
```bash
npm run dev
```

## Como rodar testes e validacoes
```bash
npm test
npm run lint
npm run build
```

Comando focado em IA:
```bash
npm run test:ai
```

## Integracao de IA: chave real x fallback mock
- Se `GEMINI_API_KEY` estiver definida, o provider Gemini e priorizado.
- Senao, se `OPENAI_API_KEY` estiver definida, usa OpenAI.
- Sem chaves validas, entra automaticamente em modo mock.
- Na UI de detalhe do ticket, o banner indica quando o modo mock esta ativo.

## Uso de IA durante o desenvolvimento
Ferramentas utilizadas:
- Antigravity (Gemini)
- Codex (GPT-5)

Como foi aplicado:
- suporte a arquitetura e desenho de fluxos
- revisao de contratos de API e validacoes
- apoio em testes e documentacao

Todas as sugestoes foram revisadas manualmente antes da adocao.

## Melhorias futuras
- historico de alteracoes de tickets (auditoria)
- streaming de resposta de IA na UI
- mais testes de integracao para endpoints de tickets e IA
- pipeline CI com lint, test e build
