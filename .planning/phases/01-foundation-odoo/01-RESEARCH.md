# Phase 1: Foundation & Odoo - Research

**Researched:** 2026-03-26
**Domain:** Odoo 18 integration, Turborepo monorepo, multi-tenant Next.js, design system
**Confidence:** MEDIUM-HIGH

## Summary

Phase 1 transforms a vanilla Next.js 16 app into a Turborepo monorepo with two apps (dashboard, booking), four shared packages (shared, odoo-client, ui, ai), and an Odoo 18 Community backend running in Docker. The critical path is proving the Odoo JSON-RPC integration works reliably from Next.js server components and API routes -- this is the GO/NO-GO gate at Week 2.

The project currently has a bare `create-next-app` scaffold (Next.js 16.2.1, React 19.2.4, Tailwind v4, TypeScript 5, npm). It must be restructured into a pnpm + Turborepo monorepo. Odoo 18 Community has native multi-database support via `dbfilter` which maps directly to the multi-tenancy requirement. Authentication requires a dual approach: Odoo session/API key auth for server-to-Odoo communication, and Auth.js (NextAuth v5) for browser-to-Next.js user sessions.

**Primary recommendation:** Build the Odoo Docker stack and typed JSON-RPC client FIRST (days 1-5), prove CRUD + auth works, then scaffold the monorepo around it. If Odoo integration fails the Week 2 gate, the monorepo structure and UI package remain valid -- only the backend changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Odoo 18 Community deployed via Docker with PostgreSQL, accessible via JSON-RPC | Docker Compose config, JSON-RPC endpoint patterns, `@rlizana/odoo-rpc` library, Odoo 18 official Docker image |
| FOUND-02 | Next.js monorepo scaffolded (apps/dashboard, apps/booking, packages/shared, packages/odoo-client, packages/ai) | Turborepo + pnpm workspace patterns, official Turborepo Next.js guide, monorepo structure from ARCHITECTURE.md |
| FOUND-03 | Typed Odoo client wrapping JSON-RPC with auth, CRUD, and error handling | `@rlizana/odoo-rpc` as base, typed wrapper pattern, error handling strategy, session vs API key auth |
| FOUND-04 | Authentication system (staff + member login) | Auth.js v5 credentials provider calling Odoo authenticate, JWT sessions, dual user-type support |
| FOUND-05 | Multi-tenancy via Odoo multi-database (one DB per club, subdomain routing) | Odoo `dbfilter` with `%d` subdomain pattern, Next.js middleware subdomain extraction, tenant registry |
| FOUND-06 | Shared UI component library (emerald design system) | shadcn/ui monorepo setup, Tailwind v4, shared `packages/ui` pattern |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x (already installed as 16.2.1) | SSR, App Router, Server Components, API routes | Already in project, latest stable |
| React | 19.x (already installed as 19.2.4) | UI framework | Already in project |
| TypeScript | 5.x (already installed) | Type safety | Already in project |
| Turborepo | 2.x | Monorepo build orchestration | Official Vercel monorepo tool, best Next.js integration |
| pnpm | 9.x | Package manager | Required by Turborepo for workspaces, fast, disk-efficient |
| Odoo | 18 Community (Docker) | Backend ERP, data layer | Decided in STATE.md, handles 60-70% of business logic |
| PostgreSQL | 16 (Docker) | Primary database | Required by Odoo 18 |
| @rlizana/odoo-rpc | 1.0.7+ | JSON-RPC client base | Lightweight, tested on Odoo 16/17/18, works in Node.js and browser |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Auth.js (NextAuth v5) | 5.x | Browser session management | Staff and member login to Next.js dashboard/booking apps |
| shadcn/ui | latest | Accessible UI components | Design system base for packages/ui |
| Tailwind CSS | 4.x (already installed) | Utility-first CSS | Already in project |
| Zod | 3.x/4.x (already installed via Next.js) | Runtime validation | API request/response validation, form schemas |
| date-fns + date-fns-tz | 4.x / 1.x | Date/time handling with timezone | Tee time scheduling, DST handling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @rlizana/odoo-rpc | Raw fetch to /jsonrpc | More control but must handle cookies, session, retries manually |
| Auth.js v5 | Clerk | Clerk is faster to ship but costs money and adds external dependency |
| pnpm | npm (current) | npm works but Turborepo docs recommend pnpm for workspaces |
| shadcn/ui | Radix UI direct | shadcn gives pre-styled components, less work for MVP |

