# Ops Copilot — Teste Técnico Full-Stack

Olá! Este é o meu projeto para o teste técnico da Adapt EdTech de desenvolvedor Full-Stack. O **Ops Copilot** é um sistema inteligente para gestão de incidentes e tarefas, com o diferencial de utilizar Inteligência Artificial para analisar tickets e sugerir os próximos passos.

## 🚀 Visão do Produto
O objetivo foi criar uma ferramenta que ajude equipes de operações (DevOps/SRE) a não apenas registrarem tickets, mas também a obterem uma triagem automática. A IA resume o problema, avalia o risco e sugere ações imediatas, economizando tempo precioso no dia a dia.

## 🛠️ Arquitetura do Projeto
Construí o sistema utilizando o que há de mais moderno no ecossistema Web:

- **Next.js 15 (App Router)**: Para uma aplicação rápida e com excelente SEO/UX.
- **TypeScript**: Garantindo segurança no código e tipagem forte.
- **Prisma & SQLite/PostgreSQL**: Modelagem de dados eficiente. Atualmente configurado para rodar com SQLite por padrão para facilitar sua avaliação, mas pronto para escalar no Docker.
- **Docker & Docker Compose**: O ambiente é totalmente containerizado, facilitando o "play" em qualquer máquina.
- **NextAuth.js (v5)**: Autenticação segura com suporte a Credenciais e proteção de rotas.
- **Shadcn/UI & Tailwind**: Interface limpa, moderna e responsiva.

## 🐳 Como Rodar com Docker (O jeito mais rápido!)
Se você tem o **Docker Desktop** instalado, basta rodar um comando para subir o banco e a aplicação:

1.  Clone o repositório.
2.  Crie seu arquivo `.env` (use o `.env.example`).
3.  No terminal, execute:
    ```bash
    docker compose up --build
    ```
4.  Acesse `http://localhost:3000`.

## 💻 Setup Local (Sem Docker)
1. Instale as dependências: `npm install`
2. Crie o banco: `npx prisma db push`
3. Rode o dev: `npm run dev`

### Credenciais de Teste:
- **E-mail**: `admin@opscopilot.com`
- **Senha**: `123456`
*(Nota: Você pode criar novos usuários via Prisma Studio: `npx prisma studio`)*

## 🤖 Feature de IA
Implementei uma interface de provedor (`AIProvider`) que permite trocar facilmente entre modelos reais e mocks:
- **Fallback**: Se você não tiver uma API Key, o sistema usa o `MockAIProvider` para você ver como a interface se comporta.
- **Real**: Com uma `GEMINI_API_KEY`, o sistema utiliza o modelo **Gemini 1.5 Flash** para gerar resumos reais.

## 🎯 Decisões Técnicas e Trade-offs
- **Docker**: Optei por containerizar para garantir que minha solução rode exatamente igual na sua máquina. Tive que fazer alguns ajustes no `Dockerfile` para o Prisma rodar perfeitamente em imagens leves (Alpine).
- **SQLite**: Usei como padrão inicial para que você não precise configurar um banco Postgres só para testar, mas deixei o código preparado para banco de dados robustos.
- **Segurança**: As senhas são guardadas como hash usando `bcryptjs`, seguindo boas práticas de mercado.

## 🤝 Jornada com IA (Antigravity)
Durante o desenvolvimento deste teste, utilizei o **Antigravity (Gemini 2.5 Pro)** como meu parceiro de programação. 
- Ele me ajudou na configuração fina do Docker, na estruturação do NextAuth v5 e na documentação.
- **Revisão Manual**: Todas as sugestões do agente foram revisadas por mim para garantir que atendiam exatamente ao que foi solicitado no teste técnico. Esse processo acelerou meu desenvolvimento em cerca de 3x, permitindo focar mais na regra de negócio e experiência do usuário.

---
*Feito por mim (com uma ajudinha da IA).*
