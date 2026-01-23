# Web App - SaaS Boilerplate Frontend

Next.js 15 application with App Router, shadcn/ui, and TypeScript. Part of the microservices boilerplate ecosystem.

## Tech Stack

- **Next.js 15.5** - App Router with React Server Components
- **React 19** - Latest React with Server Components
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library (New York style)
- **React Hook Form** - Form handling with Zod validation
- **Turbopack** - Fast bundler for dev and build

## Project Structure

```
web-app/
├── app/
│   ├── (pages)/              # Route groups (doesn't affect URLs)
│   │   ├── auth/             # Authentication pages (/login, /register)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx  # Route - renders screen
│   │   │   │   └── actions.ts # Server Actions
│   │   │   └── register/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   └── panel/            # Authenticated pages
│   │       └── settings/
│   │
│   ├── features/             # Feature modules (business logic)
│   │   └── auth/
│   │       ├── api/          # HTTP clients (calls backend)
│   │       │   └── auth.client.ts
│   │       ├── components/   # Feature-specific components
│   │       │   ├── register-form.tsx
│   │       │   └── login-form.tsx
│   │       ├── schemas/      # Zod validation schemas
│   │       │   ├── register.schema.ts
│   │       │   └── login.schema.ts
│   │       ├── screens/      # Complete screen compositions
│   │       │   ├── register-screen.tsx
│   │       │   └── login-screen.tsx
│   │       ├── services/     # Business logic layer
│   │       │   ├── register.service.ts
│   │       │   └── login.service.ts
│   │       └── types/        # TypeScript types
│   │           └── auth.types.ts
│   │
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles + CSS variables
│
├── components/
│   └── ui/                   # shadcn/ui components only
│       ├── button.tsx
│       ├── input.tsx
│       ├── form.tsx
│       └── ...
│
├── lib/
│   ├── api-client.ts         # Base HTTP client wrapper
│   └── utils.ts              # Utilities (cn(), etc)
│
└── middleware.ts             # Next.js middleware (auth checks)
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

### Data Flow

```
User Form Input
    ↓
Client Component (React Hook Form + Zod validation)
    ↓
Server Action (app/(pages)/feature/page/actions.ts)
    ↓
Service Layer (app/features/feature/services/)
    ↓
API Client (app/features/feature/api/)
    ↓
Backend Service (identity-service, etc)
```

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

## Styling

- **Tailwind CSS 4** with CSS variables
- **shadcn/ui New York** style preset
- **Zinc** base color palette
- **Dark mode** support via CSS variables
- **Lucide React** for icons

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