**Installation (Phase 1 packages):**
```bash
# Global tooling
npm install -g pnpm turbo

# Root monorepo init (after restructure)
pnpm add -D turbo

# packages/odoo-client
pnpm add @rlizana/odoo-rpc

# apps/dashboard
pnpm add next-auth@beta  # Auth.js v5

# packages/ui (after shadcn init)
pnpm add tailwindcss @tailwindcss/postcss

# packages/shared
pnpm add zod date-fns date-fns-tz
```

## Architecture Patterns

### Recommended Project Structure

```
clubos/
  apps/
    dashboard/              # Staff management app (Next.js 16)
      app/
        (auth)/             # Auth pages (login)
        (dashboard)/        # Authenticated pages
          layout.tsx        # Dashboard shell with sidebar
          page.tsx          # Home / tee sheet placeholder
        api/
          auth/[...nextauth]/route.ts  # Auth.js handler
          odoo/[...path]/route.ts      # Odoo proxy (optional)
      middleware.ts          # Subdomain extraction + auth check
    booking/                # Player-facing booking portal (Next.js 16)
      app/
        page.tsx            # Public booking page (stub for Phase 1)
      middleware.ts
  packages/
    shared/                 # Types, constants, validators, utilities
      src/
        types/
          odoo.ts           # Odoo model types (res.partner, etc.)
          auth.ts           # User session types
          tenant.ts         # Tenant config types
        tenants.ts          # Tenant registry (static config for now)
        validators/         # Zod schemas
    odoo-client/            # Typed Odoo JSON-RPC wrapper
      src/
        client.ts           # ClubOSClient class
        auth.ts             # Authentication helpers
        errors.ts           # Error classes
        types.ts            # Request/response types
        models/             # Per-model typed methods
          base.ts           # Generic CRUD
          partner.ts        # res.partner (members)
    ui/                     # Shared React component library
      src/
        components/
          button.tsx
          card.tsx
          input.tsx
          ...
        styles/
          globals.css       # Emerald design system tokens
    ai/                     # AI client SDK (stub for Phase 1)
      src/
        index.ts
    eslint-config/          # Shared ESLint rules
    tsconfig/               # Shared TypeScript configs
  odoo/
    addons/                 # Custom Odoo modules (empty for Phase 1)
    config/
      odoo.conf             # Odoo server configuration
    docker/
      docker-compose.yml    # Odoo + PostgreSQL + Redis
      Dockerfile            # Custom Odoo image if needed
  turbo.json
  package.json
  pnpm-workspace.yaml
```

### Pattern 1: Odoo JSON-RPC Client (Backend-for-Frontend)

**What:** All Odoo communication goes through Next.js server layer. Browser never talks to Odoo.
**When to use:** Every data fetch and mutation.

```typescript
// packages/odoo-client/src/client.ts
import OdooRPC from '@rlizana/odoo-rpc';

export interface OdooConfig {
  url: string;     // e.g., https://api.clubos.io
  db: string;      // e.g., clubos_nevelmeade (per-tenant)
}

export class ClubOSClient {
  private rpc: OdooRPC;
  private authenticated = false;

  constructor(config: OdooConfig) {
    this.rpc = new OdooRPC({ url: config.url, db: config.db });
  }

  async authenticate(login: string, password: string): Promise<number> {
    const uid = await this.rpc.login(login, password);
    this.authenticated = true;
    return uid;
  }

  async searchRead<T>(
    model: string,
    domain: any[][],
    fields: string[],
    options?: { limit?: number; offset?: number; order?: string }
  ): Promise<T[]> {
    this.ensureAuth();
    return this.rpc.searchRead(model, domain, fields, options);
  }

  async create(model: string, values: Record<string, any>): Promise<number> {
    this.ensureAuth();
    return this.rpc.create(model, values);
  }

  async write(model: string, ids: number[], values: Record<string, any>): Promise<boolean> {
    this.ensureAuth();
    return this.rpc.write(model, ids, values);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    this.ensureAuth();
    return this.rpc.unlink(model, ids);
  }

  private ensureAuth() {
    if (!this.authenticated) throw new OdooAuthError('Not authenticated');
  }
}
```

