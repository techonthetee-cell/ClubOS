# ClubOS Stack Research

> Researched 2026-03-26. Prescriptive recommendations for a greenfield Odoo Community + Next.js club management platform.

---

## 1. Odoo Version: 18 LTS

**Decision: Odoo 18 Community Edition (LTS)**

- Odoo 18 is the current LTS release with long-term support and wide module compatibility
- Odoo 17 is still supported but missing two years of improvements (better POS, mobile PWA, AI forecasting)
- Odoo 19 exists but is a SaaS-only rolling release -- not suitable for self-hosted production
- Odoo 18 has the best OCA (Odoo Community Association) module coverage for 2026
- The legacy JSON-RPC and XML-RPC APIs work fully in Odoo 18; the new JSON-2 API is forward-compatible (XML-RPC/JSON-RPC deprecated in Odoo 22, fall 2028 -- plenty of runway)

**Key Odoo 18 features we use:**
- Native POS module (rebuilt in 18, mobile PWA support)
- Accounting + invoicing + inventory modules (free in Community)
- CRM module for member management foundation
- Calendar module for tee sheet backbone
- Website module for booking portal (optional, may skip for custom Next.js)

---

## 2. Odoo Integration: JSON-RPC via Custom TypeScript Client

**Decision: JSON-RPC (not XML-RPC, not REST)**

### Why JSON-RPC
- JSON-RPC is what Odoo's own web client uses internally -- battle-tested, full feature coverage
- Payloads are 40-60% smaller than XML-RPC
- Native JSON -- no XML parsing in TypeScript
- Honors Odoo's permission system automatically (user-level ACLs enforced server-side)
- REST API in Odoo 18 is experimental with limited coverage -- not production-ready for core modules like accounting, POS, and inventory

### Why NOT XML-RPC
- Verbose XML payloads, painful to parse in JS/TS
- Being deprecated (removed in Odoo 22)
- No advantage over JSON-RPC for a JavaScript frontend

### Why NOT Odoo REST API
- Experimental in Odoo 17/18, limited module coverage
- Core modules (accounting, HR, inventory) are only reliably accessible via JSON-RPC
- Would need OCA community module (`base_rest`) for full REST -- adds dependency risk

### Implementation Architecture

```
Next.js (Vercel)  -->  JSON-RPC over HTTPS  -->  Odoo 18 (VPS)
     |                                              |
     |                                         PostgreSQL
     |
     +--> Prisma (read-only replica) for AI/analytics queries
```

### TypeScript Client Library

**Use `@rlizana/odoo-rpc` v1.0.7+ as starting point, then wrap it.**

```
npm install @rlizana/odoo-rpc
```

- Lightweight, zero-dependency JSON-RPC client
- Tested on Odoo 16, 17, 18
- Works in both Node.js (API routes) and browser
- Session-based auth with cookie management

**Build a typed wrapper on top:**

```typescript
// packages/odoo-client/src/index.ts
import OdooRPC from '@rlizana/odoo-rpc';

export class ClubOSClient {
  private rpc: OdooRPC;

  constructor(url: string, db: string) {
    this.rpc = new OdooRPC({ url, db });
  }

  async authenticate(login: string, password: string) {
    return this.rpc.login(login, password);
  }

  // Typed model methods
  async searchRead<T>(model: string, domain: any[], fields: string[], limit?: number): Promise<T[]> {
    return this.rpc.searchRead(model, domain, fields, { limit });
  }

  async create(model: string, values: Record<string, any>): Promise<number> {
    return this.rpc.create(model, values);
  }

  async write(model: string, ids: number[], values: Record<string, any>): Promise<boolean> {
    return this.rpc.write(model, ids, values);
  }
}
```

### API Route Pattern (Next.js)

All Odoo calls go through Next.js API routes (server-side only). The frontend never talks to Odoo directly.

```
apps/dashboard/app/api/tee-sheet/route.ts  -->  ClubOSClient  -->  Odoo JSON-RPC
apps/dashboard/app/api/members/route.ts    -->  ClubOSClient  -->  Odoo JSON-RPC
apps/booking/app/api/availability/route.ts -->  ClubOSClient  -->  Odoo JSON-RPC
```

