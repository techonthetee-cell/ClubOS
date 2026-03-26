# ClubOS Pitfalls Research

> Researched 2026-03-26. Every pitfall includes warning signs, prevention strategy, and which phase should address it.

---

## 1. Odoo Community Integration

### 1.1 API Deprecation Trap

- **The pitfall:** Odoo's XML-RPC and JSON-RPC APIs at `/xmlrpc`, `/xmlrpc/2`, and `/jsonrpc` are scheduled for removal in Odoo 22 (fall 2028) and Online 21.1 (winter 2027). Building the entire frontend on these APIs means a forced rewrite within 2 years.
- **Warning signs:** Using `xmlrpc` or legacy `/jsonrpc` endpoints directly. No abstraction layer between Next.js and Odoo calls.
- **Prevention:** Build against the new External JSON-2 API from day one. Create a thin API abstraction layer (`packages/odoo-client`) so swapping transport is a one-file change, not a full rewrite.
- **Phase:** Architecture (Week 1-2)

### 1.2 Over-Customization of Odoo Core

- **The pitfall:** Modifying Odoo core modules or creating deeply coupled custom modules that break on every Odoo upgrade. The whole point of Odoo is that it handles plumbing -- if you're rewriting the plumbing, you've lost the advantage.
- **Warning signs:** Forking Odoo core modules. Custom Python code exceeding the actual Next.js frontend code. Needing to pin to a specific Odoo patch version.
- **Prevention:** Treat Odoo as a headless data layer only. Never modify core modules. Use inheritance and custom modules that extend, not replace. Keep custom Odoo modules under 2,000 lines total for MVP.
- **Phase:** Architecture (Week 1-2), enforced throughout

### 1.3 Circular Data Update Loops

- **The pitfall:** Next.js frontend writes to Odoo, Odoo webhook fires back to Next.js, which writes to Odoo again -- infinite loop. Common when syncing state between a custom frontend and ERP backend.
- **Warning signs:** Duplicate records appearing. Database CPU spiking. Webhook handlers that also call Odoo write methods.
- **Prevention:** Establish clear data ownership per entity. Use idempotency keys on all writes. Webhooks should carry a `source` field -- ignore events triggered by your own writes.
- **Phase:** Architecture (Week 1-2)

### 1.4 Odoo Community Missing Features

- **The pitfall:** Community Edition lacks IoT module (barcode scanners, receipt printers), Studio (low-code customization), Help Desk, Marketing Automation, and native mobile app. Most critically: no IoT means no plug-and-play POS hardware integration.
- **Warning signs:** Discovering mid-build that barcode scanners or receipt printers need custom integration code. Spending weeks building what Enterprise gives for free.
- **Prevention:** Map every POS hardware requirement to a Community-compatible solution before writing code. Use Web Serial API or direct USB/IP for hardware. Budget 2+ weeks specifically for POS hardware integration.
- **Phase:** Technical Spike (Week 2-3)

### 1.5 Self-Hosted Operations Burden

- **The pitfall:** Odoo Community has zero official support, no managed hosting, no automatic backups. You own every operational problem -- and clubs expect 99.9%+ uptime.
- **Warning signs:** No backup strategy defined. No monitoring. Running Odoo on a single server with no failover.
- **Prevention:** Deploy Odoo on managed infrastructure (Railway, Render, or AWS ECS) with automated backups from day one. Set up health checks and alerting before beta. Document recovery procedures.
- **Phase:** Infrastructure (Week 3-4)

### 1.6 Odoo Session/Auth Complexity

- **The pitfall:** Odoo uses session-based auth internally. Connecting a Next.js frontend means managing Odoo sessions across SSR, client-side, and API routes -- three different execution contexts. Session cookies don't transfer cleanly between server components and client components.
- **Warning signs:** Random auth failures in production. "Session expired" errors during normal use. Different behavior between dev and prod.
- **Prevention:** Use API key or token-based auth for all server-to-Odoo communication (not session cookies). Create a dedicated Odoo service account for the Next.js backend. Never expose Odoo sessions to the browser.
- **Phase:** Architecture (Week 1-2)

