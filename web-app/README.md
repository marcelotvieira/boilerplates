# Web App - SaaS Boilerplate Frontend

Next.js 15 application with App Router, shadcn/ui, and TypeScript. Part of the microservices boilerplate ecosystem.

## Tech Stack

- **Next.js 15.5** - App Router with React Server Components
- **React 19** - Latest React with Server Components
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library (New York style)
- **React Hook Form** - Form handling with Zod validation
- **next-themes** - Dark mode support
- **Turbopack** - Fast bundler for dev and build

## Project Structure

```
web-app/
├── app/
│   ├── (pages)/              # Route group for public/auth pages
│   │   └── auth/             # Authentication pages (/login, /register)
│   │       ├── layout.tsx    # Blocks authenticated users
│   │       ├── login/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts
│   │       └── register/
│   │           ├── page.tsx
│   │           └── actions.ts
│   │
│   ├── (protected)/          # Route group for authenticated pages
│   │   ├── layout.tsx        # Requires auth + header with logout
│   │   └── panel/
│   │       └── page.tsx
│   │
│   ├── api/auth/             # API routes
│   │   └── refresh/route.ts  # Token refresh endpoint
│   │
│   ├── features/             # Feature modules (business logic)
│   │   └── auth/
│   │       ├── api/          # HTTP clients (calls backend)
│   │       ├── components/   # Feature-specific components
│   │       ├── schemas/      # Zod validation schemas
│   │       ├── screens/      # Complete screen compositions
│   │       ├── services/     # Business logic layer
│   │       └── types/        # TypeScript types
│   │
│   ├── layout.tsx            # Root layout (ThemeProvider)
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles + CSS variables
│
├── components/
│   ├── ui/                   # shadcn/ui components only
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── mode-toggle.tsx       # Dark mode toggle button
│
├── lib/
│   ├── api-client.ts         # HTTP client with auto token injection
│   ├── auth/
│   │   ├── session.ts        # Session utilities (getSession, etc)
│   │   └── actions.ts        # Auth actions (logout)
│   └── utils.ts              # Utilities (cn(), etc)
│
└── middleware.ts             # Route protection (auth checks)
```

## Architecture Patterns

### Feature-First Organization

Each feature is self-contained in `app/features/{feature}/`:

