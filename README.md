# Ops Copilot - Teste Tecnico Full-Stack

## Visao do Produto
Ops Copilot e um mini sistema interno de Operations para registrar incidentes e tarefas em formato de ticket.
A aplicacao entrega:
- criacao, listagem, filtro, busca e edicao de tickets
- pagina de detalhe com secao de IA
- resumo inteligente com proximos passos, nivel de risco e categorias
- autenticacao com rotas protegidas

### Credenciais de teste
- Email: `admin@opscopilot.com`
- Senha: `123456`

### Telas principais
- `/tickets` - lista de tickets com busca, filtros e paginacao
- `/tickets/new` - criacao de novo ticket
- `/tickets/[id]` - detalhe do ticket + secao de IA
- `/login` - login com credenciais

### Stack e versoes do projeto
| Camada | Tecnologia | Versao |
|---|---|---|
| Framework | Next.js (App Router) | `16.1.6` |
| UI | React | `19.2.3` |
| Linguagem | TypeScript | `^5` (strict = true) |
| Estilo | Tailwind CSS | `^4` |
| Componentes | shadcn/ui gerado no projeto | CLI `^4.0.6` |
| Base dos componentes gerados | `@base-ui/react` | `^1.3.0` |
| Auth | NextAuth (Credentials) | `^5.0.0-beta.30` |
| ORM | Prisma | `6.19.2` |
| Banco principal | PostgreSQL | `postgres:15` (Docker Compose) |
| Validacao | Zod | `^4.3.6` |
| Forms | React Hook Form | `^7.71.2` |
| IA SDK | OpenAI + Gemini | `^6.27.0` / `^0.24.1` |
| Testes | Vitest | `^4.1.0` |

## Arquitetura
- Frontend e backend no mesmo projeto Next.js.
- Backend via Route Handlers em `src/app/api/*`.
- Persistencia via Prisma + PostgreSQL.
- Auth com NextAuth Credentials e middleware.
- IA com interface `AIProvider`, implementacao real (`RealAIProvider`) e fallback (`MockAIProvider`).

```mermaid
graph TD
    User[Usuario]

    subgraph Frontend
      Pages[Pages /tickets /tickets/new /tickets/[id] /login]
      Components[Componentes UI + Forms]
    end

    subgraph Backend
      TicketsAPI[/api/tickets + /api/tickets/[id]]
      AIAPI[/api/ai/summarize]
      AuthAPI[/api/auth/[...nextauth]]
    end

    subgraph Core
      Auth[NextAuth + middleware]
      Validation[Zod]
      AIProvider[RealAIProvider ou MockAIProvider]
      RateLimit[Rate limit 10 req/min por usuario]
      AICache[Cache in-memory 24h por ticketId]
    end

    subgraph Data
      Prisma[Prisma Client]
      Postgres[(PostgreSQL)]
    end

    User --> Pages
    Pages --> Components
    Components --> TicketsAPI
    Components --> AIAPI
    Pages --> Auth
    TicketsAPI --> Validation
    AIAPI --> Validation
    TicketsAPI --> Prisma
    AIAPI --> Prisma
    Prisma --> Postgres
    AIAPI --> AIProvider
    AIAPI --> RateLimit
    AIAPI --> AICache
    AuthAPI --> Auth
```

## Decisoes Tecnicas e Trade-offs
- Banco em PostgreSQL: o schema oficial exige `tags String[]`, enums e tipos `@db` que funcionam melhor no Postgres.
- Auth com NextAuth Credentials: simplifica protecao de pagina e API usando middleware unico.
- Padrao de erro unico na API: `{ success: false, error: string, code?: string }` para facilitar frontend e debug.
- Fallback de IA: quando nao existe chave real, entra automaticamente no `MockAIProvider` e a UI mostra banner de `Modo Mock`.
- `@base-ui/react` aparece no projeto porque os componentes gerados pelo fluxo atual do shadcn usam essa base internamente.

## Como rodar localmente
### Opcao 1 - Docker Compose (recomendado)
1. Copie `.env.example` para `.env`.
2. Suba os servicos:
```bash
docker compose up --build
```
3. Acesse `http://localhost:3000`.

### Opcao 2 - Local sem Docker
1. Instale dependencias:
```bash
npm install
```
2. Gere o client do Prisma:
```bash
npx prisma generate
```
3. Aplique schema no banco:
```bash
npx prisma db push
```
4. Rode o seed:
```bash
npx prisma db seed
```
5. Suba a aplicacao:
```bash
npm run dev
```

## Como rodar os testes
```bash
npm test
```

Comandos uteis:
```bash
npm run test:ai
npm run lint
npm run build
```

## Como usar a IA (chave real vs mock)
A rota de IA obrigatoria e:
- `POST /api/ai/summarize`

Entrada aceita:
- `ticketId`
- ou `title + description`

Saida padrao:
- `summary`
- `nextSteps`
- `riskLevel`
- `categories`

Comportamento:
- Com `GEMINI_API_KEY` ou `OPENAI_API_KEY`: usa `RealAIProvider`.
- Sem chave valida: usa `MockAIProvider` automaticamente.
- Na tela de detalhe, aparece banner: `Modo Mock ativo`.

## Uso de IA no desenvolvimento
Ferramentas utilizadas:
- Antigravity (Gemini)
- Codex (GPT-5)

Como foi usado:
- apoio em ajustes de arquitetura e padroes de API
- apoio em testes e revisao de cobertura
- apoio em documentacao tecnica

Revisao manual:
- todas as sugestoes foram revisadas e adaptadas antes de manter no codigo.

## Proximos passos / melhorias futuras
- adicionar historico de mudancas do ticket (auditoria mais detalhada)
- adicionar streaming de resposta da IA na UI
- expandir testes de integracao para `/api/tickets/[id]` e `/api/ai/summarize`
- preparar pipeline CI com lint, test e build automaticos
