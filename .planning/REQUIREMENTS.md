# Requirements: ClubOS

**Defined:** 2026-03-26
**Core Value:** Clubs can manage tee times, POS, and members from one modern platform with AI insights — without legacy tech debt, opaque pricing, or contracts.

## v1 Requirements

### Foundation (FOUND)

- [x] **FOUND-01**: Odoo 18 Community deployed via Docker with PostgreSQL, accessible via JSON-RPC
- [ ] **FOUND-02**: Next.js monorepo scaffolded (apps/dashboard, apps/booking, packages/shared, packages/odoo-client, packages/ai)
- [x] **FOUND-03**: Typed Odoo client (odoo-client package) wrapping JSON-RPC with auth, CRUD, and error handling
- [ ] **FOUND-04**: Authentication system (club staff login for dashboard, member login for booking portal)
- [ ] **FOUND-05**: Multi-tenancy via Odoo multi-database (one DB per club, subdomain routing)
- [ ] **FOUND-06**: Shared UI component library (emerald design system from prototype)

### Tee Sheet (TEE)

- [ ] **TEE-01**: Visual tee sheet grid (time slots x holes, drag-and-drop booking)
- [ ] **TEE-02**: Configurable time intervals (7, 8, 9, 10 min) and start times
- [ ] **TEE-03**: Booking with player details (member lookup, guest entry, group size)
- [ ] **TEE-04**: Booking rules enforcement (membership type restrictions, guest limits, advance booking windows)
- [ ] **TEE-05**: Shotgun start and crossover start support
- [ ] **TEE-06**: Rate management (green fees, cart fees, guest fees by time/day/season)
- [ ] **TEE-07**: Check-in workflow (mark players arrived, print cart signs)
- [ ] **TEE-08**: Waitlist management (members join waitlist, auto-notify on cancellation)
- [ ] **TEE-09**: AI dynamic pricing (adjust fees based on demand, weather, day-of-week, historical fill rates)
- [ ] **TEE-10**: Real-time tee sheet updates (SSE push when bookings change)

### Point of Sale (POS)

- [ ] **POS-01**: Quick-sale terminal with category tabs (Drinks, Food, Pro Shop)
- [ ] **POS-02**: Member charge-to-account (lookup by name/number, charge to AR)
- [ ] **POS-03**: Credit card payment via Stripe Terminal
- [ ] **POS-04**: Tab/check management (open, add items, close, split)
- [ ] **POS-05**: Menu/item management (categories, prices, modifiers, tax rules)
- [ ] **POS-06**: Tee sheet integration (green/cart fees auto-applied from booking)
- [ ] **POS-07**: Basic inventory tracking (stock counts, low-stock alerts)
- [ ] **POS-08**: End-of-day reporting (revenue by category, payment method breakdown)
- [ ] **POS-09**: AI member recognition (show photo, preferences, usual order on member lookup)
- [ ] **POS-10**: Mobile POS for beverage cart/patio (responsive web, works on tablet)

### Member Management (MEM)

- [ ] **MEM-01**: Member profiles (name, photo, contact, membership type, family links)
- [ ] **MEM-02**: Membership tier management (types, privileges, fee schedules)
- [ ] **MEM-03**: Member directory (searchable, filterable by tier/status)
- [ ] **MEM-04**: Guest tracking (guest of member, guest fees, visit limits)
- [ ] **MEM-05**: Activity history timeline (visits, purchases, bookings, events in one view)
- [ ] **MEM-06**: Basic billing (monthly dues, statement generation, online payment via Stripe)
- [ ] **MEM-07**: AI churn prediction (risk score 1-5 based on visit frequency, spending, engagement trends)
- [ ] **MEM-08**: AI member insights panel ("visits dropped 40% — recommend personal outreach")
- [ ] **MEM-09**: Member dashboard (self-service: view statement, update profile, see upcoming bookings)

### Online Booking Portal (BOOK)

- [ ] **BOOK-01**: Public-facing tee time search and booking (date, time, players)
- [ ] **BOOK-02**: Member login with member-only pricing and advance booking windows
- [ ] **BOOK-03**: Guest booking with credit card hold
- [ ] **BOOK-04**: Mobile-responsive design (works on any device)
- [ ] **BOOK-05**: Embeddable widget (iframe for club websites, like PSTT does today)
- [ ] **BOOK-06**: Booking confirmation emails
- [ ] **BOOK-07**: Member can view/cancel upcoming reservations
- [ ] **BOOK-08**: Real-time availability (reflects dashboard changes instantly)

## v2 Requirements

### Events & Dining
- **EVT-01**: Event creation and management (tournaments, banquets, socials)
- **EVT-02**: Online event registration for members
- **EVT-03**: Dining reservation system with table management
- **EVT-04**: AI event recommendations based on member preferences

### Advanced Billing
- **BILL-01**: Recurring billing automation (monthly/quarterly/annual dues)
- **BILL-02**: F&B spending minimums tracking
- **BILL-03**: Installment billing (entrance fees, assessments)
- **BILL-04**: ACH/bank draft payments

### Advanced AI
- **AI-01**: AI phone agent for tee time booking (CourseRev-style)
- **AI-02**: Demand forecasting dashboard (predict busy/slow periods weeks ahead)
- **AI-03**: Automated re-engagement campaigns (trigger emails/SMS for at-risk members)
- **AI-04**: Financial anomaly detection (unusual spending patterns, billing errors)

### Platform
- **PLAT-01**: Native mobile apps (iOS + Android)
- **PLAT-02**: Google Reserve integration
- **PLAT-03**: GolfNow/TeeOff marketplace integration (optional channel)
- **PLAT-04**: GHIN handicap sync
- **PLAT-05**: Open API for third-party developers

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full restaurant management (KDS, kitchen routing) | Overkill for v1, add KDS in v2 |
| Loyalty/rewards program | Complexity, defer to v2 |
| Hotel/marina/spa management | Different verticals, v3+ |
| Native mobile apps | Web-first, PWA for v1, native v2 |
| GolfNow barter model | Anti-pattern — we don't take club inventory |
| Complex lottery/draw system | High complexity, low v1 value — waitlist first |
| Integrated payment processing | Use Stripe directly, don't build our own |
| Committee/governance tools | Not core to daily operations |
| Social features (member feed, messaging) | Not a social network |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through FOUND-06 | Phase 1 | Pending |
| TEE-01 through TEE-10 | Phase 2 | Pending |
| MEM-01 through MEM-09 | Phase 2 | Pending |
| POS-01 through POS-10 | Phase 3 | Pending |
| BOOK-01 through BOOK-08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after initial definition*
