# Setup do Sistema de Telemedicina

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de que o arquivo `.env` está configurado com as variáveis corretas:

```env
DATABASE_URL="sua_connection_string_aqui"
DIRECT_URL="sua_direct_url_aqui"
NEXTAUTH_SECRET="sua_secret_key_aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Executar Migrações do Prisma

```bash
npx prisma migrate dev
```

### 4. Popular o Banco de Dados (Seed)

**IMPORTANTE**: Execute este comando para criar os planos iniciais no sistema:

```bash
npm run db:seed
```

Ou usando Prisma diretamente:

```bash
npx prisma db seed
```

Este comando criará 3 planos:
- **Básico** - R$ 49,90/mês
- **Profissional** - R$ 99,90/mês (Mais Popular)
- **Premium** - R$ 199,90/mês

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## Fluxo de Uso

### Para Clientes:

1. **Registrar-se** em `/auth/register`
2. **Fazer login** em `/auth/login`
3. **Ver planos disponíveis** em `/plans`
4. **Assinar um plano** clicando em "Assinar Agora"
5. **Agendar consultas** em `/consultations/new` (requer assinatura ativa)
6. **Ver dashboard** em `/dashboard`

### Para Médicos:

1. Fazer login com conta de médico (role: DOCTOR)
2. Acessar dashboard específica em `/doctor`
3. Ver consultas agendadas com você
4. Gerenciar agenda

### Para Administradores:

1. Fazer login com conta admin (role: ADMIN)
2. Acessar painel em `/admin`
3. Gerenciar usuários em `/admin/users`
4. Ver planos em `/admin/plans`
5. Visualizar consultas em `/admin/consultations`
6. Gerar relatórios em `/admin/reports`

## Estrutura de Roles

- **CLIENT**: Usuário padrão, pode assinar planos e agendar consultas
- **DOCTOR**: Médico, pode ver consultas agendadas com ele
- **ADMIN**: Administrador, acesso total ao sistema

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Seed do banco
npm run db:seed

# Prisma Studio (visualizar banco)
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Reset do banco (CUIDADO!)
npx prisma migrate reset
```

## Troubleshooting

### Erro: "Nenhum plano cadastrado"
Execute: `npm run db:seed`

### Erro: "Você precisa de uma assinatura ativa"
1. Vá em `/plans`
2. Escolha um plano
3. Complete o processo de assinatura

### Erro de autenticação
Verifique se `NEXTAUTH_SECRET` está configurado no `.env`

### Erro de conexão com banco
Verifique se `DATABASE_URL` e `DIRECT_URL` estão corretos no `.env`
