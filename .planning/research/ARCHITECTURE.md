# ClubOS Architecture Research

**Date:** 2026-03-26
**Status:** Research complete, pending team review

---

## 1. Monorepo Structure

Turborepo monorepo. One repo, clear boundaries, shared code, independent deploys.

```
clubos/
├── apps/
│   ├── dashboard/          # Staff management app (Next.js)
│   ├── booking/            # Player-facing booking portal (Next.js)
│   └── ai-worker/          # AI inference service (Node.js / Python)
├── packages/
│   ├── shared/             # Types, constants, validators, utilities
│   ├── ui/                 # Shared React component library
│   ├── ai/                 # AI client SDK (churn, pricing, upsell)
│   ├── odoo-client/        # Typed Odoo JSON-RPC client wrapper
│   ├── eslint-config/      # Shared ESLint rules
│   └── tsconfig/           # Shared TypeScript configs
├── odoo/
│   ├── addons/             # Custom Odoo modules (tee_sheet, club_pos, etc.)
│   ├── config/             # Odoo server config (odoo.conf)
│   └── docker/             # Docker Compose for local Odoo + PostgreSQL
├── infra/                  # Terraform / deployment configs
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### Why This Structure
- `apps/dashboard` and `apps/booking` deploy independently to Vercel
- `packages/odoo-client` is the single point of contact with Odoo -- every app imports it, never calls Odoo directly
- `packages/ai` wraps all AI model calls -- swap models without touching app code
- `odoo/addons/` contains custom Odoo modules that extend Community Edition
- `ai-worker` is optional at MVP -- can start with AI in Next.js API routes, extract later

---

## 2. How Next.js Talks to Odoo

### The Problem
Odoo exposes JSON-RPC (POST to `/jsonrpc`), not REST. The web client uses it natively. JSON-RPC payloads are 40-60% smaller than XML-RPC and work naturally with TypeScript.

### The Pattern: Backend-for-Frontend (BFF) via Next.js API Routes

```
Browser/Client
    │
    ▼