This keeps Odoo credentials server-side and lets us add caching, rate limiting, and response shaping.

---

## 3. Database Strategy

**Decision: Single PostgreSQL instance owned by Odoo, read replica for AI/analytics**

### Primary Database (Odoo-managed)
- PostgreSQL 16 (required by Odoo 18, best performance)
- Odoo owns the schema -- never modify Odoo tables directly
- All writes go through Odoo JSON-RPC (maintains data integrity, triggers, and computed fields)

### Read Replica for AI + Analytics
- Set up PostgreSQL streaming replication to a read replica
- Next.js connects to the **read replica** via Prisma for:
  - AI/ML feature queries (member activity, booking patterns, revenue data)
  - Dashboard analytics (charts, KPIs, reports)
  - Search and filtering that would be slow through JSON-RPC
- Prisma introspects Odoo's existing schema (`prisma db pull`) -- no manual schema definition needed

### Prisma Setup

```
npm install prisma @prisma/client
npx prisma db pull  # Introspects Odoo's PostgreSQL schema
```

```prisma
// packages/shared/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_READONLY_URL")  // Read replica
}

generator client {
  provider = "prisma-client-js"
}

// Models auto-generated from Odoo schema via db pull
// e.g., res_partner, sale_order, pos_order, calendar_event
```

### Why This Approach
- Odoo's ORM handles all business logic, computed fields, access control
- Prisma gives us type-safe, fast read access for analytics without going through JSON-RPC
- Read replica ensures the analytics workload doesn't slow down Odoo
- No risk of corrupting Odoo data (read-only connection)

### Connection Pooling
- Use PgBouncer between Prisma and the read replica
- Set Prisma `connection_limit=5` per serverless function instance
- Singleton pattern in Next.js to prevent connection exhaustion during hot reload

---

## 4. AI/ML Stack

**Decision: Hybrid -- scikit-learn for tabular ML, Gemini 2.5 Flash for NLP/insights**

### Churn Prediction Model
- **Library:** scikit-learn 1.5+ (Python)
- **Model:** Gradient Boosted Trees (XGBClassifier or LightGBM) -- best for tabular churn data
- **Features:** visit frequency, spending trends, booking patterns, payment history, member tenure, seasonal activity
- **Training:** Batch job, retrain weekly on read replica data
- **Serving:** FastAPI microservice with model loaded in memory
- **Why not Gemini for churn:** LLMs are bad at tabular classification. scikit-learn/XGBoost is purpose-built and 100x cheaper.

### Dynamic Pricing Engine
- **Library:** scikit-learn 1.5+ (Python)
- **Model:** Gradient Boosted Regression or simple rule-based pricing with ML-tuned parameters
- **Features:** day of week, time of day, weather forecast, historical demand, member vs public, season, holidays
- **Serving:** Same FastAPI microservice, called by Next.js API routes
- **Update frequency:** Prices recalculated every 15 minutes for the next 7 days

### AI Insights & NLP (Member Intelligence)
- **Model:** Gemini 2.5 Flash (not Pro -- Flash is faster and cheaper for structured output)
- **Use cases:**
  - Natural language member activity summaries ("John's visits dropped 40% this month")
  - Smart POS upsell recommendations ("This member usually orders IPA -- suggest the new seasonal")
  - Automated email/notification copy for re-engagement campaigns
  - Conversational booking assistant (future)
- **API:** Google AI SDK (`@google/generative-ai` npm package)
- **Cost:** Gemini 2.5 Flash is ~$0.15/1M input tokens -- very affordable for per-member insights

### AI Microservice Architecture

```
packages/ai/
  churn/
    train.py          # scikit-learn training pipeline
    model.joblib      # Serialized model
  pricing/
    engine.py         # Dynamic pricing logic
  api/
    main.py           # FastAPI server
    routes/
      churn.py        # POST /predict/churn
      pricing.py      # GET /pricing/tee-times
      insights.py     # POST /insights/member-summary (calls Gemini)
```

### Python Dependencies

