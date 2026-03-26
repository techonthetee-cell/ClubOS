# Roadmap: ClubOS

**Created:** 2026-03-26
**Timeline:** 13 weeks (90 days) — MVP beta by end of June 2026
**Phases:** 4 (coarse granularity)
**Requirements:** 43 mapped

## Phase Overview

| # | Phase | Goal | Weeks | Requirements | Success Criteria |
|---|-------|------|-------|-------------|-----------------|
| 1 | Foundation & Odoo | Scaffold monorepo, deploy Odoo, build typed client, auth, multi-tenancy | 1-3 | FOUND-01 to FOUND-06 (6) | Odoo running, Next.js connected, staff can log in, subdomain routing works |
| 2 | Tee Sheet & Members | Build the two core daily-use modules with AI features | 3-7 | TEE-01 to TEE-10, MEM-01 to MEM-09 (19) | Staff can book tee times, manage members, see AI churn scores and dynamic pricing |
| 3 | POS | Full point-of-sale with member charge, Stripe, mobile, AI upsell | 7-10 | POS-01 to POS-10 (10) | Staff can ring up orders, charge to member accounts, process cards, see AI suggestions |
| 4 | Booking Portal & Beta | Player-facing booking, polish, deploy to beta clubs | 10-13 | BOOK-01 to BOOK-08 (8) | Members can book tee times online, clubs in Louisville + Denver running on ClubOS |

## Phase Details

### Phase 1: Foundation & Odoo (Weeks 1-3)

**Goal:** Get the entire technical foundation working — Odoo deployed, Next.js monorepo scaffolded, typed client built, authentication working, multi-tenancy routing proven.

**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06

**Success Criteria:**
1. Odoo 18 Community running in Docker with PostgreSQL, accessible via JSON-RPC from Next.js
2. Monorepo (Turborepo) builds and deploys — dashboard to Vercel, Odoo to Hetzner
3. Staff can log in to dashboard, see empty tee sheet page
4. Creating a second club database in Odoo + subdomain routing works (multi-tenancy proven)
5. Shared UI components (design system) rendering correctly

**Critical risk:** Odoo integration complexity. GO/NO-GO decision at end of Week 2. Fallback: Supabase + PostgreSQL direct.

**Plans:**
- Plan 1.1: Odoo Docker deployment + JSON-RPC client
- Plan 1.2: Monorepo scaffold + auth + multi-tenancy
- Plan 1.3: UI component library + design system

---

### Phase 2: Tee Sheet & Members (Weeks 3-7)

**Goal:** Build the two modules that club staff use every single day. Tee sheet with dynamic pricing and member management with churn prediction. These are the demo-worthy features that sell ClubOS to beta clubs.

**Requirements:** TEE-01 through TEE-10, MEM-01 through MEM-09

**Success Criteria:**
1. Staff can view, create, edit, and cancel tee time bookings on a visual grid
2. Booking rules enforce membership restrictions, guest limits, and advance windows
3. Dynamic pricing AI adjusts fees based on demand/weather/history (even with mock data initially)
4. Real-time tee sheet updates via SSE (booking on one screen appears on another)
5. Member profiles with photo, tier, family links, activity timeline
6. AI churn prediction scores visible on member profiles (rule-based for MVP, ML when data accumulates)
7. Member dashboard (self-service view: statement, profile, bookings)

**Plans:**
- Plan 2.1: Tee sheet grid UI + Odoo booking CRUD
- Plan 2.2: Booking rules engine + rate management
- Plan 2.3: Member profiles + directory + billing
- Plan 2.4: AI layer — dynamic pricing + churn prediction + member insights
- Plan 2.5: Real-time updates (SSE) + member self-service dashboard

---

### Phase 3: POS (Weeks 7-10)

**Goal:** Build a POS that bartenders and pro shop staff love using. Speed-first design (2 taps to ring up a beer), member recognition, and AI suggestions. Must integrate with tee sheet for green/cart fees.

**Requirements:** POS-01 through POS-10

**Success Criteria:**
1. Staff can ring up an item and charge to a member account in under 3 seconds
2. Credit card payments work via Stripe Terminal
3. Tab management: open, add, split, close
4. Green/cart fees auto-populate from tee sheet bookings
5. Member lookup shows photo, preferences, and AI-suggested items
6. Mobile POS works on iPad/tablet (beverage cart, patio)
7. End-of-day reports show revenue by category and payment method
8. Basic inventory tracking with low-stock alerts

**Plans:**
- Plan 3.1: POS terminal UI + menu/item management
- Plan 3.2: Member charge + Stripe payment integration
- Plan 3.3: Tee sheet integration + mobile POS + inventory
- Plan 3.4: AI member recognition + upsell suggestions + reporting

---

### Phase 4: Booking Portal & Beta Launch (Weeks 10-13)

**Goal:** Ship the player-facing booking portal, polish everything, deploy to 2 beta clubs (one in Louisville, one in Denver), and gather real feedback.

**Requirements:** BOOK-01 through BOOK-08

**Success Criteria:**
1. Public booking page with tee time search, availability, and online booking
2. Member login shows member pricing and advance booking windows
3. Guest booking with Stripe card hold
4. Embeddable iframe widget working on a test club website
5. Booking confirmations sent via email
6. At least 1 club in Louisville and 1 in Denver actively using ClubOS
7. Real members booking real tee times through the system
8. Feedback collected from first 2 weeks of beta

**Plans:**
- Plan 4.1: Booking portal UI + search + availability
- Plan 4.2: Member/guest booking flows + payment + confirmation
- Plan 4.3: Embeddable widget + polish + beta deployment
- Plan 4.4: Beta club onboarding (data migration, training, go-live support)

---

## Milestone: V1 MVP Complete

**When:** End of Week 13 (~June 26, 2026)
**Deliverable:** ClubOS v1 running in production at 2 beta clubs with real data
**Revenue target:** $0 during beta (free for founding clubs, charge after 90 days of usage)

## What Comes Next (V2 Backlog)

1. Events & dining reservations
2. Advanced billing (recurring dues, minimums, installments)
3. Native mobile apps
4. AI phone agent
5. Google Reserve integration
6. Open API + developer docs
7. GolfNow channel integration

---
*Roadmap created: 2026-03-26*
*Last updated: 2026-03-26 after initial creation*
