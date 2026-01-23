# Identity Service - Generic SaaS Authentication & Identity Management

A production-ready, serverless identity and authentication service built with Clean Architecture, TypeScript, and AWS Lambda. Designed to be a reusable boilerplate for multi-tenant SaaS applications.

## Features

- 🔐 **Authentication**: Email/password with JWT tokens
- ✉️ **Email Verification**: 6-digit verification codes
- 🔑 **Password Recovery**: Secure password reset flow
- 👥 **Multi-tenancy**: Tenant isolation with roles (OWNER, ADMIN, MEMBER)
- 📨 **Invites**: Team member invitation system
- 🎯 **Event-Driven**: EventBridge integration for external services
- 🗄️ **Single Table Design**: DynamoDB with optimized access patterns

## Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Serverless Framework + AWS Lambda
- **Database**: DynamoDB (Single Table Design)
- **ORM**: Dynamoose
- **DI Container**: Inversify
- **Validation**: Zod
- **Middleware**: Middy.js
- **Password Hashing**: bcryptjs
- **JWT**: jsonwebtoken
- **Events**: AWS EventBridge
- **Local Development**: Docker + LocalStack

## Architecture

```
Clean Architecture
├── Core Layer (Domain)
│   ├── Entities
│   ├── Repositories (Interfaces)
│   └── Use Cases (Business Logic)
├── Infrastructure Layer
│   ├── Database (DynamoDB Models)
│   ├── Repositories (Implementations)
│   └── Adapters (External Services)
└── Presentation Layer
    └── Handlers (Lambda Functions)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Start LocalStack
npm run docker:up

# Wait for LocalStack to initialize (check logs)
npm run docker:logs

# Deploy to local
npm run deploy:local

# Start serverless offline (optional)
npm run offline
```

### Environment Variables

Create `.env` file based on `.env.example`:

```env
# Stage
STAGE=local

# DynamoDB
DYNAMODB_TABLE_NAME=identity-service-local
DYNAMODB_ENDPOINT=http://localhost:4566

# EventBridge
IDENTITY_EVENT_BUS_NAME=identity-service-local
EVENTBRIDGE_ENDPOINT=http://localhost:4566

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Invite Link
INVITE_LINK_BASE_URL=http://localhost:3000/signup
```

## 📡 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + create tenant |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/verify-email` | Verify email with 6-digit code |
| POST | `/auth/resend-verification-code` | Resend verification email |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | Logout and revoke refresh token |
| POST | `/auth/request-password-reset` | Request password reset code |
| POST | `/auth/reset-password` | Reset password with code |

### Users (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PATCH | `/users/profile` | Update profile (name, email) |
| POST | `/users/change-password` | Change password |
| DELETE | `/users/{userId}` | Delete user (soft delete) |

### Tenants (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants/me` | Get current tenant details |
| PATCH | `/tenants/me` | Update tenant name |
| GET | `/tenants/me/members` | List all tenant members |

### Invites (Mixed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invites` | Create invite (OWNER/ADMIN only) |
| POST | `/invites/accept` | Accept invite (public) |
| GET | `/invites` | List tenant invites |
| DELETE | `/invites/{token}` | Cancel invite |
| POST | `/invites/{token}/resend` | Resend invite email |

## Data Model

### Single Table Design (DynamoDB)

| Entity | PK | SK | GSI1PK | GSI2PK |
|--------|----|----|--------|--------|
| User | `USER#{userId}` | `PROFILE` | `EMAIL#{email}` | `TENANT#{tenantId}#USERS` |
| Tenant | `TENANT#{tenantId}` | `METADATA` | - | - |
| Invite | `INVITE#{token}` | `METADATA` | - | `TENANT#{tenantId}#INVITES` |
| RefreshToken | `REFRESH_TOKEN#{hash}` | `METADATA` | `USER#{userId}#TOKENS` | - |
| PasswordResetToken | `PASSWORD_RESET#{email}` | `CODE#{code}` | - | - |

## Event Schemas

Events published to EventBridge for external service consumption:

### EmailVerificationRequested
```typescript
{
  eventType: 'EmailVerificationRequested',
  data: {
    email: string,
    fullName: string,
    verificationCode: string,
    template: 'email-verification'
  }
}
```

### InviteCreated
```typescript
{
  eventType: 'InviteCreated',
  data: {
    inviteToken: string,
    email: string,
    inviteLink: string,
    template: 'invite'
  }
}
```

### UserEmailVerified
```typescript
{
  eventType: 'UserEmailVerified',
  data: {
    userId: string,
    email: string,
    tenantId: string,
    role: 'OWNER'
  }
}
```

## Development

```bash
# Build TypeScript
npm run build

# Deploy to dev
npm run deploy:dev

# View LocalStack logs
npm run docker:logs

# Stop LocalStack
npm run docker:down
```

## Project Structure

```
identity-service/
├── src/
│   ├── core/                    # Domain Layer
│   ├── infrastructure/          # Infrastructure Layer
│   ├── shared/                  # Shared Kernel
│   ├── handlers/                # Lambda Handlers
│   ├── schemas/                 # Zod Validation
│   └── config/                  # Configuration
├── serverless/
│   ├── functions/               # Function Definitions
│   ├── resources/               # AWS Resources
│   └── environments/            # Environment Configs
├── scripts/                     # Utility Scripts
└── docker-compose.yml           # LocalStack Setup
```

## License

MIT
