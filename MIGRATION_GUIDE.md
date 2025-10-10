# Guia de Migração - Sistema de Confirmação de Consultas

## ⚠️ IMPORTANTE: Execute estes comandos antes de testar

### 1. Gerar nova migração do Prisma

O schema foi atualizado com novos status de consulta. Execute:

```bash
npx prisma migrate dev --name add_consultation_confirmation_status
```

Este comando irá:
- Criar uma nova migração
- Atualizar o banco de dados
- Regenerar o Prisma Client com os novos tipos

### 2. Gerar Prisma Client (caso necessário)

Se houver erros de tipo, execute:

```bash
npx prisma generate
```

### 3. Reiniciar o servidor de desenvolvimento

```bash
npm run dev
```

## 📋 Novos Status de Consulta

Os seguintes status foram adicionados ao enum `ConsultationStatus`:

- **PENDING_CONFIRMATION**: Consulta aguardando confirmação do médico (status inicial)
- **CONFIRMED**: Consulta confirmada pelo médico
- **REJECTED**: Consulta rejeitada pelo médico
- **SCHEDULED**: Consulta agendada (mantido para compatibilidade)
- **IN_PROGRESS**: Consulta em andamento
- **COMPLETED**: Consulta concluída
- **CANCELLED**: Consulta cancelada

## 🔄 Fluxo de Confirmação

### Para o Cliente:
1. Cliente agenda consulta → Status: `PENDING_CONFIRMATION`
2. Aguarda confirmação do médico
3. Recebe notificação quando médico confirmar/rejeitar

### Para o Médico:
1. Vê consultas pendentes na dashboard
2. Pode **Confirmar** → Status muda para `CONFIRMED` + Notificação ao cliente
3. Pode **Rejeitar** → Status muda para `REJECTED` + Notificação ao cliente

## 🆕 Novas APIs

### Confirmar Consulta (Médico)
```
POST /api/consultations/[id]/confirm
```

### Rejeitar Consulta (Médico)
```
POST /api/consultations/[id]/reject
Body: { "reason": "Motivo opcional" }
```

## 🎨 Interface Atualizada

### Dashboard do Médico (`/doctor`)
- Badge amarelo para consultas pendentes
- Botões "Confirmar" e "Rejeitar" para consultas pendentes
- Toast notifications ao confirmar/rejeitar

### Dashboard do Cliente (`/dashboard`)
- Badges de status atualizados
- Notificações quando médico confirmar/rejeitar

## 🔔 Sistema de Notificações

Quando o médico confirma/rejeita:
- Notificação é criada automaticamente para o cliente
- Tipo: `consultation_confirmed` ou `consultation_rejected`
- Contém detalhes da consulta e motivo (se rejeitada)

## 🐛 Troubleshooting

### Erro: "Type 'PENDING_CONFIRMATION' is not assignable..."
**Solução**: Execute `npx prisma generate`

### Erro: "Column 'status' does not exist..."
**Solução**: Execute `npx prisma migrate dev`

### Consultas antigas não aparecem
**Solução**: Consultas antigas podem ter status antigos. Execute uma migração de dados se necessário.
