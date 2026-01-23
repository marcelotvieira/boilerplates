# Email Service

Serviço de envio de emails transacionais para aplicações SaaS. Consome eventos do EventBridge publicados pelo Identity Service e envia emails usando provedores configuráveis.

## 📋 Índice

- [Características](#características)
- [Arquitetura](#arquitetura)
- [Provedores de Email](#provedores-de-email)
- [Templates de Email](#templates-de-email)
- [Configuração](#configuração)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Deploy](#deploy)
- [Eventos Consumidos](#eventos-consumidos)
- [Estrutura do Projeto](#estrutura-do-projeto)

## ✨ Características

- ✅ **Event-Driven**: Consome eventos do EventBridge (desacoplamento total)
- ✅ **Multi-Provider**: Suporta Mailpit (local) e SendGrid (produção)
- ✅ **Templates Responsivos**: 3 templates HTML profissionais
- ✅ **Retry Automático**: EventBridge retry com Dead Letter Queue
- ✅ **Logs Completos**: Auditoria em DynamoDB com TTL (90 dias)
- ✅ **TypeScript**: Type-safe em todo o código
- ✅ **Clean Architecture**: Fácil manutenção e testes

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   Identity Service                          │
│  Use Cases → EventBridge.publish(EmailEvent)               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  AWS EventBridge                            │
│  Rule: email-service-* → Target: ProcessEmailEvent Lambda  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Email Service Lambda                           │
│                                                              │
│  1. Recebe evento                                           │
│  2. Renderiza template Handlebars                          │
│  3. Seleciona provider (Mailpit/SendGrid)                  │
│  4. Envia email                                             │
│  5. Salva log no DynamoDB                                   │
│                                                              │
│  Em caso de falha:                                          │
│  - Retry automático (3x)                                    │
│  - Dead Letter Queue                                        │
└─────────────────────────────────────────────────────────────┘
            ↓                         ↓
    ┌───────────────┐        ┌──────────────┐
    │  Mailpit      │        │  SendGrid    │
    │  (Local)      │        │  (Produção)  │
    │  HTTP :8025   │        │  HTTPS API   │
    └───────────────┘        └──────────────┘
```

## 📧 Provedores de Email

### Mailpit (Desenvolvimento Local)

**Características:**
- ✅ Aceita HTTP (perfeito para desenvolvimento)
- ✅ Interface web em http://localhost:8025
- ✅ Sem configuração, sem API keys
- ✅ 100% gratuito e open-source
- ✅ Leve (~10MB RAM)

**Uso:**
```bash
# Já configurado no docker-compose.yml
docker-compose up -d mailpit

# Acessar UI
open http://localhost:8025
```

### SendGrid (Produção)

**Características:**
- ✅ Free tier: 100 emails/dia (permanente)
- ✅ Confiável: 99.9% uptime SLA
- ✅ Analytics e tracking
- ✅ Escalável para produção

**Configuração:**
```bash
# 1. Criar API key no SendGrid dashboard
# 2. Armazenar no AWS SSM Parameter Store
aws ssm put-parameter \
  --name /email-service/dev/sendgrid-api-key \
  --value "SG.xxxxx" \
  --type SecureString \
  --region us-east-1
```

## 🎨 Templates de Email

### 1. Email Verification (`email-verification`)

**Quando é enviado**: Após registro de novo usuário

**Variáveis do template:**
- `userName` - Nome completo do usuário
- `code` - Código de 6 dígitos
- `expiresInMinutes` - Tempo de expiração (15 minutos)

**Evento disparador**: `EmailVerificationRequested`

---

### 2. Password Reset (`password-reset`)

**Quando é enviado**: Quando usuário solicita reset de senha

**Variáveis do template:**
- `userName` - Nome completo do usuário
- `code` - Código de 6 dígitos
- `expiresInMinutes` - Tempo de expiração (15 minutos)

**Evento disparador**: `PasswordResetRequested`

---

### 3. Team Invite (`invite`)

**Quando é enviado**: Quando usuário é convidado para um tenant

**Variáveis do template:**
- `recipientEmail` - Email do convidado
- `tenantName` - Nome da organização
- `invitedByName` - Nome de quem convidou
- `role` - Role do convite (OWNER, ADMIN, MEMBER)
- `inviteLink` - Link para aceitar convite
- `expiresInDays` - Tempo de expiração (7 dias)

**Evento disparador**: `InviteCreated`

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### Local (`serverless/environments/local.yml`)

```yaml
NODE_ENV: local
STAGE: local

# Email Provider
EMAIL_PROVIDER: mailpit
MAILPIT_API_URL: http://localhost:8025/api/v1/send

# Sender Info
EMAIL_FROM_ADDRESS: noreply@localhost
EMAIL_FROM_NAME: Your App Name

# DynamoDB
DYNAMODB_TABLE_NAME: email-logs-local
DYNAMODB_ENDPOINT: http://localhost:4566

# EventBridge
IDENTITY_EVENT_BUS_NAME: identity-service-local
EVENTBRIDGE_ENDPOINT: http://localhost:4566
```

#### Dev/Prod (`serverless/environments/dev.yml`)

```yaml
NODE_ENV: production
STAGE: dev

# Email Provider
EMAIL_PROVIDER: sendgrid
SENDGRID_API_KEY: ${ssm:/email-service/dev/sendgrid-api-key}

# Sender Info
EMAIL_FROM_ADDRESS: noreply@yourdomain.com
EMAIL_FROM_NAME: Your App Name

# DynamoDB
DYNAMODB_TABLE_NAME: email-logs-dev

# EventBridge
IDENTITY_EVENT_BUS_NAME: identity-service-dev
```

## 🚀 Desenvolvimento Local

### 1. Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- AWS CLI (para LocalStack)

### 2. Instalação

```bash
# Clone o repositório
cd /home/devmarcelovieira/dev/boilerplates/email-service

# Instalar dependências
npm install
```

### 3. Subir Infraestrutura Local

```bash
# Subir Mailpit e LocalStack
npm run docker:up

# Aguardar containers iniciarem (~10 segundos)
# Verificar logs
npm run docker:logs

# Inicializar LocalStack (EventBridge + DynamoDB)
npm run localstack:init
```

### 4. Deploy Local

```bash
# Compilar TypeScript
npm run build

# Deploy no LocalStack
npm run deploy:local
```

### 5. Testar Envio de Email

#### Opção 1: Via AWS CLI (LocalStack)

```bash
# Enviar evento de teste
aws events put-events \
  --endpoint-url http://localhost:4566 \
  --entries '[{
    "Source": "identity-service",
    "DetailType": "EmailVerificationRequested",
    "Detail": "{\"email\":\"test@example.com\",\"fullName\":\"Test User\",\"verificationCode\":\"123456\",\"expiresAt\":\"2025-01-03T12:00:00Z\",\"template\":\"email-verification\",\"templateData\":{\"userName\":\"Test User\",\"code\":\"123456\",\"expiresInMinutes\":15}}",
    "EventBusName": "identity-service-local"
  }]'
```

#### Opção 2: Via Identity Service

Se você já tem o identity-service rodando localmente, basta usar os endpoints normais (registro, reset de senha, etc) que os emails serão enviados automaticamente via EventBridge.

### 6. Visualizar Email no Mailpit

Abra o navegador em:
```
http://localhost:8025
```

Você verá todos os emails enviados com o HTML renderizado.

## 📦 Deploy para AWS

### Dev Environment

```bash
# 1. Configurar credenciais AWS
export AWS_PROFILE=your-profile

# 2. Criar SendGrid API key e armazenar no SSM
aws ssm put-parameter \
  --name /email-service/dev/sendgrid-api-key \
  --value "SG.your-sendgrid-api-key" \
  --type SecureString

# 3. Build
npm run build

# 4. Deploy
npm run deploy:dev
```

### Produção

```bash
# Deploy para produção
serverless deploy --stage prod
```

## 📨 Eventos Consumidos

O Email Service consome 3 tipos de eventos do Identity Service:

### 1. EmailVerificationRequested

```typescript
{
  source: "identity-service",
  "detail-type": "EmailVerificationRequested",
  detail: {
    email: "user@example.com",
    fullName: "John Doe",
    verificationCode: "123456",
    expiresAt: "2025-01-03T12:15:00Z",
    template: "email-verification",
    templateData: {
      userName: "John Doe",
      code: "123456",
      expiresInMinutes: 15
    }
  }
}
```

### 2. PasswordResetRequested

```typescript
{
  source: "identity-service",
  "detail-type": "PasswordResetRequested",
  detail: {
    email: "user@example.com",
    fullName: "John Doe",
    resetCode: "654321",
    expiresAt: "2025-01-03T12:15:00Z",
    template: "password-reset",
    templateData: {
      userName: "John Doe",
      code: "654321",
      expiresInMinutes: 15
    }
  }
}
```

### 3. InviteCreated

```typescript
{
  source: "identity-service",
  "detail-type": "InviteCreated",
  detail: {
    inviteToken: "uuid-token",
    email: "invite@example.com",
    tenantId: "tenant-uuid",
    tenantName: "Acme Corp",
    role: "ADMIN",
    invitedBy: "user-uuid",
    inviteLink: "https://app.com/auth/accept-invite?token=uuid",
    expiresAt: "2025-01-10T12:00:00Z",
    template: "invite",
    templateData: {
      recipientEmail: "invite@example.com",
      tenantName: "Acme Corp",
      invitedByName: "John Doe",
      role: "ADMIN",
      inviteLink: "https://app.com/auth/accept-invite?token=uuid",
      expiresInDays: 7
    }
  }
}
```

## 🗂️ Estrutura do Projeto

```
email-service/
├── src/
│   ├── core/                          # Domain Layer (business logic)
│   │   └── email/
│   │       ├── entities/
│   │       │   └── email-log.entity.ts
│   │       ├── enums/
│   │       │   ├── email-provider.enum.ts
│   │       │   ├── email-status.enum.ts
│   │       │   └── email-template.enum.ts
│   │       └── interfaces/
│   │           └── email-provider.interface.ts
│   │
│   ├── infrastructure/                # Infrastructure Layer
│   │   ├── providers/
│   │   │   ├── mailpit.provider.ts    # HTTP local
│   │   │   └── sendgrid.provider.ts   # HTTPS produção
│   │   ├── templates/
│   │   │   ├── email-verification.hbs
│   │   │   ├── password-reset.hbs
│   │   │   └── invite.hbs
│   │   └── database/
│   │       ├── dynamodb.config.ts
│   │       └── models/
│   │           └── email-log.model.ts
│   │
│   ├── shared/                        # Shared Layer
│   │   ├── config/
│   │   │   └── environment.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── template-renderer.ts
│   │   └── exceptions/
│   │       └── email.exceptions.ts
│   │
│   └── handlers/                      # Lambda Handlers
│       └── process-email-event.handler.ts
│
├── serverless/
│   ├── environments/
│   │   ├── local.yml
│   │   └── dev.yml
│   ├── resources/
│   │   ├── dynamodb.yml               # Email logs table
│   │   ├── eventbridge.yml            # EventBridge rules
│   │   └── sqs.yml                    # Dead Letter Queue
│   └── functions.yml
│
├── scripts/
│   └── init-localstack.sh             # LocalStack init script
│
├── docker-compose.yml                 # Mailpit + LocalStack
├── serverless.yml
├── tsconfig.json
├── package.json
└── README.md
```

## 🗄️ DynamoDB Schema

### Tabela: `email-logs-{stage}`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **PK** | String | `EMAIL#{emailId}` (UUID) |
| **SK** | String | `LOG` |
| emailId | String | UUID do log |
| email | String | Email do destinatário |
| template | String | `email-verification`, `password-reset`, `invite` |
| status | String | `sent`, `failed`, `pending` |
| provider | String | `mailpit`, `sendgrid` |
| eventId | String | ID do evento EventBridge |
| sentAt | String | ISO timestamp |
| error | String | Mensagem de erro (se falhou) |
| retryCount | Number | Número de tentativas |
| messageId | String | ID retornado pelo provider |
| ttl | Number | Expira em 90 dias (LGPD compliance) |

**GSI**: `EmailIndex` (email + sentAt) - buscar logs por email

## 🔄 Retry e Failure Handling

### Retry Automático (EventBridge)

- **Tentativas**: 3 retries automáticos
- **Intervalo**: Exponential backoff
- **Max Age**: 1 hora

### Dead Letter Queue (SQS)

Eventos que falharam após 3 tentativas vão para:
- **Queue**: `email-service-dlq-{stage}`
- **Retenção**: 14 dias
- **CloudWatch Alarm**: Notifica quando DLQ recebe mensagens

### Logs de Falha

Todas as falhas são registradas no DynamoDB com:
- Status: `failed`
- Error message
- Retry count
- TTL de 90 dias

## 📊 Monitoramento

### CloudWatch Logs

Todos os logs são estruturados em JSON:

```json
{
  "timestamp": "2025-01-03T10:00:00.000Z",
  "level": "INFO",
  "context": "ProcessEmailEventHandler",
  "message": "Email sent successfully",
  "meta": {
    "emailId": "uuid",
    "recipientEmail": "user@example.com",
    "provider": "mailpit"
  }
}
```

### DynamoDB Logs

Query logs por email:
```typescript
// Ver todos os emails enviados para um destinatário
const logs = await getEmailLogsByEmail('user@example.com')
```

### Dead Letter Queue

Monitorar DLQ via CloudWatch:
```bash
# Ver mensagens na DLQ
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/account-id/email-service-dlq-dev \
  --max-number-of-messages 10
```

## 🔐 Segurança

- ✅ **API Keys no SSM**: Nunca em código ou variáveis de ambiente
- ✅ **TTL nos Logs**: Compliance LGPD (90 dias)
- ✅ **Sem Dados Sensíveis**: Logs não contêm senhas ou tokens
- ✅ **IAM Policies**: Least privilege access
- ✅ **Validação de Eventos**: Rejeita eventos malformados

## 💰 Custos Estimados

### Desenvolvimento (Local)
- **Mailpit**: $0 (grátis)
- **LocalStack**: $0 (grátis)
- **Total**: **$0/mês**

### Produção (AWS)
- **Lambda**: ~$0.20/mês (1M invocações no free tier)
- **DynamoDB**: ~$0.00 (free tier)
- **EventBridge**: ~$0.00 (free tier)
- **SendGrid**: $0 (100 emails/dia) ou $19.95 (até 50k emails/mês)
- **Total**: **~$0-20/mês**

## 🆘 Troubleshooting

### Email não foi enviado

1. **Verificar logs do Lambda**:
```bash
serverless logs -f processEmailEvent --stage local --tail
```

2. **Verificar DynamoDB logs**:
```typescript
const log = await getEmailLog('email-id')
console.log(log.error) // Ver erro
```

3. **Verificar DLQ**:
```bash
# Ver mensagens que falharam
aws sqs get-queue-attributes \
  --queue-url <dlq-url> \
  --attribute-names ApproximateNumberOfMessages
```

### Mailpit não está recebendo emails

1. Verificar se Mailpit está rodando:
```bash
curl http://localhost:8025/api/v1/info
```

2. Verificar logs do Mailpit:
```bash
docker-compose logs mailpit
```

### SendGrid retorna erro

1. Verificar API key:
```bash
aws ssm get-parameter \
  --name /email-service/dev/sendgrid-api-key \
  --with-decryption
```

2. Verificar rate limits do SendGrid (100 emails/dia no free tier)

## 📝 Próximos Passos (Opcional)

- [ ] Adicionar mais templates (welcome, newsletter, etc)
- [ ] Implementar testes automatizados (Jest)
- [ ] Suportar anexos em emails
- [ ] Webhooks do SendGrid (open tracking, click tracking)
- [ ] Dashboard de métricas (emails enviados, taxa de falha)
- [ ] Suporte a i18n (templates multilíngues)
- [ ] Rate limiting por destinatário

---

**Built with ❤️ for SaaS developers**