```
# packages/ai/requirements.txt
fastapi==0.115.*
uvicorn==0.34.*
scikit-learn==1.5.*
xgboost==2.1.*
pandas==2.2.*
numpy==2.1.*
joblib==1.4.*
google-generativeai==0.8.*
psycopg2-binary==2.9.*
python-dotenv==1.0.*
```

### Why This Hybrid
- scikit-learn/XGBoost for what ML does best: structured tabular prediction
- Gemini Flash for what LLMs do best: natural language generation, summarization, recommendations
- FastAPI microservice keeps AI isolated from the Next.js monorepo (different runtime, different scaling)
- Can swap models without touching the frontend

---

## 5. Real-Time Features

**Decision: Server-Sent Events (SSE) for live tee sheet + WebSocket fallback for POS**

### Tee Sheet Live Updates (SSE)
- Staff and players see tee times update in real-time as bookings are made
- SSE is unidirectional (server to client) -- perfect for "tee time X was just booked"
- Works natively with Vercel (with 25-second timeout workaround via auto-reconnect + heartbeat)
- Implementation: Next.js Route Handler with `ReadableStream`

```typescript
// apps/dashboard/app/api/tee-sheet/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Poll Odoo or listen to Redis pub/sub for changes
      // Push SSE events to client
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### POS Real-Time (WebSocket via Socket.IO)
- POS needs bidirectional communication (order placed -> kitchen display, payment confirmed -> receipt)
- WebSocket requires a persistent server (not serverless) -- run on the same VPS as Odoo or the AI microservice
- Use Socket.IO 4.x for auto-reconnect, rooms (per-club), and fallback to polling

### Message Bus Architecture

```
Odoo (booking made) --> Redis Pub/Sub --> Next.js SSE endpoint --> Browser
Odoo (POS order)    --> Redis Pub/Sub --> Socket.IO server     --> POS terminals
```

### Redis Setup
- Redis 7.x as the message broker between Odoo and Next.js
- Odoo custom module publishes events to Redis channels on key actions (booking created, payment received, member check-in)
- Next.js SSE routes and Socket.IO server subscribe to relevant channels
- Redis also handles session caching and rate limiting

### Why Not Supabase Realtime
- Would add another database layer alongside Odoo's PostgreSQL -- unnecessary complexity
- Supabase Realtime listens to PostgreSQL changes, but Odoo's ORM does things that bypass simple row-level triggers
- Redis Pub/Sub is simpler, faster, and we already need Redis for caching

---

## 6. Payment Processing

**Decision: Stripe (direct integration in Next.js) + Odoo payment reconciliation**

### Architecture

```
Player books tee time --> Next.js checkout --> Stripe Checkout/Elements --> Webhook --> Next.js API route --> Create Odoo payment record via JSON-RPC
```

### Why Stripe Direct (not Odoo's Stripe module)
- Odoo's built-in Stripe module is designed for Odoo's own website/ecommerce -- not a headless Next.js frontend
- Direct Stripe integration gives us full control over the checkout UX
- Stripe's Node.js SDK (`stripe` npm package) is first-class and well-maintained
- We reconcile payments back to Odoo via JSON-RPC after Stripe confirms

### Implementation

```typescript
// packages/shared/src/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-18.acacia',  // Pin to stable API version
});
```

### Key Stripe Products
- **Stripe Checkout:** Hosted payment page for online tee time booking (fastest to implement)
- **Stripe Elements:** Embedded card form for in-app payments (member portal)
- **Stripe Terminal:** In-person payments for POS (WisePOS E or S700 readers)
- **Stripe Billing:** Recurring membership dues ($199/mo, $499/mo plans)
- **Stripe Connect:** Future -- if we process payments on behalf of clubs (marketplace model)

### Webhook Flow
1. Stripe fires `checkout.session.completed` or `payment_intent.succeeded`
2. Next.js webhook route validates signature, processes event
3. Creates/updates payment record in Odoo via JSON-RPC (`account.payment` model)
4. Updates booking status in Odoo (`calendar.event` or custom `clubos.booking` model)

### Odoo Reconciliation
- Custom Odoo module (`clubos_stripe`) maps Stripe payment IDs to Odoo journal entries
- Daily reconciliation job matches Stripe payouts to Odoo bank statements
- Handles refunds, disputes, and partial payments

### npm Dependencies
```
npm install stripe@17
```

---

## 7. Hosting & Deployment

### Frontend: Vercel

| Component | Host | Why |
|-----------|------|-----|
| `apps/dashboard` | Vercel | SSR, edge functions, automatic preview deploys, free tier covers MVP |
| `apps/booking` | Vercel | Same -- player-facing booking portal |

- Deploy via `vercel --prod` from monorepo
- Turborepo handles build orchestration
- Environment variables for Odoo URL, Stripe keys, Redis URL, AI service URL

### Backend: Hetzner Cloud VPS

| Component | Host | Spec | Cost |
|-----------|------|------|------|
| Odoo 18 + PostgreSQL 16 | Hetzner CX32 | 4 vCPU, 8GB RAM | ~$14/mo |
| Redis 7.x | Same VPS | Shared | included |
| AI Microservice (FastAPI) | Same VPS | Shared | included |
| Nginx reverse proxy + SSL | Same VPS | Certbot | included |

**Why Hetzner over DigitalOcean/AWS:**
- 3-4x cheaper for equivalent specs (CX32 at $14/mo vs DO $48/mo vs AWS ~$60/mo)
- EU and US datacenters (Ashburn, VA for East Coast latency)
- Excellent performance -- CX32 handles 50+ concurrent Odoo users
- Simple, no vendor lock-in
- Good enough for MVP/beta. Migrate to AWS/GCP when scaling past 10 clubs.

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
services:
  odoo:
    image: odoo:18
    ports:
      - "8069:8069"
    volumes:
      - odoo-data:/var/lib/odoo
      - ./odoo/addons:/mnt/extra-addons
      - ./odoo/config:/etc/odoo
    depends_on:
      - postgres
      - redis
    environment:
      - HOST=postgres
      - USER=odoo
      - PASSWORD=${ODOO_DB_PASSWORD}

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=${ODOO_DB_PASSWORD}
      - POSTGRES_DB=clubos
    ports:
      - "127.0.0.1:5432:5432"  # Local only

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    ports:
      - "127.0.0.1:6379:6379"  # Local only

  ai-service:
    build: ./packages/ai
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      - DATABASE_URL=postgresql://readonly:${READONLY_PASSWORD}@postgres:5432/clubos
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - certbot-data:/etc/letsencrypt
    depends_on:
      - odoo
      - ai-service

volumes:
  odoo-data:
  postgres-data:
  redis-data:
  certbot-data:
```

