# ClubOS — AI-Powered Club Management Platform

## What This Is

ClubOS is a modern, cloud-native club management platform that replaces legacy systems like Jonas Club Software ($1K+/mo, 30-year Windows codebase) and Pro Shop Tee Times ($75-499/mo, 15-year ASP.NET). Built on Odoo Community (free open-source ERP) with a custom Next.js frontend and AI layer, it gives golf clubs enterprise-grade operations with Apple-level UX at transparent pricing. The AI layer — churn prediction, dynamic tee time pricing, member insights, smart POS upsell — is what no competitor offers.

## Core Value

Clubs can manage tee times, point of sale, and members from one modern platform with AI insights that make their business smarter every day — without the legacy tech debt, opaque pricing, or year-long contracts.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] AI-powered tee sheet with dynamic pricing and demand forecasting
- [ ] Modern POS for F&B and pro shop with member recognition and AI upsell
- [ ] Unified member management with churn prediction and 360-degree profiles
- [ ] Player-facing online booking portal (embeddable widget + standalone)
- [ ] Odoo backend integration for accounting, billing, inventory, CRM
- [ ] Mobile-responsive design (staff and member experiences)
- [ ] Multi-club support (Louisville, Denver markets simultaneously)
- [ ] Open API for third-party integrations

### Out of Scope

- Events/banquet management — v2 (after core tee sheet + POS + members proven)
- Dining reservations — v2
- Full accounting module UI — v2 (Odoo handles backend, custom UI later)
- Hotel/marina/spa management — v3+
- Mobile native apps (iOS/Android) — v2 (web-first, PWA for v1)
- AI phone agent for booking — v2 (CourseRev-style, after booking engine proven)
- GolfNow marketplace integration — v2

## Context

### Market
- Club management software market: $1.75B (2025) → $2.93B (2032), 7-9% CAGR
- ~4,500 private clubs + ~11,000 public courses in US
- Jonas dominates private (2,300+ clubs), PSTT/foreUP/Lightspeed dominate public
- 1,000+ courses switched tee sheet tech in Spring 2025 — massive churn signal
- AI is the new battleground (CourseRev, Golf.AI, Sagacity entering in 2025-2026)

### Competition Deep Dive
- **Jonas Club Software:** 2,300+ clubs, 30-year Windows legacy, 60+ modules, terrible UX (staff hate POS), zero AI, opaque pricing, no public API. Owned by Constellation Software ($70B).
- **Pro Shop Tee Times (PSTT):** Louisville-based (La Grange, KY), one-man shop (Jay Snider), $75-499/mo, ASP.NET WebForms from 2009, runs all 10 Louisville municipal courses. No API, no AI, ~50-100 courses total.
- **Chronogolf/Lightspeed Golf:** Modern cloud-native, used by Nevel Meade (Bank's home club). Canadian. Growing +7%/yr.
- **foreUP:** Declining (113 tracked defections in 2025). Dynamic pricing but not AI-native.
- **GolfNow:** Dominant marketplace but barter model (courses give away $100K+/yr in tee times). Losing tee sheet share.
- **Club Caddie:** Owned by Jonas. $299/mo, growing +20%/yr. Public/semi-private focus.

### Gaps We Fill
1. Zero AI in any competitor (no churn prediction, no demand forecasting, no smart upsell)
2. Jonas sells CRM, MemberInsight, MetricsFirst, Activity Tracking as 4 SEPARATE paid products — we unify into one Member Intelligence dashboard
3. PSTT's ASP.NET from 2009 vs our cloud-native stack
4. No competitor has open API with developer ecosystem
5. Legacy UX everywhere — staff (bartenders, servers) hate existing POS systems
6. No competitor offers transparent flat-rate pricing without contracts

### Team
- **Bank Anantravanich** — CTO / AI Architect. Full-stack dev, AI/ML (Gemini, Claude), cloud architecture, mobile dev. Built StrokeGained (AI golf app). Louisville, KY.
- **Eli Lafaurie** — COO / Operations. MSP operations, IT infrastructure, client relationships, HaloPSA expertise. Cape Coral, FL.
- **Luis Cabarcas** — Founder, Privium Labs. Financial professional, entrepreneur, CFO experience. Denver, CO.
- **Michael Diaz** — Privium Labs team. Denver, CO. Role TBD.

### Business Structure
- **Parent company:** Privium Labs (existing funded entity)
- **ClubOS:** Separate brand under Privium Labs umbrella
- **Bank:** Equity partner (CTO), not contractor
- **Funding:** Privium Labs has existing funding — ClubOS leverages this
- **GitHub:** github.com/priviumlabs/ClubOS

### Beta Markets
- **Louisville, KY (Bank):** Home turf. Nevel Meade (Lightspeed), PSTT territory (10 municipal courses). 40+ courses in metro area.
- **Denver, CO (Luis + Michael):** Mountain/resort courses, growing golf market, year-round indoor golf.
- Cape Coral/SW FL (Eli) — future market, not in v1 beta.

## Constraints

- **Timeline:** 90-day aggressive MVP — working beta in a club's hands by end of June 2026
- **Tech stack:** Next.js frontend + Odoo Community backend (decided)
- **Architecture:** Monorepo with `apps/dashboard` (management), `apps/booking` (player-facing), `packages/shared`, `packages/ai`, `odoo/`
- **Pricing:** $199/mo Starter, $499/mo Pro, $999/mo Enterprise. No contracts.
- **Team size:** 4 people (1 primary developer: Bank). Must be buildable by one dev with AI assistance.
- **Odoo version:** Community (free, self-hosted). Not Enterprise.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Odoo Community as backend | Free, handles accounting/billing/CRM/inventory. Cuts dev time 60-70%. | — Pending |
| Next.js custom frontend | Modern UX, SSR, deploy to Vercel. Odoo's built-in UI is functional but ugly. | — Pending |
| Monorepo structure | One repo, two apps (dashboard + booking), shared packages. Split later at 10+ devs. | — Pending |
| Louisville + Denver for beta | Two markets, two founders on the ground. Florida later. | — Pending |
| 90-day MVP timeline | Aggressive but achievable with Odoo handling plumbing. Tee sheet + POS + members + booking. | — Pending |
| Emerald (#10B981) as brand color | Golf green, premium feel, tested in prototype. | — Pending |
| AI-first approach | Every screen has at least one AI insight. This is the differentiator, not a bolt-on. | — Pending |

---
*Last updated: 2026-03-26 after project initialization*