### Pattern 2: Multi-Tenant Subdomain Middleware

**What:** Next.js middleware extracts subdomain, resolves tenant, injects context.
**When to use:** Every request to dashboard or booking app.

```typescript
// apps/dashboard/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySubdomain } from '@clubos/shared/tenants';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  // Extract subdomain: nevelmeade.app.clubos.io -> nevelmeade
  const subdomain = hostname.split('.')[0];

  const tenant = getTenantBySubdomain(subdomain);
  if (!tenant) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // Pass tenant info via headers to server components
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-tenant-db', tenant.db);
  return response;
}
```

### Pattern 3: Auth.js with Odoo Credentials Provider

**What:** NextAuth v5 credentials provider that validates against Odoo.
**When to use:** Staff login to dashboard, member login to booking portal.

```typescript
// apps/dashboard/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ClubOSClient } from '@clubos/odoo-client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const tenantDb = request.headers.get('x-tenant-db');
        if (!tenantDb) return null;

        const client = new ClubOSClient({
          url: process.env.ODOO_URL!,
          db: tenantDb,
        });

        try {
          const uid = await client.authenticate(
            credentials.email as string,
            credentials.password as string
          );
          // Fetch user details from Odoo
          const [user] = await client.searchRead('res.users', [['id', '=', uid]], ['name', 'email', 'groups_id']);
          return { id: String(uid), name: user.name, email: user.email };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
```

### Pattern 4: Odoo Docker Compose (Dev + Production)

```yaml
# odoo/docker/docker-compose.yml
services:
  odoo:
    image: odoo:18
    ports:
      - "8069:8069"
    volumes:
      - odoo-data:/var/lib/odoo
      - ../addons:/mnt/extra-addons
      - ../config:/etc/odoo
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - HOST=postgres
      - USER=odoo
      - PASSWORD=${ODOO_DB_PASSWORD:-odoo}

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=${ODOO_DB_PASSWORD:-odoo}
      - POSTGRES_DB=postgres
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  odoo-data:
  postgres-data:
```

### Anti-Patterns to Avoid

- **Calling Odoo from client components:** Exposes credentials, creates CORS issues. Always go through server components or API routes.
- **Modifying Odoo core modules:** Never fork or patch core. Use module inheritance to extend.
- **Storing Odoo sessions in the browser:** Use API keys or a service account for server-to-Odoo auth. Browser auth goes through Auth.js.
- **Building the monorepo before proving Odoo works:** Prove JSON-RPC CRUD in a simple script first, then scaffold around it.
- **Using npm instead of pnpm:** The project currently uses npm. Must migrate to pnpm for Turborepo workspace support.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-RPC protocol handling | Custom fetch wrapper for Odoo protocol | `@rlizana/odoo-rpc` | Handles session cookies, error codes, re-auth automatically |
| User session management | Custom JWT/cookie system | Auth.js v5 (NextAuth) | CSRF protection, session rotation, provider ecosystem |
| UI component library | Custom button/input/card from scratch | shadcn/ui + Tailwind | Accessible, tested, themeable, monorepo-ready |
| Monorepo build system | Custom build scripts | Turborepo | Caching, dependency graph, parallel builds |
| Date/timezone handling | Raw `Date` or `Intl.DateTimeFormat` | date-fns + date-fns-tz | DST edge cases, timezone conversion, locale support |
| Form validation | Manual if/else validation | Zod schemas | Type inference, composable, works with React Hook Form |

**Key insight:** Phase 1 is plumbing. Every hour spent building custom plumbing is an hour not spent proving the Odoo integration works. Use established libraries aggressively.

## Common Pitfalls

### Pitfall 1: Odoo Session Auth in Serverless Context

**What goes wrong:** `@rlizana/odoo-rpc` uses session-based auth with cookies. On Vercel (serverless), each function invocation is a fresh process -- session cookies don't persist between requests.
**Why it happens:** Odoo's web client assumes a persistent browser session. Serverless functions are stateless.
**How to avoid:** Use Odoo API keys (available in Odoo 14+) instead of password-based sessions for the server-to-Odoo connection. Create a dedicated `clubos-api` user in Odoo with an API key. The `@rlizana/odoo-rpc` library supports passing API key as password. Re-authenticate on every request or use a short-lived connection pool.
**Warning signs:** Intermittent "Session expired" errors in production, works fine in local dev.