### Domain Architecture
- `app.clubos.io` -- Staff dashboard (Vercel)
- `book.clubos.io` -- Player booking portal (Vercel)
- `api.clubos.io` -- Odoo backend + AI service (Hetzner, behind Nginx)

---

## 8. Complete Stack Summary

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.x (App Router) | SSR, API routes, React Server Components |
| Language | TypeScript | 5.6+ | Type safety across the stack |
| UI | Tailwind CSS + shadcn/ui | 4.x / latest | Rapid UI development, accessible components |
| State | Zustand | 5.x | Lightweight client state (tee sheet, cart) |
| Forms | React Hook Form + Zod | 7.x / 3.x | Form handling + runtime validation |
| Data Fetching | TanStack Query | 5.x | Server state, caching, optimistic updates |
| Charts | Recharts | 2.x | Dashboard analytics visualizations |
| Monorepo | Turborepo | 2.x | Build orchestration, shared packages |
| Package Manager | pnpm | 9.x | Fast, disk-efficient |

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| ERP | Odoo Community | 18 LTS | Accounting, billing, inventory, CRM, POS backend |
| Database | PostgreSQL | 16 | Primary datastore (Odoo-managed) |
| Cache/PubSub | Redis | 7.x | Real-time messaging, session cache, rate limiting |
| AI/ML | FastAPI + scikit-learn | 0.115 / 1.5 | Churn prediction, dynamic pricing |
| AI/NLP | Gemini 2.5 Flash | latest | Member insights, natural language generation |
| Odoo Client | @rlizana/odoo-rpc | 1.0.7+ | TypeScript JSON-RPC client |
| ORM (read) | Prisma | 6.x | Type-safe read access to PostgreSQL replica |
| Payments | Stripe | SDK v17 | Online payments, POS terminal, subscriptions |
| Real-time | SSE + Socket.IO | native / 4.x | Live tee sheet (SSE), POS updates (WebSocket) |