---

## 2. Golf/Club Industry Software

### 2.1 Data Migration Paralysis

- **The pitfall:** Clubs have 5-20 years of member data, billing history, tee time records, and handicap tracking in their current system. Migration is the #1 reason clubs delay or cancel a switch. Average deployment cost including migration: $15,000-$50,000.
- **Warning signs:** No migration tooling built. Assuming clubs will "start fresh." Underestimating the number of data entities (members, billing, reservations, inventory, A/R balances, gift cards, loyalty points).
- **Prevention:** Build a migration toolkit as a first-class feature, not an afterthought. Support CSV/Excel import for the MVP. For beta clubs, offer white-glove migration (Bank + Eli do it manually). Document every field mapping.
- **Phase:** Beta Prep (Week 8-10)

### 2.2 Staff Resistance and Training Load

- **The pitfall:** 37% of golf facilities still use manual booking. The people operating the system daily are often non-technical staff (pro shop attendants, bartenders, seasonal workers). If the system isn't learnable in under 30 minutes, staff will sabotage adoption.
- **Warning signs:** Beta club staff reverting to old system "for now." Features that require more than 2 clicks for common actions. No training materials.
- **Prevention:** Design for the least technical user (seasonal bartender, not Bank). Common actions (ring up a sale, book a tee time, check in a member) must be 1-2 taps. Build 5-minute video walkthroughs for each core workflow. Shadow staff during first week of beta.
- **Phase:** UX Design (Week 3-5), Training (Week 10-12)

### 2.3 Vendor Lock-In Perception

- **The pitfall:** Clubs have been burned by GolfNow (barter model costs courses $100K+/yr in free tee times), Jonas (opaque pricing, no API), and foreUP (113 tracked defections in 2025 due to reliability issues). They're skeptical of any new vendor making big promises.
- **Warning signs:** Club owners asking "what happens to our data if we leave?" and not having an answer. No data export feature. No contract transparency.
- **Prevention:** Make data portability a feature: full CSV/JSON export of all club data at any time. No contracts (already planned). Open API (already planned). Lead sales conversations with "here's how you leave us" -- counterintuitive but builds trust with burned operators.
- **Phase:** Sales Strategy (Week 6-8), built into product from Week 1

### 2.4 Switching Cost Reality

- **The pitfall:** Even "free" software switches cost clubs $15K-$50K in staff training, data migration, operational disruption, and lost productivity during transition. Clubs with Jonas contracts may have cancellation penalties. The real competitor isn't the incumbent software -- it's inertia.
- **Warning signs:** Pitching features instead of ROI. No calculation of what staying with the current system costs. Ignoring the 2-4 week operational disruption during switchover.
- **Prevention:** Build an ROI calculator showing: current system cost + hidden costs (barter tee times, manual processes, missed revenue from no dynamic pricing) vs. ClubOS cost + one-time migration cost. Offer parallel running period where both systems operate simultaneously.
- **Phase:** Sales Strategy (Week 6-8)

### 2.5 Seasonal Business Blind Spot

- **The pitfall:** Golf is heavily seasonal. A beta launching in June (peak season) means clubs have zero tolerance for downtime or bugs -- they're at maximum revenue. Conversely, launching in winter means low usage = less feedback.
- **Warning signs:** Planning beta go-live during tournament season. Not accounting for weather-dependent usage patterns in Denver vs. Louisville.
- **Prevention:** Beta in June is actually ideal IF you run it as a parallel system (ClubOS alongside existing). Never ask a club to go cold-turkey during peak season. Phase 1: read-only dashboard alongside existing system. Phase 2: take over one function (tee sheet). Phase 3: full cutover in shoulder season (October-November).
- **Phase:** Beta Strategy (Week 8-10)

---

## 3. Tee Sheet Systems

### 3.1 Concurrent Booking Race Conditions