### Pitfall 2: Odoo Multi-Database dbfilter Misconfiguration

**What goes wrong:** Odoo requires `dbfilter` to be set in production when using multi-database. If misconfigured, Odoo shows the database selector page instead of the right database.
**Why it happens:** The `%d` placeholder in dbfilter maps to the first subdomain, but this only works if Odoo receives the actual hostname (not a proxied internal hostname).
**How to avoid:** Since Next.js is the frontend (not Odoo's web UI), we control database selection in the `odoo-client` by passing the `db` parameter explicitly on every JSON-RPC call. Set `dbfilter = .*` in odoo.conf and let Next.js middleware handle tenant-to-database mapping. Do NOT rely on Odoo's built-in dbfilter for our multi-tenancy.
**Warning signs:** Database selector appearing, wrong database being queried.

### Pitfall 3: npm to pnpm Migration Breaking node_modules

**What goes wrong:** The project uses npm with a flat `node_modules`. Switching to pnpm (required for Turborepo workspaces) changes the node_modules structure to a content-addressable store with symlinks. Some packages with hardcoded paths break.
**Why it happens:** pnpm uses a strict dependency resolution that prevents phantom dependencies.
**How to avoid:** Delete `node_modules` and `package-lock.json` before running `pnpm install`. Use `shamefully-hoist=true` in `.npmrc` only if specific packages break. Test the build immediately after migration.
**Warning signs:** Module not found errors after switching to pnpm.

### Pitfall 4: Next.js 16 Monorepo Transpilation

**What goes wrong:** Shared packages in `packages/` aren't transpiled by Next.js by default. Importing from `@clubos/ui` throws "Unexpected token" errors because Next.js doesn't process files outside the app directory.
**Why it happens:** Next.js only transpiles its own app directory and `node_modules` packages that are explicitly configured.
**How to avoid:** Use `transpilePackages` in `next.config.ts` for each internal package:
```typescript
// apps/dashboard/next.config.ts
const nextConfig = {
  transpilePackages: ['@clubos/ui', '@clubos/shared', '@clubos/odoo-client'],
};
```
**Warning signs:** SyntaxError on import from workspace packages.

### Pitfall 5: Odoo Database Creation is NOT Automated via API

**What goes wrong:** There is no clean JSON-RPC endpoint to programmatically create a new Odoo database. The `/web/database/create` endpoint is a web form, not an API.
**Why it happens:** Odoo's database manager is designed as a web UI tool, not an API service.
**How to avoid:** For Phase 1, create databases manually via the Odoo web UI at `/web/database/manager` or via command line: `odoo -d clubos_newclub -i base --stop-after-init`. For production, write a shell script or use the Odoo CLI. Automated tenant provisioning is a Phase 2+ feature.
**Warning signs:** Trying to build automated club onboarding in Phase 1 -- out of scope.

### Pitfall 6: Tailwind v4 + shadcn/ui Compatibility

**What goes wrong:** The project uses Tailwind CSS v4 (with `@tailwindcss/postcss`). Some shadcn/ui components may expect Tailwind v3 configuration patterns (tailwind.config.js).
**Why it happens:** Tailwind v4 changed its configuration approach -- CSS-first config instead of JS config.
**How to avoid:** Use the latest shadcn/ui CLI which supports Tailwind v4. When initializing shadcn in a monorepo, point it at the `packages/ui` directory. Test component rendering immediately after setup.
**Warning signs:** Missing CSS variables, components rendering without styles.

## Code Examples

### Odoo JSON-RPC Raw Call (for understanding the protocol)

```typescript
// What @rlizana/odoo-rpc does under the hood
const response = await fetch('http://localhost:8069/jsonrpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        'clubos_nevelmeade',     // database
        2,                        // uid (from authenticate)
        'admin-api-key',          // password or API key
        'res.partner',            // model
        'search_read',            // method
        [[['is_company', '=', false]]],  // domain
        { fields: ['name', 'email'], limit: 10 }  // kwargs
      ],
    },
  }),
});
```

### Tenant Registry (Static for Phase 1)

```typescript
// packages/shared/src/tenants.ts
export interface Tenant {
  id: string;
  db: string;
  name: string;
  subdomain: string;
}

const TENANTS: Record<string, Tenant> = {
  'nevelmeade': {
    id: 'nevelmeade',
    db: 'clubos_nevelmeade',
    name: 'Nevel Meade Golf Course',
    subdomain: 'nevelmeade',
  },
  'demo': {
    id: 'demo',
    db: 'clubos_demo',
    name: 'ClubOS Demo',
    subdomain: 'demo',
  },
};

export function getTenantBySubdomain(subdomain: string): Tenant | undefined {
  return TENANTS[subdomain];
}

export function getAllTenants(): Tenant[] {
  return Object.values(TENANTS);
}
```

### Odoo Configuration for Multi-Database

```ini
# odoo/config/odoo.conf
[options]
admin_passwd = your-master-password
db_host = postgres
db_port = 5432
db_user = odoo
db_password = odoo
; Allow all databases (Next.js controls routing, not Odoo)
dbfilter = .*
; Enable multi-database listing
list_db = True
; Addons path
addons_path = /mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons
```

### Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Odoo XML-RPC | Odoo JSON-RPC (and JSON-2 API in Odoo 19+) | Odoo 17+ | JSON-RPC is 40-60% smaller, native JSON, same features |
| NextAuth v4 | Auth.js v5 | 2024-2025 | New config pattern, better Edge support, App Router native |
| Tailwind v3 (JS config) | Tailwind v4 (CSS-first config) | 2025 | No more tailwind.config.js, CSS @theme directive |
| npm workspaces | pnpm workspaces + Turborepo | 2023+ | Stricter deps, faster installs, better monorepo support |
| create-next-app (current state) | Turborepo create (monorepo template) | N/A | Must restructure existing app into monorepo |

**Deprecated/outdated:**
- XML-RPC for Odoo: Still works in Odoo 18 but deprecated, removal in Odoo 22 (2028)
- JSON-RPC legacy `/jsonrpc` endpoint: Works in Odoo 18, replaced by JSON-2 API in Odoo 19+. 2+ years of runway.
- NextAuth v4 import paths: v5 uses `next-auth` and `@auth/core`, not the old `next-auth/react` pattern

## Open Questions

1. **@rlizana/odoo-rpc serverless compatibility**
   - What we know: Library uses `fetch-cookie` for session management in Node.js
   - What's unclear: Whether API key auth bypasses the session cookie requirement entirely
   - Recommendation: Test in first 2 days. If API key auth works without cookies, no issue. If not, create a thin fetch wrapper that re-authenticates per request.

2. **Odoo 18 Docker image on Windows (dev)**
   - What we know: Bank develops on Windows 11. Odoo Docker image is Linux-based.
   - What's unclear: Whether Docker Desktop on Windows handles the volume mounts for addons correctly
   - Recommendation: Test Docker Compose on Bank's machine in day 1. If issues, use WSL2 for the Docker context.

3. **Next.js 16 + Auth.js v5 compatibility**
   - What we know: Next.js 16 is very new. Auth.js v5 targets Next.js 14/15.
   - What's unclear: Whether Auth.js v5 beta works cleanly with Next.js 16 App Router
   - Recommendation: Test immediately. Fallback: implement a simpler JWT-based auth with Odoo credentials (no library).

4. **shadcn/ui + Tailwind v4 in monorepo**
   - What we know: shadcn/ui has a monorepo guide. Tailwind v4 support was added.
   - What's unclear: Whether the monorepo CLI works with Tailwind v4's CSS-first config approach
   - Recommendation: Test shadcn init in packages/ui with Tailwind v4. If issues, pin Tailwind v3 for the UI package only.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.x (recommended -- fastest for monorepo, native TypeScript) |
| Config file | None -- see Wave 0 |
| Quick run command | `pnpm turbo test --filter=@clubos/odoo-client` |
| Full suite command | `pnpm turbo test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Odoo Docker starts, PostgreSQL healthy, JSON-RPC responds | integration | `pnpm test --filter=@clubos/odoo-client -- --run tests/integration/connection.test.ts` | No -- Wave 0 |
| FOUND-02 | Monorepo builds all packages and apps without errors | smoke | `pnpm turbo build` | No -- Wave 0 |
| FOUND-03 | Odoo client CRUD operations (search_read, create, write, unlink) | unit + integration | `pnpm test --filter=@clubos/odoo-client -- --run` | No -- Wave 0 |
| FOUND-04 | Auth flow: login with Odoo credentials, JWT session created | integration | `pnpm test --filter=dashboard -- --run tests/integration/auth.test.ts` | No -- Wave 0 |
| FOUND-05 | Subdomain resolves to correct tenant DB, queries correct database | unit + integration | `pnpm test --filter=@clubos/shared -- --run tests/tenants.test.ts` | No -- Wave 0 |
| FOUND-06 | UI components render correctly with emerald theme | unit | `pnpm test --filter=@clubos/ui -- --run` | No -- Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm turbo test --filter=[changed packages]`
- **Per wave merge:** `pnpm turbo build && pnpm turbo test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `packages/odoo-client/vitest.config.ts` -- test config for odoo-client
- [ ] `packages/odoo-client/tests/unit/client.test.ts` -- unit tests for CRUD methods
- [ ] `packages/odoo-client/tests/integration/connection.test.ts` -- integration test against real Odoo Docker
- [ ] `packages/shared/vitest.config.ts` -- test config for shared
- [ ] `packages/shared/tests/tenants.test.ts` -- tenant resolution tests
- [ ] `packages/ui/vitest.config.ts` -- test config for UI components
- [ ] `apps/dashboard/vitest.config.ts` -- test config for dashboard app
- [ ] Root `vitest.workspace.ts` -- Vitest workspace for monorepo
- [ ] Vitest install: `pnpm add -Dw vitest @testing-library/react @testing-library/jest-dom jsdom`

## Sources

### Primary (HIGH confidence)

- [Odoo 18 Web Services / JSON-RPC Documentation](https://www.odoo.com/documentation/18.0/developer/howtos/web_services.html) -- JSON-RPC endpoint format and authentication
- [Odoo 18 System Configuration / Deployment](https://www.odoo.com/documentation/18.0/administration/on_premise/deploy.html) -- dbfilter, multi-database, production config
- [@rlizana/odoo-rpc on npm](https://www.npmjs.com/package/@rlizana/odoo-rpc) -- Library API, tested Odoo versions
- [Turborepo + Next.js Guide](https://turborepo.dev/docs/guides/frameworks/nextjs) -- Official monorepo setup
- [shadcn/ui Monorepo Guide](https://ui.shadcn.com/docs/monorepo) -- Shared UI package in Turborepo
- [Auth.js v5 Credentials Provider](https://authjs.dev/getting-started/providers/credentials) -- Custom backend auth
- [Next.js Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant) -- Subdomain routing patterns
- [Vercel Platforms Starter Kit](https://vercel.com/templates/next.js/platforms-starter-kit) -- Multi-tenant Next.js template

### Secondary (MEDIUM confidence)

- [Odoo Forum: v18 dbfilter for multiple databases and domains](https://www.odoo.com/forum/help-1/v18-dbfilter-for-multiple-databases-and-domains-275516) -- Community guidance on multi-db config
- [Odoo Forum: JSON API, API Keys and user connection](https://www.odoo.com/forum/help-1/json-api-api-keys-and-user-connection-292915) -- API key auth clarification
- [Build a Production Monorepo with Turborepo (2026)](https://noqta.tn/en/tutorials/turborepo-nextjs-monorepo-shared-packages-2026) -- Recent tutorial
- [minhng92/odoo-18-docker-compose on GitHub](https://github.com/minhng92/odoo-18-docker-compose) -- Docker Compose reference

### Tertiary (LOW confidence)

- [Odoo multi-tenant architecture with white-label support (forum)](https://www.odoo.com/forum/help-1/whats-the-best-architecture-to-manage-multi-tenant-odoo-community-setup-with-white-label-support-289650) -- Community opinions, needs validation
- Next.js 16 + Auth.js v5 compatibility -- No confirmed reports yet, needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Odoo 18, Next.js 16, Turborepo are all decided and documented. Library versions verified.
- Architecture: HIGH -- Monorepo structure, BFF pattern, multi-tenant middleware all well-documented in upstream research.
- Pitfalls: MEDIUM-HIGH -- Odoo integration pitfalls well-researched. Serverless + Odoo session auth is the main risk needing day-1 validation.
- Validation: MEDIUM -- No test infrastructure exists. Vitest is standard for Turborepo monorepos but Wave 0 setup is needed.

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days -- stack is stable, no fast-moving dependencies)