Next.js App (Vercel)
    │
    ├── React Server Components (read data via server-side Odoo calls)
    ├── Server Actions (mutations: book tee time, update member, process sale)
    └── API Route Handlers /api/* (webhooks, external integrations, real-time)
         │
         ▼
    packages/odoo-client  ←── Typed wrapper around JSON-RPC
         │
         ▼
    Odoo Server (Docker / Cloud VM)
         │
         ▼
    PostgreSQL
```

### Key Design Decisions

1. **Next.js API routes act as the API gateway** -- the browser never talks to Odoo directly
2. **`packages/odoo-client`** is a typed TypeScript SDK that wraps JSON-RPC calls:
   - `odoo.authenticate(db, login, apiKey)`
   - `odoo.searchRead('tee.time.slot', domain, fields)`
   - `odoo.create('pos.order', values)`
   - `odoo.callMethod('tee.time.slot', 'book', [slotId, memberId])`
3. **Server Components fetch data server-side** -- no client-side Odoo calls, no CORS issues, no exposed credentials
4. **Server Actions handle mutations** -- form submissions, bookings, POS transactions go through validated server actions
5. **API Route Handlers for**: webhook receivers (Stripe payments, Odoo events), external API (for third-party integrations), WebSocket/SSE endpoints (real-time tee sheet updates)

### Authentication Flow
- Odoo API keys (not passwords) stored as environment variables
- Dedicated `clubos-api` bot user in Odoo with scoped permissions per model
- Next.js middleware handles club staff/member auth (NextAuth.js or similar)
- Odoo API key is never exposed to the browser

---

## 3. Data Flow: Member Books a Tee Time

### End-to-End Sequence

```
1. MEMBER opens booking portal (apps/booking)
   │
2. React Server Component loads available slots
   │  → Server-side call: odoo.searchRead('tee.time.slot', [['date','=','2026-04-01'], ['available','=',true]])
   │  → Odoo returns slot data from PostgreSQL
   │  → RSC renders tee sheet with available times
   │
3. MEMBER selects 9:00 AM, 4-some, clicks "Book"
   │
4. Server Action fires: bookTeeTime(slotId, memberId, partySize)
   │  → Validates: member in good standing? slot still open? party size valid?
   │  → odoo.callMethod('tee.time.slot', 'book', { slotId, memberId, partySize })
   │  → Odoo module runs business logic:
   │      - Checks slot availability (race condition guard via DB lock)
   │      - Creates tee.time.booking record
   │      - Links to res.partner (member)
   │      - Triggers dynamic pricing calculation
   │      - Updates slot availability count
   │  → Returns booking confirmation
   │
5. AI LAYER (async, non-blocking):
   │  → After booking confirmed, event triggers AI pipeline
   │  → Demand forecast updates (this time slot getting hot?)
   │  → Member behavior logged (plays weekday AM, books 3 days ahead)
   │  → Dynamic pricing adjustment for remaining slots
   │
6. CONFIRMATION returned to member
   │  → Booking details rendered
   │  → Email/SMS confirmation via Odoo mail module or external (SendGrid)
   │
7. STAFF DASHBOARD (apps/dashboard) reflects change
   │  → Tee sheet auto-updates (polling or WebSocket)
   │  → AI sidebar shows: "9 AM block 80% full, suggest $5 price bump for remaining slots"
```

### Where Each Layer Lives

| Step | Layer | Tech |
|------|-------|------|
| Display tee sheet | Next.js RSC | `apps/booking` + `packages/odoo-client` |
| Validate & submit booking | Next.js Server Action | `apps/booking` + `packages/odoo-client` |
| Business logic & DB write | Odoo custom module | `odoo/addons/tee_sheet/` |
| AI insights (async) | AI pipeline | `packages/ai` → `apps/ai-worker` or API route |
| Real-time dashboard update | WebSocket/SSE | `apps/dashboard` API route |
| Email confirmation | Odoo mail or SendGrid | Odoo module or Next.js API route |

---

## 4. AI Pipeline Architecture

### Phase 1 (MVP): AI in Next.js API Routes

Start simple. AI calls live in Next.js API route handlers, using `packages/ai` as the SDK.

```
apps/dashboard/app/api/ai/pricing/route.ts
    │
    ▼
packages/ai/src/pricing.ts
    │  → Fetches historical booking data from Odoo
    │  → Calls Gemini / Claude API for demand forecast
    │  → Returns pricing recommendation
    │
    ▼
Dashboard renders AI insight card
```

**Why start here:**
- Zero infrastructure overhead
- Vercel handles scaling
- Good enough for 1-10 clubs
- Bank can build it solo

### Phase 2 (Scale): Separate AI Worker Service

When AI workload grows (50+ clubs, batch processing, model training):

```
apps/ai-worker/              # Standalone Node.js or Python service
├── src/
│   ├── pipelines/
│   │   ├── churn-prediction.ts     # Runs nightly batch
│   │   ├── demand-forecast.ts      # Runs hourly per club
│   │   ├── dynamic-pricing.ts      # Triggered on booking events
│   │   └── upsell-engine.ts        # Real-time POS context
│   ├── models/                      # Model configs, prompt templates
│   └── queue.ts                     # Bull/BullMQ job queue
```

**Trigger patterns:**
- **Event-driven:** Odoo webhook fires on booking → AI worker processes
- **Scheduled:** Cron jobs for nightly churn scores, hourly demand forecasts
- **Real-time:** POS transaction triggers upsell recommendation (<200ms)

**Where it runs:**
- Railway, Render, or a dedicated VM alongside Odoo
- NOT on Vercel (long-running jobs don't fit serverless)

### AI Features by Priority

| Feature | Trigger | Latency Target | MVP Phase |
|---------|---------|----------------|-----------|
| Dynamic tee time pricing | Booking event + hourly cron | <500ms (event), batch OK (cron) | Phase 1 |
| Member churn prediction | Nightly batch | Batch OK | Phase 1 |
| Smart POS upsell | POS transaction start | <200ms | Phase 2 |
| Demand forecasting | Hourly cron | Batch OK | Phase 1 |
| Member 360 insights | On profile view | <1s | Phase 1 |

---

## 5. Multi-Tenancy: Serving Multiple Clubs

### Odoo's Native Multi-Tenancy

Odoo natively supports multiple databases on a single server. Each club gets its own PostgreSQL database with full data isolation.

### Architecture

```
                    ┌─────────────────────────┐
                    │     Vercel (Next.js)     │
                    │                          │
                    │  Middleware: read host    │
                    │  → nevelmeade.clubos.app │
                    │  → resolve to club_id    │
                    │  → set tenant context    │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   packages/odoo-client    │
                    │                          │
                    │  Select Odoo DB based    │
                    │  on tenant context       │
                    │  (db='clubos_nevelmeade')│
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ PostgreSQL DB:  │ │ PostgreSQL DB:  │ │ PostgreSQL DB:  │
    │ clubos_nevelmeade│ │ clubos_denver1 │ │ clubos_demo    │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### How It Works

1. **DNS:** Each club gets a subdomain: `nevelmeade.clubos.app`, `denver1.clubos.app`
2. **Next.js Middleware:** Reads hostname, resolves to `club_id` via a tenant registry (Redis or in-memory map)
3. **Tenant Context:** Every request carries `clubId` and `odooDb` through React context / headers
4. **Odoo Client:** `packages/odoo-client` accepts `db` parameter on every call -- Odoo's JSON-RPC requires it
5. **Odoo Server:** Single Odoo instance, `dbfilter` disabled, database selected per-request
6. **Data isolation:** Complete -- each club's data is in a separate PostgreSQL database

### Tenant Registry

```typescript
// packages/shared/src/tenants.ts
const TENANTS = {
  'nevelmeade': { db: 'clubos_nevelmeade', name: 'Nevel Meade Golf Course', plan: 'pro' },
  'denver1':    { db: 'clubos_denver1',    name: 'Denver Country Club',    plan: 'enterprise' },
  'demo':       { db: 'clubos_demo',       name: 'ClubOS Demo',            plan: 'starter' },
};
```

Start with a static config file. Move to a `tenants` database table when onboarding needs to be self-serve.

### Branding / White-Label (Future)
- Each tenant record can include logo URL, primary color, custom domain
- Next.js middleware injects tenant theme into CSS variables
- Full white-label is a Phase 2 feature

---

## 6. Caching Strategy

### Tiered Caching

| Data Type | Freshness Requirement | Cache Strategy | TTL |
|-----------|-----------------------|----------------|-----|
| Tee sheet availability | Real-time | No cache (or 5s stale-while-revalidate) | 0-5s |
| Member profile | Near-real-time | Server-side cache (Redis) | 60s |
| Member list / directory | Stale OK | ISR (Incremental Static Regeneration) | 5 min |
| AI pricing recommendations | Computed | Redis cache, recompute on booking event | Until next event |
| AI churn scores | Batch | Redis cache, recompute nightly | 24h |
| Menu / inventory items | Near-real-time | Redis cache, invalidate on POS update | 2 min |
| Club settings / config | Rarely changes | In-memory + Redis | 15 min |
| Course layout / hole data | Static | Build-time or long Redis cache | 1 hour |

### Implementation

```
Browser ──► Next.js (Vercel Edge) ──► Redis (Upstash) ──► Odoo (PostgreSQL)
                                         │
                                    Cache hit? Return.
                                    Cache miss? Fetch from Odoo, cache, return.
```

- **Upstash Redis** -- Serverless Redis, works on Vercel Edge, per-request pricing
- **React Server Components** with `unstable_cache` or `fetch` with `next.revalidate` for ISR
- **Tee sheet:** Use WebSocket or Server-Sent Events for real-time updates instead of polling. Polling fallback at 5s intervals if WebSocket unavailable.
- **Cache invalidation:** Odoo webhooks trigger cache purge on write operations

---

## 7. Build Order & Dependencies

### Dependency Graph

```
Layer 0 (Foundation):     odoo/ (Docker setup + base modules)
                          packages/tsconfig, packages/eslint-config
                              │
Layer 1 (Plumbing):       packages/shared (types, constants)
                          packages/odoo-client (JSON-RPC wrapper)
                              │
Layer 2 (Data Models):    odoo/addons/tee_sheet (tee time models + logic)
                          odoo/addons/club_member (member models)
                          odoo/addons/club_pos (POS extensions)
                              │
Layer 3 (UI):             packages/ui (component library)
                          apps/dashboard (staff app -- tee sheet first)
                              │
Layer 4 (Player-Facing):  apps/booking (online booking portal)
                              │
Layer 5 (Intelligence):   packages/ai (AI SDK)
                          AI features wired into dashboard + booking
                              │
Layer 6 (Scale):          Multi-tenancy, ai-worker service, white-label
```

### Suggested Build Sequence (90-Day MVP)

#### Weeks 1-2: Foundation
- [ ] Odoo Docker Compose (Odoo Community + PostgreSQL) running locally
- [ ] Turborepo monorepo scaffolded with `apps/dashboard`, `packages/shared`, `packages/odoo-client`
- [ ] `packages/odoo-client` -- authenticate, searchRead, create, write, unlink, callMethod
- [ ] Odoo test data: 1 course, 18 holes, sample tee times, 50 fake members
- [ ] Basic Next.js dashboard shell with auth (NextAuth.js)

#### Weeks 3-5: Tee Sheet (Core Feature #1)
- [ ] `odoo/addons/tee_sheet/` -- tee.time.slot, tee.time.booking models
- [ ] Dashboard tee sheet view (day/week grid, drag-drop, color-coded)
- [ ] Book / cancel / modify tee times from dashboard
- [ ] Real-time updates (WebSocket or polling)
- [ ] Basic dynamic pricing logic (time-of-day + day-of-week rules)

#### Weeks 5-7: Members
- [ ] `odoo/addons/club_member/` -- extends res.partner with membership fields
- [ ] Member directory with search/filter
- [ ] Member 360 profile (bookings, spending, AI insights placeholder)
- [ ] Member check-in flow

#### Weeks 7-9: POS
- [ ] `odoo/addons/club_pos/` -- extends Odoo POS for club context
- [ ] POS interface for pro shop + F&B
- [ ] Member charge-to-account
- [ ] Receipt printing / email

#### Weeks 9-11: Booking Portal + AI
- [ ] `apps/booking/` -- player-facing tee time booking
- [ ] Embeddable widget version (iframe or web component)
- [ ] AI: demand forecast + dynamic pricing (Gemini API)
- [ ] AI: churn prediction (member activity analysis)
- [ ] AI insight cards on dashboard

#### Weeks 11-13: Polish + Beta Deploy
- [ ] Multi-tenancy setup (subdomain routing, tenant registry)
- [ ] Deploy: Vercel (Next.js) + Railway or Render (Odoo + PostgreSQL)
- [ ] Beta club onboarding (Nevel Meade or Louisville municipal)
- [ ] Error handling, logging, monitoring (Sentry, Vercel Analytics)
- [ ] Security audit (API key rotation, input validation, rate limiting)

---

## 8. Infrastructure Overview

### Production Stack

| Component | Service | Why |
|-----------|---------|-----|
| Next.js apps | Vercel | Zero-config deploys, edge network, serverless scaling |
| Odoo server | Railway or Render (Docker) | Persistent process, not serverless. Needs to stay running. |
| PostgreSQL | Railway managed PostgreSQL or Supabase | Managed, backups, connection pooling |
| Redis cache | Upstash | Serverless Redis, Vercel Edge compatible |
| AI inference | Vercel API routes (Phase 1) → dedicated worker (Phase 2) | Start simple, extract when needed |
| File storage | Vercel Blob or S3 | Member photos, documents, receipts |
| Email | SendGrid or Resend | Transactional emails (booking confirmations) |
| Real-time | Ably or Pusher (or self-hosted via Odoo longpolling) | Tee sheet live updates |
| Monitoring | Sentry + Vercel Analytics | Error tracking, performance |

### Local Dev

```bash
# Start everything
docker compose up -d          # Odoo + PostgreSQL
pnpm dev --filter dashboard   # Dashboard on localhost:3000
pnpm dev --filter booking     # Booking on localhost:3001
```

---

## 9. Component Boundary Rules

1. **Browser never talks to Odoo.** All Odoo communication goes through Next.js server layer.
2. **`packages/odoo-client` is the only code that knows JSON-RPC exists.** Apps import typed methods, not raw RPC calls.
3. **`packages/ai` is the only code that knows which AI model we use.** Swap Gemini for Claude without touching app code.
4. **Odoo custom modules contain business logic.** Availability checks, pricing rules, membership validation live in Python, not TypeScript.
5. **Next.js handles presentation logic.** Data formatting, UI state, routing, auth.
6. **Each app deploys independently.** Dashboard can ship without booking portal being ready.
7. **Shared packages are versioned together** (monorepo advantage) but have no side effects on import.

---

## 10. Open Questions

- [ ] **Odoo version:** 17 or 18? Need to check Community Edition module coverage for POS
- [ ] **Auth provider:** NextAuth.js vs Clerk vs Auth0? (Clerk is fastest to ship, NextAuth is most flexible)
- [ ] **Real-time strategy:** Ably/Pusher (managed) vs Odoo's built-in longpolling vs self-hosted WebSocket?
- [ ] **Odoo hosting:** Railway vs Render vs dedicated VM? Need to benchmark Odoo performance on containerized platforms
- [ ] **Payment processing:** Stripe (modern) vs Square (POS hardware integration)?
- [ ] **Offline POS:** Does the POS need to work offline? (Critical for clubs with spotty wifi)

---

## Sources

- [Odoo External JSON-RPC API (v19)](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)
- [Odoo External RPC API (v19)](https://www.odoo.com/documentation/19.0/developer/reference/external_rpc_api.html)
- [Odoo Architecture Overview](https://www.odoo.com/documentation/17.0/developer/tutorials/getting_started/01_architecture.html)
- [Next.js + Odoo Integration Guide](https://fairchanceforcrm.com/next-js-and-odoo/)
- [Headless Odoo with React/Next.js](https://www.webbycrown.com/headless-odoo-backend-react-nextjs-flutter/)
- [Odoo API Integration Guide (2026)](https://oec.sh/blog/odoo-api-integration)
- [Odoo Multi-Tenant Architecture](https://sdlccorp.com/post/building-a-multi-tenant-application-with-odoo/)
- [Odoo Multi-Tenancy Forum Discussion](https://www.odoo.com/forum/help-1/whats-the-best-architecture-to-manage-multi-tenant-odoo-community-setup-with-white-label-support-289650)
- [Next.js Backend-for-Frontend Guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js Proxy Pattern](https://nextjs.org/docs/app/getting-started/proxy)
- [Turborepo + Next.js Monorepo Guide](https://turborepo.dev/docs/guides/frameworks/nextjs)
- [Turborepo + Next.js Production Monorepo (2026)](https://noqta.tn/en/tutorials/turborepo-nextjs-monorepo-shared-packages-2026)
- [Vercel Monorepo Starter Template](https://vercel.com/templates/next.js/monorepo-turborepo)
- [AI-Powered Apps with Next.js (2025)](https://medium.com/@annasaaddev/building-ai-powered-apps-with-next-js-in-2025-84da6644f837)
- [Microservices Architecture for AI (2025)](https://medium.com/@meeran03/microservices-architecture-for-ai-applications-scalable-patterns-and-2025-trends-5ac273eac232)
- [Complete Odoo Integration Guide (2026)](https://www.technaureus.com/blog-detail/odoo-integration-guide-2026)