- **api/** - HTTP clients for backend communication
- **components/** - UI components specific to the feature
- **schemas/** - Zod validation schemas (shared between client/server)
- **screens/** - Complete page screens (composition of components)
- **services/** - Business logic layer (used by Server Actions)
- **types/** - TypeScript interfaces and types

### Data Flow (Component → API)

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE (Server Component)                                        │
│  app/(pages)/auth/login/page.tsx                                │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN (Client Component - UI composition)                     │
│  app/features/auth/screens/login-screen.tsx                     │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  FORM (Client Component - form logic + UI)                      │
│  app/features/auth/components/login-form.tsx                    │
│  - useActionState para Server Action                            │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  ACTION (Server Action - validação + orquestração)              │
│  app/(pages)/auth/login/actions.ts                              │
│  - Valida com Zod (schema)                                      │
│  - Chama service                                                │
│  - Gerencia cookies                                             │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE (Lógica de negócio + tratamento de erros)              │
│  app/features/auth/services/login.service.ts                    │
│  - Chama API client                                             │
│  - Transforma erros em mensagens amigáveis                      │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  API CLIENT (Feature-specific - tipagem forte)                  │
│  app/features/auth/api/auth.client.ts                           │
│  - Métodos tipados: authApi.login(), authApi.register()         │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  API CLIENT (Global - HTTP + auth handling)                     │
│  lib/api-client.ts                                              │
│  - Injeta Authorization header automaticamente                  │
│  - Logout em 401                                                │
│  - Tratamento de erros de rede                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication System

### Token Refresh Flow

```
Usuário acessa rota protegida (/panel)
        ↓
   middleware.ts
        ↓
┌─ accessToken existe? ─────────────────────────┐
│   SIM → permite acesso                        │
│   NÃO → refreshToken existe?                  │
│         SIM → redireciona para /api/auth/refresh
│         NÃO → redireciona para /auth/login    │
└───────────────────────────────────────────────┘
```

**Quando ocorre o refresh:**
- Quando o `accessToken` expira e o usuário tenta acessar uma rota protegida
- O middleware detecta a ausência do `accessToken` mas presença do `refreshToken`
- Redireciona para `/api/auth/refresh?redirect=/panel`
- A API route chama o backend, obtém novos tokens, seta cookies e redireciona de volta

### Session Management

| Método | Onde usar | Retorno |
|--------|-----------|---------|
| `getSession()` | Server Components, Server Actions, API Routes | `{ user, tenant }` ou `null` |
| `getAccessToken()` | Server-side quando precisa só do token | `string` ou `null` |
| `isAuthenticated()` | Server-side para check booleano | `boolean` |
| Cookie `sessionData` | Client Components (via `document.cookie`) | JSON string com `{ user, tenant }` |

**Arquivo:** `lib/auth/session.ts`

### Cookie Structure

| Cookie | httpOnly | Conteúdo |
|--------|----------|----------|
| `accessToken` | ✅ Sim | JWT token para API |
| `refreshToken` | ✅ Sim | Token para refresh |
| `sessionData` | ❌ Não | JSON com user + tenant (para display) |

### API Client Auto-Token

O `lib/api-client.ts` injeta automaticamente o token baseado no endpoint:

```typescript
// Endpoints públicos (não requerem token)
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  // ...
]

// Qualquer outro endpoint → adiciona Authorization header
// 401 de qualquer rota → logout automático
```

### Route Groups

| Route Group | Comportamento |
|-------------|---------------|
| `(pages)/auth/*` | Bloqueia usuários autenticados → redireciona para `/panel` |
| `(protected)/*` | Requer autenticação → redireciona para `/auth/login` |

---

### Server Actions Pattern

Server Actions live in `app/(pages)/` next to their pages:

```tsx
// app/(pages)/auth/register/actions.ts
'use server'

import { registerService } from '@/app/features/auth/services/register.service'
import { registerSchema } from '@/app/features/auth/schemas/register.schema'

export async function registerAction(formData: FormData) {
  // 1. Validate with Zod
  const parsed = registerSchema.safeParse({...})
  if (!parsed.success) return { errors: parsed.error.flatten() }

  // 2. Delegate to service
  const result = await registerService(parsed.data)

  // 3. Handle result (cookies, redirect, etc)
  if (result.ok) redirect('/verify-email')
  return { error: result.error }
}
```

### Page Pattern

Pages are thin layers that just render screens:

```tsx
// app/(pages)/auth/register/page.tsx
import { RegisterScreen } from '@/app/features/auth/screens/register-screen'

export default function RegisterPage() {
  return <RegisterScreen />
}
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)
- Backend services running (identity-service on port 3001)

### Installation

```bash
# Install dependencies
pnpm install

# Add required packages
pnpm add react-hook-form @hookform/resolvers zod

# Add shadcn components as needed
npx shadcn@latest add form button input label card
```

### Development

```bash
# Run dev server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Create `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# For production
# NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

## Integration with Backend Services

This frontend connects to:

- **identity-service** (port 3001) - Authentication, users, tenants
- **email-service** (port 3002) - Transactional emails (via EventBridge)

Backend services should be running for full functionality.

## Styling & Theming

- **Tailwind CSS 4** with CSS variables
- **shadcn/ui New York** style preset
- **Zinc** base color palette
- **Lucide React** for icons

### Dark Mode

Implementado com `next-themes`:

```typescript
// components/theme-provider.tsx - Provider wrapper
// components/mode-toggle.tsx - Toggle button (dropdown)
```

**Configuração no layout raiz:**
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Uso em componentes:**
```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
setTheme('dark') // 'light' | 'dark' | 'system'
```

**CSS Variables:** Definidas em `globals.css` para `:root` (light) e `.dark` (dark)

## Key Decisions

1. **Feature-first structure** - Better scalability and cohesion
2. **Server Actions** - Leverages Next.js 15 features
3. **Client Components for forms** - Better UX with React Hook Form
4. **Server Components by default** - Performance and SEO
5. **shadcn/ui** - Copy-paste components for full control
6. **Route groups** - Clean URLs without sacrificing organization

## Best Practices

- **Server Components** by default, Client Components only when needed (`'use client'`)
- **Colocation** - Server Actions next to pages they serve
- **Type safety** - Zod schemas for runtime validation + TypeScript types
- **Separation of concerns** - Pages → Screens → Components
- **Reusability** - Services and API clients are framework-agnostic
- **Progressive enhancement** - Forms work without JavaScript when using Server Actions

## Related Projects

Part of the boilerplates ecosystem:

- `identity-service` - Authentication microservice
- `email-service` - Email microservice
- `web-app` - This frontend application

See `../DIRECTORY.md` for full project structure.
