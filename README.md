# Telemedicina SaaS

Plataforma completa de telemedicina construída com Next.js e shadcn/ui. O projeto oferece landing page institucional, fluxo de autenticação, dashboards para pacientes, médicos e administradores, gestão de consultas, planos de assinatura, prontuários e notificações – tudo com suporte a temas claro/escuro.

## Visão Geral

- **Landing page responsiva** com CTA para login/cadastro, menu mobile (Sheet) e FAQ em acordeão.
- **Autenticação** via NextAuth com Prisma Adapter, roles (`CLIENT`, `DOCTOR`, `ADMIN`) e páginas protegidas.
- **Gestão de consultas** com confirmação por médicos, novos status (`PENDING_CONFIRMATION`, `CONFIRMED`, `REJECTED`, `IN_PROGRESS`, etc.) e notificações automáticas.
- **Assinaturas e planos** com seed inicial e páginas dedicadas (`/plans`, `/subscriptions`).
- **Dashboards temáticos** para cada perfil (cliente, médico, admin) com visual consistente e dark mode.
- **Design system** baseado em shadcn/ui, temas `primary #4A90E2` e `secondary #50E3C2`, tipografia Inter e ícones Material Symbols/Lucide.

## Stack Tecnológica

- **Frontend & SSR**: Next.js 15 (App Router, Client Components). 
- **UI/Design System**: Tailwind CSS 4, shadcn/ui, Lucide Icons, Material Symbols.
- **Estado/Autenticação**: NextAuth (SessionProvider), next-themes (ThemeProvider) com alternância dark/light.
- **Back-end**: API Routes do Next.js.
- **Banco de Dados**: PostgreSQL com Prisma ORM.
- **Utilidades**: React Hook Form + Zod, date-fns, Sonner (toasts).

## Estrutura de Pastas

```text
|-- src/
|   |-- app/
|   |   |-- page.tsx              # Landing page institucional
|   |   |-- auth/                 # Login e registro
|   |   |-- dashboard/            # Dashboard do paciente
|   |   |-- doctor/               # Dashboard para médicos
|   |   |-- admin/                # Área administrativa
|   |   |-- consultations/        # Consulta, agendamento e histórico
|   |   |-- plans/                # Visualização de planos
|   |   |-- settings/             # Configurações do usuário
|   |   `-- api/                  # API Routes (consultas, planos, notificações...)
|   |-- components/               # UI compartilhada e ThemeToggle
|   |-- lib/                      # Utilidades e helpers
|   `-- types/                    # Tipagens (ex.: next-auth)
|-- prisma/
|   |-- schema.prisma             # Modelos: User, Plan, Subscription, Consultation, etc.
|   `-- seed.ts                   # Seed inicial de planos
```

Consulte `SETUP.md` para instruções detalhadas de ambiente e `MIGRATION_GUIDE.md` para o fluxo de confirmação de consultas.

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL acessível via `DATABASE_URL`
- npm (ou pnpm/yarn/bun, ajustando os comandos conforme preferir)

## Configuração do Ambiente

1. Clonar o repositório e instalar dependências:

   ```bash
   npm install
   ```

2. Criar `.env` com as variáveis mínimas:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/telemedicina"
   DIRECT_URL="postgresql://user:password@localhost:5432/telemedicina?schema=public"
   NEXTAUTH_SECRET="sua_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Rodar as migrações:

   ```bash
   npx prisma migrate dev
   ```

4. Popular planos padrão (Básico, Premium, Família):

   ```bash
   npm run db:seed
   ```

5. Iniciar o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   A aplicação ficará disponível em `http://localhost:3000`.

## Scripts Disponíveis

- `npm run dev`: inicia o servidor em modo desenvolvimento (Turbopack).
- `npm run build`: cria a build de produção.
- `npm start`: serve a build de produção.
- `npm run lint`: executa ESLint.
- `npm run db:seed`: popula planos iniciais via Prisma Seed.
- `npx prisma studio`: abre o Prisma Studio para visualizar dados.

## Fluxos por Perfil

- **Cliente** (`CLIENT`)
  - Cadastro em `/auth/register`, login em `/auth/login`.
  - Assina planos em `/plans` / `/subscriptions`.
  - Agenda consultas em `/consultations/new` e acompanha no `/dashboard`.

- **Médico** (`DOCTOR`)
  - Acessa `/doctor` para confirmar ou rejeitar consultas pendentes.
  - Atualiza status para `CONFIRMED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED` conforme atendimento.

- **Administrador** (`ADMIN`)
  - Usa `/admin` para gerenciar usuários, consultas, planos e relatórios.

## Dark Mode e Theming

O provedor `ThemeProvider` (arquivo `src/components/providers.tsx`) utiliza `next-themes` para aplicar os temas telemedicina. O componente `ThemeToggle` está presente no header (desktop/mobile) da landing page (`src/app/page.tsx`) e nos dashboards, garantindo experiência consistente.

## Consultas e Notificações

- API de consultas em `src/app/api/consultations/*` inclui endpoints para confirmar (`POST /api/consultations/[id]/confirm`) e rejeitar (`POST /api/consultations/[id]/reject`).
- Notificações são persistidas via modelo `Notification` e exibidas aos usuários quando o status muda.
- Consulte o `MIGRATION_GUIDE.md` para detalhes da migração que adiciona os novos status e do fluxo de confirmação médico → paciente.

## Deploy

1. Configurar variáveis de ambiente em produção (Banco, NextAuth, etc.).
2. Executar `npm run build` e, em seguida, `npm start`.
3. Alternativamente, use plataformas compatíveis com Next.js (ex.: Vercel) configurando `DATABASE_URL`, `NEXTAUTH_SECRET` e demais segredos.

## Contribuição

1. Criar branches a partir de `main`.
2. Garantir que `npm run lint` e `npm run build` passam antes de abrir PR.
3. Atualizar documentação relevante (`README.md`, `SETUP.md`, `MIGRATION_GUIDE.md`) sempre que necessário.

---

Para dúvidas adicionais sobre configuração ou fluxos específicos, verifique os arquivos `SETUP.md` e `MIGRATION_GUIDE.md`, ou abra uma issue descrevendo o cenário.