- **The pitfall:** Two members hit "book" on the same 8:00 AM Saturday tee time at the same millisecond. Without proper concurrency control, both get confirmed -- then one gets a cancellation email, creating rage and distrust.
- **Warning signs:** No database-level locking on tee time slots. Optimistic concurrency without conflict resolution UI. No load testing of booking flow.
- **Prevention:** Use pessimistic locking (SELECT FOR UPDATE) on tee time slots during the booking transaction. Implement a 60-second hold/reservation pattern: when a user starts booking, the slot is temporarily held. Show real-time availability updates via WebSocket/SSE. Load test with 50+ simultaneous booking attempts on the same slot.
- **Phase:** Core Development (Week 4-6), Load Testing (Week 10)

### 3.2 Lottery Fairness Perception

- **The pitfall:** Tee time lottery algorithms are a political minefield at private clubs. Any perception of unfairness -- whether real or imagined -- creates member complaints to the board. There are 4+ major algorithm families (random, historical-performance, priority-based, hybrid) and no universal "fair" answer.
- **Warning signs:** Implementing only random selection. No transparency into how the lottery works. No audit trail showing why Member A got the 7:30 slot and Member B got 9:00.
- **Prevention:** Make lottery algorithm configurable per club (not one-size-fits-all). Provide full transparency: members can see their score, their history, and how the algorithm works. Keep an immutable audit log of every lottery run. Let clubs choose from at least 3 algorithm types. This is a v1.5 feature -- don't build it for MVP, but design the tee sheet data model to support it.
- **Phase:** Data Model Design (Week 2-3), Feature Build (post-MVP)

### 3.3 Dynamic Pricing Backlash

- **The pitfall:** Dynamic pricing is a headline feature, but clubs that implement it poorly see member revolt. "I pay $50K/year in dues and now you're surge-pricing my tee time?" Private clubs and public courses have fundamentally different pricing tolerances.
- **Warning signs:** Applying Uber-style surge pricing to private club members. No price caps or floors. No advance notice of pricing changes. Treating private and public courses with the same pricing logic.
- **Prevention:** Private clubs: dynamic pricing should optimize ALLOCATION (priority/lottery), not member price. Public courses: dynamic pricing on green fees with clear min/max bounds, advance visibility ("prices drop after 2 PM"), and gradual rollout. Always show the "rack rate" so the discount is visible. Let clubs set their own price bounds.
- **Phase:** Feature Design (Week 5-7), configurable per club

### 3.4 Tee Sheet Display Performance

- **The pitfall:** A tee sheet for a busy day shows 80-120 time slots, each with 1-4 player names, booking status, notes, and pricing. If rendering this grid takes more than 500ms, staff will hate it. Jonas's tee sheet is ugly but fast. Lightspeed's is pretty but occasionally sluggish. Speed wins.
- **Warning signs:** Full page reload on each date change. Fetching all slots via individual API calls. No client-side caching of today's tee sheet.
- **Prevention:** Server-side render the initial tee sheet view. Use a single API call that returns the entire day's tee sheet (denormalized). WebSocket for real-time updates (don't poll). Virtual scrolling if showing multiple days. Target: full tee sheet render in under 200ms.
- **Phase:** Core Development (Week 4-6), Performance Testing (Week 10)

### 3.5 Time Zone and DST Edge Cases

- **The pitfall:** Louisville (Eastern) and Denver (Mountain) are in different time zones. Daylight saving time transitions create a day where 2:00 AM happens twice (fall back) or not at all (spring forward). Tee times booked during the "lost hour" or "repeated hour" silently corrupt.
- **Warning signs:** Storing tee times as local time strings without timezone info. Using JavaScript `Date` without a timezone library. No DST unit tests.
- **Prevention:** Store all times in UTC with explicit timezone metadata. Use a proper timezone library (date-fns-tz or Luxon). Write explicit test cases for DST transitions in both ET and MT. Display times in the club's local timezone.
- **Phase:** Architecture (Week 1-2), tested throughout

---

## 4. POS Systems

### 4.1 Offline Mode Data Conflicts

