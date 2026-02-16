# Identity Service - Referência de APIs

## Visão Geral

**Base URL:** `https://api.example.com` (configurar conforme ambiente)

**Autenticação:** Bearer Token (JWT) no header `Authorization: Bearer {token}`

**Formato de Resposta Padrão:**
```json
{
  "data": {},
  "message": "string (opcional)",
  "timestamp": "ISO8601",
  "path": "string"
}
```

**Formato de Erro Padrão:**
```json
{
  "error": "string",
  "message": "string",
  "statusCode": number,
  "timestamp": "ISO8601",
  "path": "string",
  "details": [{"field": "string", "message": "string"}]
}
```

---

## Referência Rápida

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | /auth/register | Não | Registrar novo usuário |
| POST | /auth/login | Não | Login do usuário |
| POST | /auth/verify-email | Não | Verificar email com código |
| POST | /auth/resend-verification-code | Não | Reenviar código de verificação |
| POST | /auth/refresh-token | Não | Renovar access token |
| POST | /auth/logout | Não | Logout do usuário |
| POST | /auth/request-password-reset | Não | Solicitar reset de senha |
| POST | /auth/reset-password | Não | Resetar senha com código |
| GET | /users/profile | Sim | Obter perfil do usuário |
| PATCH | /users/profile | Sim | Atualizar perfil |
| POST | /users/change-password | Sim | Alterar senha |
| DELETE | /users/{userId} | Sim | Deletar usuário |
| GET | /tenants/me | Sim | Obter tenant atual |
| PATCH | /tenants/me | Sim | Atualizar tenant |
| GET | /tenants/me/members | Sim | Listar membros do tenant |
| GET | /users/me/tenants | Sim | Listar tenants do usuário |
| POST | /invites | Sim | Criar convite |
| GET | /invites | Sim | Listar convites |
| POST | /invites/accept | Não | Aceitar convite |
| DELETE | /invites/{token} | Sim | Cancelar convite |
| POST | /invites/{token}/resend | Sim | Reenviar convite |

---

## 1. Autenticação

### POST /auth/register

**Auth:** Não

**Request:**
```json
{
  "fullName": "string (2-100 chars)",
  "email": "string (email válido, max 255 chars)",
  "password": "string (8-100 chars, deve conter: maiúscula, minúscula, número)"
}
```

**Response 201:**
```json
{
  "userId": "uuid",
  "email": "string",
  "fullName": "string",
  "message": "User registered successfully. Please check your email to verify your account."
}
```

---

### POST /auth/login

**Auth:** Não

**Request:**
```json
{
  "email": "string (email válido)",
  "password": "string"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "fullName": "string"
  },
  "accessToken": "string (JWT)",
  "refreshToken": "string",
  "expiresIn": number
}
```

---

### POST /auth/verify-email

**Auth:** Não

**Request:**
```json
{
  "email": "string (email válido)",
  "code": "string (exatamente 6 dígitos)"
}
```

**Response 200:**
```json
{
  "message": "string",
  "verified": boolean
}
```

---

### POST /auth/resend-verification-code

**Auth:** Não

**Request:**
```json
{
  "email": "string (email válido)"
}
```

**Response 200:**
```json
{
  "message": "Verification code sent to email"
}
```

---

### POST /auth/refresh-token

**Auth:** Não (usa refresh token)

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "fullName": "string"
  },
  "accessToken": "string (JWT novo)",
  "refreshToken": "string (novo)",
  "expiresIn": number
}
```

---

### POST /auth/logout

**Auth:** Não

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response 200:**
```json
{
  "message": "Logout successful"
}
```

---

### POST /auth/request-password-reset

**Auth:** Não

**Request:**
```json
{
  "email": "string (email válido)"
}
```

**Response 200:**
```json
{
  "message": "Password reset code sent to email"
}
```

---

### POST /auth/reset-password

**Auth:** Não

**Request:**
```json
{
  "email": "string (email válido)",
  "code": "string (exatamente 6 dígitos)",
  "newPassword": "string (8-100 chars, deve conter: maiúscula, minúscula, número)"
}
```

**Response 200:**
```json
{
  "message": "Password reset successfully"
}
```

---

## 2. Usuários

### GET /users/profile

**Auth:** Sim (Bearer Token)

**Request:** Sem parâmetros

**Response 200:**
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "emailVerified": boolean,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### PATCH /users/profile

**Auth:** Sim (Bearer Token)

**Request:**
```json
{
  "fullName": "string (2-100 chars)"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "emailVerified": boolean,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### POST /users/change-password

**Auth:** Sim (Bearer Token)

**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (8-100 chars, deve conter: maiúscula, minúscula, número)"
}
```

**Response 200:**
```json
{
  "message": "Password changed successfully"
}
```

---

### DELETE /users/{userId}

**Auth:** Sim (Bearer Token, ADMIN ou próprio usuário)

**Path Params:**
- `userId`: uuid

**Request:** Sem body

**Response 200:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 3. Tenants (Organizações)

### GET /tenants/me

**Auth:** Sim (Bearer Token)

**Request:** Sem parâmetros

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "members": {
    "total": number,
    "data": []
  }
}
```

