# Ops Copilot - Teste Tecnico Full-Stack

## Visao do produto
Ops Copilot e um mini sistema para gestao de tickets operacionais (incidentes e tarefas), com apoio de IA para triagem:
- resumo automatico do ticket
- proximos passos sugeridos
- classificacao de risco
- categorias sugeridas

## Stack e versoes reais do projeto

| Camada | Tecnologia | Versao em uso |
|---|---|---|
| Framework web | Next.js (App Router) | `16.1.6` |
| UI | React | `19.2.3` |
| Linguagem | TypeScript | `^5` |
| Estilo | Tailwind CSS | `^4` |
| Componentes base | `@base-ui/react` | `^1.3.0` |
| Auth | NextAuth | `^5.0.0-beta.30` |
| ORM | Prisma | `6.19.2` |
| Prisma Client | `@prisma/client` | `^6.19.2` |
| Banco padrao da app | SQLite | via `DATABASE_URL=file:./dev.db` |
| IA (SDK) | OpenAI SDK | `^6.27.0` |
| IA (SDK) | Google Generative AI SDK | `^0.24.1` |
| Validacao | Zod | `^4.3.6` |
| Formulario | React Hook Form | `^7.71.2` |
| Testes | Vitest | `^4.1.0` |
| Lint | ESLint | `^9` |
| Runtime Docker | Node | `20-alpine` (Dockerfile) |
| Banco no compose | PostgreSQL image | `postgres:15` |

Observacao importante:
- O `docker-compose.yml` sobe um servico `postgres`, mas a app hoje esta configurada para usar SQLite (`DATABASE_URL=file:./prisma/dev.db`).

## Arquitetura resumida
- Frontend + Backend no mesmo projeto Next.js (App Router + Route Handlers).
- Prisma para persistencia de tickets e usuarios.
- NextAuth Credentials para autenticacao.
- Feature de IA com interface `AIProvider` para alternar entre providers reais e mock.
- Cache de IA por ticket (`aiSummary`, `aiNextSteps`, `aiRiskLevel`, `aiCategories`).
- Rate limit simples na rota de IA.

## Funcionalidades implementadas
- Login com credenciais.
- Criacao de ticket.
- Listagem de tickets.
- Busca por titulo/descricao.
- Filtros por status e prioridade.
- Detalhe de ticket.
- Analise com IA no detalhe do ticket.

## Feature de IA e fallback
Interface principal:
- `AIProvider.generateSummary(input): Promise<AIResponse>`

Providers:
- `GeminiProvider` (modelo: `gemini-2.5-flash`)
- `OpenAIProvider` (modelo: `gpt-4o-mini`)
- `MockAIProvider` (fallback sem chave)

Regra de selecao atual (`getAIProvider`):
1. Se existir `GEMINI_API_KEY`, usa Gemini.
2. Senao, se existir `OPENAI_API_KEY`, usa OpenAI.
3. Senao, usa `MockAIProvider`.

## Como rodar com Docker
Pre-requisito: Docker Desktop.

```bash
docker compose up -d --build
```

Acesse:
- `http://localhost:3000`

Parar ambiente:
```bash
docker compose down
```

## Como rodar local (sem Docker)
1. Instalar dependencias:
```bash
npm install
```
2. Aplicar schema no banco local:
```bash
npx prisma db push
```
3. Rodar seed (usuario admin):
```bash
npx prisma db seed
```
4. Subir app:
```bash
npm run dev
```

## Credenciais de teste
- Email: `admin@opscopilot.com`
- Senha: `123456`

## Variaveis de ambiente
Base:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

IA (opcionais):
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

Sem chave de IA, o sistema segue funcional com `MockAIProvider`.

## Testes e qualidade
Rodar lint:
```bash
npm run lint
```

Rodar todos os testes:
```bash
npm test
```

Rodar somente testes de IA/fallback:
```bash
npm run test:ai
```

Rodar build de producao:
```bash
npm run build
```

## Decisoes tecnicas e trade-offs
- SQLite como padrao para facilitar avaliacao local.
- Campo `tags` armazenado como JSON string no SQLite (simplifica MVP).
- Fallback de IA para nao bloquear demo sem API key.
- Cache de IA por ticket para reduzir custo e latencia.
- Rate limit basico para proteger endpoint de IA.

## Uso de IA no desenvolvimento
Ferramentas usadas:
- Antigravity (Gemini 2.5 Pro)
- Codex (GPT-5)

Como foi usado:
- apoio em estruturacao de arquitetura e ajustes de implementacao
- apoio em revisao de testes e documentacao

Revisao manual:
- toda sugestao foi revisada e ajustada antes de integrar no codigo final.

## Arquitetura do Sistema

```mermaid
graph TD
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#10b981,stroke:#14532d,color:#fff
    classDef database fill:#8b5cf6,stroke:#4c1d95,color:#fff
    classDef ai fill:#f59e0b,stroke:#92400e,color:#fff
    classDef auth fill:#ef4444,stroke:#991b1b,color:#fff

    User[Usuario Final]

    subgraph Frontend ["Frontend (Next.js App Router)"]
        UI[UI Components<br/>Base UI + Tailwind CSS]
        Pages[Pages & Server Components<br/>/ • /tickets • /tickets/[id] • /tickets/new]
    end

    subgraph AuthLayer ["Autenticacao"]
        Auth[Middleware/Proxy + Cookies<br/>NextAuth Credentials]
    end

    subgraph Backend ["Backend (Route Handlers)"]
        API[API Routes<br/>/api/tickets<br/>/api/ai/summarize]
        Validation[Zod Validation + Error Handling]
    end

    subgraph Database ["Banco de Dados"]
        Prisma[Prisma ORM]
        DB[(SQLite<br/>ou Postgres via Docker)]
        Cache[Cache de IA<br/>aiSummary + aiNextSteps]
    end

    subgraph AI ["Inteligencia Artificial"]
        AIProvider[AIProvider Interface<br/>Gemini / OpenAI / Mock]
        Mock[MockAIProvider<br/>fallback sem API key]
    end

    User --> UI
    UI --> Pages
    Pages --> Auth
    Pages --> API
    API --> Validation
    Validation --> Prisma
    Prisma --> DB
    Prisma --> Cache
    API --> AIProvider
    AIProvider --> Mock
    AIProvider -.->|"Chama API externa"| RealAI[Gemini ou OpenAI]
```