- **The pitfall:** Clubhouse internet goes down during Friday happy hour. POS switches to offline mode. Bartender opens 15 tabs, processes 40 transactions. Internet comes back -- but the membership database was updated during the outage (new member added, another's card declined). Syncing offline transactions back creates conflicts.
- **Warning signs:** No offline mode at all (instant deal-breaker for clubs). Offline mode that only queues transactions without conflict resolution. No testing of offline-to-online sync.
- **Prevention:** Design offline mode from day one, not bolted on later. Use a local-first architecture: the POS device has a local database (IndexedDB or SQLite via WASM) that syncs bidirectionally. Implement last-write-wins with conflict queue for manual review. Offline transactions get a dollar limit (configurable, default $500). Test by literally unplugging the router during QA.
- **Phase:** Architecture (Week 2-3), Core Development (Week 6-8)

### 4.2 Transaction Speed Requirements

- **The pitfall:** A bartender at a busy golf club bar processes 60-100 transactions per hour during peak. Each extra second per transaction = 1-2 minutes of cumulative delay per hour. If the POS is slower than what they had before, the club will reject the system regardless of other features.
- **Warning signs:** POS screen transitions taking more than 300ms. "Loading" spinners during order entry. Requiring more than 2 taps to ring up a common item (beer, hot dog). No performance benchmarking.
- **Prevention:** Target sub-200ms for every screen transition. Pre-load menu items and member data on POS startup. "Quick order" buttons for the top 10 items. Member lookup by name prefix (type "Smi" to find Smith) with sub-100ms search. Benchmark against physical stopwatch during QA.
- **Phase:** UX Design (Week 3-5), Performance Testing (Week 10-11)

### 4.3 Payment Processing Edge Cases

- **The pitfall:** Real-world payment scenarios that break naive implementations:
  - Split checks (3 members splitting a tab, one pays cash, one card, one member charge)
  - Pre-authorized bar tabs that need tip adjustment after close
  - Offline card captures that decline when connectivity returns (card was cancelled)
  - Member charge accounts with spending limits
  - Gift cards with partial balances
  - Refunds on a different day than the original transaction
  - Voiding a transaction after the batch has settled
- **Warning signs:** Only testing the happy path (one item, one payment method, card approved). No split payment support. No tip adjustment workflow.
- **Prevention:** Map out every payment flow before building. For MVP, support: card, cash, member charge. Split payments = v1 must-have (clubs will demand it). Tip adjustment = must-have for F&B. Gift cards = can wait for v1.5. Test with real payment processor sandbox with deliberately failing cards.
- **Phase:** Feature Design (Week 4-5), Core Development (Week 6-8)

### 4.4 POS Hardware Compatibility

- **The pitfall:** Clubs have existing receipt printers (Star Micronics, Epson), cash drawers, barcode scanners, and card terminals. If ClubOS doesn't work with their existing hardware, you've just added $5K-$10K in hardware costs to the switch.
- **Warning signs:** Assuming all clubs will buy new hardware. No hardware compatibility testing. Using WebUSB/WebSerial APIs without fallbacks.
- **Prevention:** Support the top 3 receipt printer brands via WebSerial/ESC-POS commands. For MVP, target iPad + Stripe Terminal (card reader) as the primary hardware config. Offer a hardware compatibility checklist during sales. Budget a hardware testing week before beta.
- **Phase:** Technical Spike (Week 3-4), Hardware Testing (Week 9-10)

### 4.5 PCI Compliance Overhead

- **The pitfall:** Handling card data means PCI-DSS compliance. Self-assessed SAQ A is manageable (card data never touches your servers). But if you build a custom payment flow that routes card numbers through your backend, you're looking at SAQ D -- 329 requirements, annual audits, and potential liability.
- **Warning signs:** Card numbers being logged or stored anywhere in your system. Building a custom card entry form instead of using a processor's hosted fields. No PCI documentation.
- **Prevention:** Use Stripe or Square's hosted payment elements exclusively. Card data never touches ClubOS servers. Document your PCI scope as SAQ A from day one. Use tokenized payment methods for member-on-file charges.
- **Phase:** Architecture (Week 1-2), enforced throughout

---

## 5. AI Features

### 5.1 Cold Start Problem

- **The pitfall:** AI features like churn prediction, demand forecasting, and smart upsell need 6-12 months of historical data to be accurate. A brand new ClubOS installation has zero data. The AI features that are supposed to differentiate you literally cannot work on day one.
- **Warning signs:** Demoing AI features with fake data that looks impressive but won't exist for real clubs. Making accuracy claims before having real training data. Beta clubs asking "why is the AI wrong?" in week one.
- **Prevention:** Design a 3-tier AI maturity model:
  - **Tier 0 (Day 1-30):** Rules-based heuristics that look like AI but are actually hand-coded logic (e.g., "members who haven't visited in 45 days" = at-risk). Be transparent: "Our AI is learning your club."
  - **Tier 1 (Month 2-6):** Basic statistical models using accumulated data (moving averages, simple trends).
  - **Tier 2 (Month 6+):** Full ML models trained on club-specific data.
  - If club migrates historical data, skip to Tier 1 immediately.
- **Phase:** AI Architecture (Week 3-4), ongoing

### 5.2 Overpromising AI Capabilities

- **The pitfall:** "AI-powered" is on every slide deck in 2026. Clubs will expect ChatGPT-level magic. When the "AI insight" is "Your busiest day is Saturday" (which every club already knows), credibility collapses. 53% of SaaS churn comes from bad onboarding and unmet expectations.
- **Warning signs:** Marketing materials promising "AI" without specifying what it actually does. Demo showing insights that require data you won't have. No graceful degradation when AI confidence is low.
- **Prevention:** Never say "AI" without a specific, measurable claim. Good: "Dynamic pricing increased weekend revenue 12% at our beta clubs." Bad: "AI-powered insights." Ship the rules-based version first, label it honestly, let the ML layer improve over time. Under-promise and over-deliver.
- **Phase:** Marketing/Sales (Week 6+), Product Design (Week 3-5)

### 5.3 Data Quality Garbage-In Problem

- **The pitfall:** Churn prediction needs clean member engagement data. If the POS doesn't track which member made a purchase (because the bartender rang it up as a guest), the data is useless. If tee times are booked by phone and manually entered, timestamps are unreliable. AI accuracy is capped by data capture accuracy.
- **Warning signs:** High percentage of "guest" transactions at clubs where most customers are members. Manual tee time entries without consistent formatting. No data quality dashboard.
- **Prevention:** Make member identification frictionless: member number, name search, QR code on member card, phone number lookup. Every transaction should be tied to a member profile by default. Build a data quality score that surfaces gaps: "73% of transactions are linked to a member profile -- target 90% for AI insights to activate."
- **Phase:** UX Design (Week 3-5), Data Architecture (Week 2-3)

### 5.4 AI Feature Creep

- **The pitfall:** The roadmap lists churn prediction, demand forecasting, dynamic pricing, smart upsell, and member insights. Building all of these for MVP is impossible. Trying to ship 5 mediocre AI features instead of 1 great one dilutes the differentiator.
- **Warning signs:** AI backlog growing faster than it ships. Multiple AI features at 60% completion. No single AI feature that could anchor a sales demo.
- **Prevention:** Pick ONE AI feature for MVP and make it undeniable. Recommendation: **dynamic pricing for tee times** -- it has the clearest ROI ("we increased your weekend revenue 15%"), requires the least historical data (just booking patterns), and is the feature competitors are losing customers over (foreUP lost 75 courses partly for lacking native dynamic pricing).
- **Phase:** Feature Prioritization (Week 2), Development (Week 6-8)

---

## 6. Multi-Market Beta

### 6.1 Split Attention Between Louisville and Denver

- **The pitfall:** Bank is in Louisville, Luis and Michael are in Denver. Running beta in both cities simultaneously means two sets of club relationships, two sets of feedback, two different operational contexts (Louisville municipal courses vs. Denver mountain/resort courses). With one primary developer (Bank), this is a resource trap.
- **Warning signs:** Denver beta club needs are diverging from Louisville beta club needs. Bank spending more time on Zoom coordination than coding. Different feature requests from each market creating two roadmaps.
- **Prevention:** Stagger the betas. Louisville first (Week 10-12): Bank is on the ground, can walk into the club, fix issues in person. Denver second (Week 14-16, post-MVP): Luis and Michael handle on-site, Bank supports remotely. Do NOT try to launch both simultaneously.
- **Phase:** Beta Planning (Week 6-8)

### 6.2 Environment Diversity Creates Bug Surface

- **The pitfall:** Louisville clubs use different POS hardware, different internet providers, different workflows than Denver clubs. A bug that only appears on Denver's specific network configuration takes 3x longer to debug remotely.
- **Warning signs:** "Works on my machine" issues. Bugs that only reproduce at one specific club. No remote debugging capability.
- **Prevention:** Standardize the beta hardware kit (iPad + Stripe Terminal + specific router if needed). Build comprehensive remote logging and error tracking (Sentry + structured logging). Ship a "diagnostic mode" that club staff can activate to capture debug info.
- **Phase:** Beta Prep (Week 8-10)

### 6.3 Feedback Aggregation Chaos

- **The pitfall:** Beta feedback comes from: 2 cities, 4 team members, N club managers, M staff members -- via text, email, Slack, phone calls, in-person conversations. Without a system, critical feedback gets lost in someone's text thread.
- **Warning signs:** "I think someone mentioned that bug last week but I can't find it." Duplicate bug reports. Conflicting feature requests with no way to prioritize.
- **Prevention:** Single feedback channel: one shared tool (Linear, GitHub Issues, or even a shared Notion board). Every piece of feedback gets logged with: who, which club, severity, screenshot/video if applicable. Weekly triage meeting (30 min) to prioritize.
- **Phase:** Beta Prep (Week 8-10)

---

## 7. 90-Day Timeline Risks

### 7.1 Scope Creep (The #1 Killer)

- **The pitfall:** 90 days for tee sheet + POS + member management + booking portal + Odoo integration + AI layer + multi-club support is already aggressive for a solo developer. Every "quick feature" request from Luis, Michael, Eli, or beta clubs adds 2-5 days. Three "quick features" and you've lost two weeks.
- **Warning signs:** Backlog growing faster than it shrinks. "Can we also add..." in every meeting. No written MVP scope document that everyone has signed off on.
- **Prevention:** Write a one-page MVP scope contract. Get Luis, Michael, and Eli to sign off. Anything not on the list goes to "v1.1 backlog" with no debate. Bank has final say on scope during the 90-day build. Review scope weekly -- if something is added, something else must be removed.
- **Phase:** Week 1 (before writing any code)

### 7.2 Odoo Integration Takes Longer Than Expected

- **The pitfall:** "Odoo handles the plumbing" is the core assumption behind the 90-day timeline. If Odoo's APIs are poorly documented (they are), if Community modules have bugs (they do), if the data model doesn't map cleanly to golf club operations (it won't) -- the time savings evaporate. Integration of third-party services typically adds 1-2 weeks per service.
- **Warning signs:** Spending more than 2 weeks on Odoo setup and configuration. Discovering Odoo Community lacks a feature you assumed existed. Writing more Python than TypeScript.
- **Prevention:** Time-box Odoo integration to 2 weeks (Week 2-3). If core functionality can't be proven in that window, have a fallback plan: build the MVP with a simpler backend (Supabase/Postgres) and migrate to Odoo post-launch. The custom frontend + AI are the value -- Odoo is a convenience, not a requirement.
- **Phase:** Technical Spike (Week 2-3) with go/no-go decision at end of Week 3

### 7.3 Solo Developer Bus Factor

- **The pitfall:** Bank is the only developer. If Bank gets sick for a week, has a family emergency (newborn at home), or hits burnout, the entire project stops. There's no one to pick up the code.
- **Warning signs:** Bank working 60+ hour weeks. No documentation of architecture decisions. Code that only Bank understands. No CI/CD (manual deployments only Bank can do).
- **Prevention:** Write just enough documentation that a competent developer could pick up the codebase in 2 days. Set up CI/CD from Week 1 (GitHub Actions + Vercel). Identify a backup developer (contractor, not full-time) who could do emergency bug fixes. Bank should cap at 45 hours/week to avoid burnout -- this is a marathon, not a sprint.
- **Phase:** Week 1 (infrastructure), ongoing

### 7.4 Payment Processor Integration Delays

- **The pitfall:** Stripe or Square account approval, sandbox testing, and production certification can take 2-4 weeks. If you start this process in Week 10, beta launch slips to Week 14.
- **Warning signs:** No payment processor account created. No sandbox credentials. Assuming Stripe integration is "a weekend project."
- **Prevention:** Apply for Stripe Connect account in Week 1. Start sandbox integration in Week 3-4. Have a working payment flow by Week 6. Leave 4+ weeks of buffer before beta.
- **Phase:** Week 1 (application), Week 3-6 (integration)

### 7.5 Beta Club Recruitment Takes Too Long

- **The pitfall:** Finding a club willing to beta test unproven software from an unknown company is harder than building the software. Decision-makers at clubs (GMs, head pros, boards) move slowly. A "yes" in conversation takes 4-6 weeks to become a signed agreement.
- **Warning signs:** No beta club conversations started by Week 4. Relying on "we'll find someone" without specific names. No written beta agreement template.
- **Prevention:** Start beta club conversations NOW (Week 1). Bank's home club (Nevel Meade) and the PSTT municipal courses in Louisville are warm leads. Luis should be having conversations in Denver this week. Prepare a 1-page beta agreement (free access for 6 months in exchange for feedback and a testimonial). Target: verbal commitment from 1 club by Week 4, signed by Week 6.
- **Phase:** Parallel track starting Week 1

### 7.6 Underestimating Testing and Polish

- **The pitfall:** Development "finishes" in Week 10, but the product is full of rough edges: broken mobile layouts, edge cases in the tee sheet, POS errors on specific item combinations. Beta clubs see an unpolished product and lose confidence. You never get a second chance at a first impression.
- **Warning signs:** No dedicated QA time in the schedule. "We'll fix bugs as they come up." No staging environment.
- **Prevention:** Reserve Weeks 10-12 exclusively for testing, polish, and bug fixes. No new features in this window. Set up a staging environment that mirrors production. Create a beta readiness checklist: every core workflow must be tested end-to-end with real (not fake) data.
- **Phase:** Testing (Week 10-12)

### 7.7 Day Job Conflict

- **The pitfall:** Bank and Eli both have full-time jobs at TRT. ClubOS is a side project until it isn't. TRT emergencies, client escalations, and day-to-day responsibilities will compete for the same hours.
- **Warning signs:** Missing ClubOS milestones due to TRT work. Coding at 11 PM instead of during productive hours. Eli unavailable for ops/sales because of TRT deadlines.
- **Prevention:** Block dedicated ClubOS hours (e.g., 6-9 AM before TRT, weekends). Communicate timeline expectations to Luis and Michael honestly: "I have 20-25 hours/week for ClubOS, not 40." Build the schedule around realistic available hours, not aspirational ones.
- **Phase:** Planning (Week 1), ongoing

---

## Critical Path Summary

The pitfalls most likely to kill ClubOS in the first 90 days, ranked by probability and impact:

| Rank | Pitfall | Probability | Impact | Mitigation Cost |
|------|---------|------------|--------|-----------------|
| 1 | Scope creep | Very High | Fatal | Free (discipline) |
| 2 | Odoo integration takes too long | High | Fatal | Medium (fallback plan) |
| 3 | Solo developer burnout/bus factor | High | Fatal | Low (documentation + CI/CD) |
| 4 | Day job conflict | High | High | Free (scheduling) |
| 5 | Beta club recruitment delay | Medium | High | Low (start now) |
| 6 | Cold start AI problem | Medium | Medium | Low (tiered approach) |
| 7 | POS offline mode missing | Medium | High | High (architecture) |
| 8 | Payment processor delays | Medium | Medium | Free (apply early) |
| 9 | Concurrent booking race conditions | Low | High | Medium (proper locking) |
| 10 | Multi-market split attention | Medium | Medium | Free (stagger betas) |

---

## Sources

- [Common Odoo Integration Challenges & Implementation Pitfalls](https://www.fegno.com/common-odoo-integration-challenges-implementation-pitfalls/)
- [Odoo Customization Guide: Avoid These 8 Costly Mistakes](https://silentinfotech.com/blog/odoo-1/8-mistakes-to-avoid-in-odoo-erp-customization-211)
- [Avoid Odoo Integration Headaches](https://www.inwizards.com/blog/avoid-common-odoo-integration-mistakes/)
- [Odoo Community vs Enterprise Comparison](https://www.odoo.com/page/editions)
- [Odoo Community vs Enterprise: Data-Driven Comparison for 2026](https://www.cudio.com/blog/odoo-community-vs-enterprise)
- [Odoo External JSON-2 API Documentation](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)
- [Why Use Odoo as a Headless Backend for React, Next.js](https://www.webbycrown.com/headless-odoo-backend-react-nextjs-flutter/)
- [Odoo Forum: Custom Frontend Integration with Community Edition](https://www.odoo.com/forum/help-1/seeking-recommendations-for-custom-frontend-integration-with-odoo-community-edition-278663)
- [A Crash Course in Golf Management Software - Lightspeed](https://www.lightspeedhq.com/blog/crash-course-golf-management-software/)
- [Ask the Right Questions When Changing Software Vendors - Sagacity Golf](https://www.sagacitygolf.com/resources/ask-the-right-questions-when-changing-software-vendors/)
- [Why Are Golf Courses Leaving foreUP?](https://www.smbgolf.com/smbg-blog/why-are-golf-courses-leaving-foreup)
- [2025 Tee Sheet and Booking Engine Market Moves](https://www.golfcoursetechnologyreviews.org/blog/2025-tee-sheet-and-booking-engine-market-moves-whos-winning-and-whos-falling-behind)
- [Tee Time Lottery - GolfBack Solutions](https://golfbacksolutions.com/tee-time-lottery/)
- [Understanding the Golf Lottery - Sun City West](https://suncitywest.com/wp-content/uploads/2020/11/Understanding-the-Golf-LotteryDec2020.pdf)
- [Dynamic Pricing for Golf Courses Buying Guide 2025](https://www.golfcoursetechnologyreviews.org/buying-guide/dynamic-pricing-for-golf-courses-a-comprehensive-buying-guide-for-2025)
- [POS Offline Mode: Why Your Restaurant Needs It](https://www.spoton.com/blog/pos-offline-mode/)
- [How To Use a POS Offline: Top Systems](https://www.merchantmaverick.com/pos-101-offline-mode/)
- [Offline Card Payments - Toast Platform Guide](https://doc.toasttab.com/doc/platformguide/adminOfflineCCPayments.html)
- [Bar POS System Features You Can't Ignore in 2025](https://lavu.com/7-key-features-you-need-in-a-bar-pos-system/)
- [How SaaS Startups Use AI to Predict Churn](https://www.lucid.now/blog/saas-startups-use-ai-predict-churn/)
- [Customer Churn Prediction: Techniques, Challenges & How AI Helps](https://staircase.ai/learn/churn-prediction/)
- [MVP Software Development Timelines](https://orases.com/blog/understanding-mvp-software-development-timelines/)
- [How to Avoid 8 Mistakes Founders Make with MVPs](https://www.f22labs.com/blogs/how-to-avoid-mistakes-founders-make-with-mvps/)
- [MVP Development: Complete 90-Day Launch Guide](https://vladimirsiedykh.com/blog/mvp-development-90-days-launch)
- [The Beta Program Behind This Startup's Winning Launch](https://review.firstround.com/the-beta-program-behind-this-startups-winning-launch/)