---

### PATCH /tenants/me

**Auth:** Sim (Bearer Token, requer role ADMIN)

**Request:**
```json
{
  "name": "string (2-100 chars)"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### GET /tenants/me/members

**Auth:** Sim (Bearer Token)

**Request:** Sem parâmetros

**Response 200:**
```json
{
  "total": number,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "role": "ADMIN | MEMBER",
      "joinedAt": "ISO8601"
    }
  ]
}
```

---

## 4. Memberships

### GET /users/me/tenants

**Auth:** Sim (Bearer Token)

**Request:** Sem parâmetros

**Response 200:**
```json
{
  "tenants": [
    {
      "id": "uuid",
      "name": "string",
      "role": "ADMIN | MEMBER",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

---

## 5. Convites

### POST /invites

**Auth:** Sim (Bearer Token, requer role ADMIN)

**Request:**
```json
{
  "email": "string (email válido, max 255 chars)",
  "role": "ADMIN | MEMBER"
}
```

**Response 201:**
```json
{
  "token": "uuid",
  "email": "string",
  "role": "ADMIN | MEMBER",
  "tenantId": "uuid",
  "createdAt": "ISO8601",
  "expiresAt": "ISO8601"
}
```

---

### GET /invites

**Auth:** Sim (Bearer Token)

**Request:** Sem parâmetros

**Response 200:**
```json
{
  "total": number,
  "data": [
    {
      "token": "uuid",
      "email": "string",
      "role": "ADMIN | MEMBER",
      "status": "PENDING | ACCEPTED | EXPIRED",
      "createdAt": "ISO8601",
      "expiresAt": "ISO8601"
    }
  ]
}
```

---

### POST /invites/accept

**Auth:** Não

**Request:**
```json
{
  "token": "uuid",
  "fullName": "string (2-100 chars)",
  "password": "string (8-100 chars, deve conter: maiúscula, minúscula, número)"
}
```

**Response 201:**
```json
{
  "userId": "uuid",
  "email": "string",
  "fullName": "string",
  "tenantId": "uuid",
  "role": "ADMIN | MEMBER",
  "message": "Invite accepted successfully. You can now login with your credentials."
}
```

---

### DELETE /invites/{token}

**Auth:** Sim (Bearer Token, requer role ADMIN)

**Path Params:**
- `token`: uuid

**Request:** Sem body

**Response 200:**
```json
{
  "message": "Invite cancelled successfully"
}
```

---

### POST /invites/{token}/resend

**Auth:** Sim (Bearer Token, requer role ADMIN)

**Path Params:**
- `token`: uuid

**Request:** Sem body

**Response 200:**
```json
{
  "message": "Invite resent successfully"
}
```

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Erro de validação |
| 401 | Unauthorized - Autenticação inválida ou ausente |
| 403 | Forbidden - Sem permissão para acessar recurso |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro do servidor |

---

## Regras de Validação

### Senha
- Mínimo 8 caracteres
- Máximo 100 caracteres
- Deve conter pelo menos uma letra maiúscula
- Deve conter pelo menos uma letra minúscula
- Deve conter pelo menos um número

### Email
- Formato de email válido
- Máximo 255 caracteres
- Convertido para lowercase automaticamente

### Nome Completo
- Mínimo 2 caracteres
- Máximo 100 caracteres

### Código de Verificação
- Exatamente 6 dígitos numéricos

---

## JWT Token Payload

```json
{
  "userId": "uuid",
  "email": "string",
  "fullName": "string",
  "tenantId": "uuid",
  "role": "ADMIN | MEMBER",
  "iat": number,
  "exp": number
}
```

---

## Roles

| Role | Descrição |
|------|-----------|
| ADMIN | Administrador do tenant (pode gerenciar convites, membros, configurações) |
| MEMBER | Membro do tenant (acesso básico) |