### Infrastructure
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend hosting | Vercel | SSR, edge, preview deploys |
| Backend hosting | Hetzner Cloud CX32 | Odoo + PostgreSQL + Redis + AI |
| Containers | Docker Compose | Orchestration on VPS |
| Reverse proxy | Nginx + Certbot | SSL termination, routing |
| CI/CD | GitHub Actions | Test, build, deploy on push |
| Monitoring | Uptime Kuma (self-hosted) | Health checks, alerting |

### Cost Estimate (MVP)
| Item | Monthly Cost |
|------|-------------|
| Vercel (Pro) | $20 |
| Hetzner CX32 | $14 |
| Stripe | 2.9% + $0.30/txn (no monthly) |
| Gemini 2.5 Flash API | ~$5-15 (usage-based) |
| Domain (clubos.io) | ~$3 (annualized) |
| **Total fixed** | **~$37-52/mo** |

---

## 9. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSON-RPC deprecation (Odoo 22, 2028) | Medium | JSON-2 API is the replacement; migrate when Odoo 20/21 adopted. 2+ years runway. |
| Odoo schema changes on upgrade | High | Prisma read-only on replica + pinned Odoo version. Test upgrades in staging. |
| Hetzner single-point-of-failure | Medium | Daily automated backups to S3/Backblaze B2. Can restore to any VPS in <1hr. |
| scikit-learn model accuracy | Low | Start with rule-based pricing, layer ML on top as data accumulates. Need 3-6 months of booking data. |
| Vercel SSE timeout (25s) | Low | Auto-reconnect + heartbeat pattern. Well-documented workaround. |
| One-dev bus factor | High | Clean architecture, typed everything, Odoo handles 60-70% of business logic. Any Python/TS dev can onboard. |

---

## Sources

- [Odoo 18 External API Documentation](https://www.odoo.com/documentation/18.0/developer/reference/external_api.html)
- [Odoo API Integration Guide (2026)](https://oec.sh/blog/odoo-api-integration)
- [External JSON-2 API (Odoo 19 docs)](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)
- [Odoo 18 Release Notes](https://www.odoo.com/odoo-18-release-notes)
- [Odoo 18 vs 19 Feature Comparison](https://boyangcs.com/odoo-18-vs-odoo-19/)
- [Deploy Odoo to Production (2026 Checklist)](https://oec.sh/blog/deploy-odoo-production-checklist)
- [Odoo Docker Compose Production Setup](https://oec.sh/guides/odoo-docker)
- [Best Cloud Provider for Odoo (2026)](https://oec.sh/blog/best-cloud-for-odoo)
- [@rlizana/odoo-rpc (npm)](https://www.npmjs.com/package/@rlizana/odoo-rpc)
- [odoo-jsonrpc-typescript (GitHub)](https://github.com/101medialab/odoo-jsonrpc-typescript)
- [Streaming in Next.js 15: WebSockets vs SSE](https://hackernoon.com/streaming-in-nextjs-15-websockets-vs-server-sent-events)
- [Next.js Real-Time Chat: WebSocket and SSE](https://eastondev.com/blog/en/posts/dev/20260107-nextjs-realtime-chat/)
- [Prisma + Next.js + PostgreSQL Guide](https://www.prisma.io/docs/guides/frameworks/nextjs)
- [Stripe Terminal Odoo Integration](https://apps.odoo.com/apps/modules/18.0/stripe_payment_odoo_integration)
- [Gemini 2.5 Pro Documentation](https://ai.google.dev/gemini-api/docs/models)
- [Hetzner vs DigitalOcean vs AWS for Odoo](https://udoocloud.pro/blog/best-servers-for-self-hosted-odoo-comparison-2025)
