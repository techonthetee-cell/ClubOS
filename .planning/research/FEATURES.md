# ClubOS Feature Research

> Competitive analysis of what to build, what to skip, and what makes us different.
> Based on deep research of Jonas, PSTT, foreUP, Lightspeed/Chronogolf, Club Caddie, GolfNow, Sagacity, CourseRev, and general market trends (2025-2026).
>
> Last updated: 2026-03-26

---

## 1. Tee Sheet Module

### Table Stakes (Must Have for MVP)

| Feature | Notes | Complexity |
|---------|-------|------------|
| **Visual drag-and-drop tee sheet** | Grid view by time slot. Lightspeed, foreUP, Club Caddie all have this. Color-coded by status (open, booked, checked-in, no-show). | Medium |
| **Configurable time intervals** | 7, 8, 9, 10 min intervals. Every competitor supports this. | Low |
| **Sunrise/sunset auto-adjust** | foreUP does this. Auto-sets first/last tee times by date + GPS. Maximizes rounds/day. | Low |
| **Booking rules engine** | Advance booking windows (members 7-14 days, public 3-5 days), min/max group size, member-only time blocks, guest limits per member. Lightspeed excels here. | Medium |
| **Player search + quick-add** | Lookup by name/phone/member#. Auto-populate returning players. Every system has this. | Low |
| **Group management** | Add/remove players from a tee time, drag players between groups. | Low |
| **Shotgun start support** | Tournament mode -- assign groups to holes. Jonas, Club Caddie, Lightspeed all support. | Medium |
| **Crossover tee support** | Start from hole 1 and hole 10 simultaneously. Jonas supports. Common at 18+ hole facilities. | Medium |
| **Check-in / no-show tracking** | Mark arrivals, flag no-shows, track patterns. Feeds into player reputation. | Low |
| **Automatic confirmation emails** | Email + optional SMS on booking, with reminder 24h before. Reduces no-shows 15-25%. | Low |
| **Waitlist** | When time is full, let players join waitlist. Auto-notify on cancellation. CourseRev does this with AI. | Medium |
| **Rate management** | Member vs. public vs. senior vs. junior vs. twilight vs. weekend rates. Rule-based rate selection. | Medium |
| **Tee sheet notes/blocks** | Block times for maintenance, events, lessons. Staff notes on specific slots. | Low |
| **POS integration** | Tee time items (green fee, cart, range) flow into POS automatically at check-in. Jonas highlights this as key. | Medium (depends on POS) |
| **Reporting** | Rounds played, utilization by day/time, revenue per available tee time, pace of play. | Medium |

### Differentiators (Competitive Advantage)

| Feature | Notes | Complexity | Dependencies |
|---------|-------|------------|--------------|
| **AI demand forecasting** | Predict busy/slow days using historical data + weather + local events + season. NO competitor has this natively (foreUP partners with Sagacity, a separate product). | High | AI package, historical data |
| **AI dynamic pricing** | Auto-adjust rates based on demand forecast. Sagacity charges separately for this ($$$). We build it in. Rule-based + AI hybrid with human override. | High | Demand forecasting, rate management |
| **Weather-reactive pricing** | Auto-adjust when storm forecast clears or bad weather hits. Sagacity and Priswing offer this as separate products. | Medium | Weather API, dynamic pricing |
| **AI tee sheet optimization** | Suggest optimal interval spacing based on pace-of-play data. Identify bottleneck times. | High | Pace data, historical rounds |
| **Pace-of-play monitoring** | Track actual vs. expected pace per group (via check-in times at turn + finish). Surface slow groups. | Medium | Check-in data |
| **Smart waitlist with auto-fill** | AI matches waitlist players to cancellations based on preferences (time range, group size). CourseRev does this but only for phone bookings. | Medium | Waitlist, player preferences |
| **Revenue dashboard** | RevPATT (Revenue Per Available Tee Time) -- the golf equivalent of hotel RevPAR. Real-time, not just reports. | Medium | Booking + rate data |
| **Multi-course single view** | Manage multiple courses/facilities from one tee sheet interface. Lightspeed supports this. Key for resorts and multi-course operations. | High | Multi-tenant architecture |

### Anti-Features (Do NOT Build)

| Feature | Why Not | Who Has It |
|---------|---------|------------|
| **GolfNow-style barter/marketplace** | Courses lose $30K-116K/yr in bartered tee times. Creates competitive displacement. Courses increasingly decoupling from this model. | GolfNow |
| **Overly complex rule builder** | Jonas has dozens of obscure scheduling rules nobody uses. Keep rules simple and let AI handle edge cases. | Jonas |
| **Native handicap calculation** | Use GHIN/USGA API integration instead. Don't reinvent this. | Some legacy systems |
| **Pace-of-play GPS tracking** | Requires hardware on carts. Way too complex for v1. Use check-in timestamps instead. | Tagmarshal (separate product) |
| **Lottery/ballot booking** | Only needed at ultra-exclusive courses. Tiny market. Add in v3 if demand appears. | Some UK systems |
| **Phone-based AI booking agent** | CourseRev already does this well and offers integration. Partner, don't build. Already in PROJECT.md as v2. | CourseRev |

---

## 2. POS Module

### Table Stakes (Must Have for MVP)

| Feature | Notes | Complexity |
|---------|-------|------------|
| **Quick-sale terminal** | Touch-friendly grid of common items (green fees, cart rental, range balls, food items). Big buttons, fast checkout. | Medium |
| **Member charge-to-account** | Swipe/scan member card or search by name. Charge goes to monthly statement. #1 feature for private/semi-private clubs. | Medium |
| **Cash + card payments** | Integrated card reader (Stripe Terminal or similar). Cash drawer support. Split payments. | Medium (payment integration) |
| **Pro shop retail** | SKU-based inventory items (apparel, equipment, accessories). Barcode scanning. | Medium |
| **F&B ordering** | Menu categories, modifiers (no onion, add cheese), kitchen/bar ticket printing or KDS display. | High |
| **Tab management** | Open tabs for members and guests. Transfer items between tabs. Auto-close at end of day option. | Medium |
| **Discounts and promotions** | Percentage off, dollar off, BOGO, happy hour auto-pricing, tournament pricing. | Medium |
| **Gift cards** | Sell, redeem, check balance. Physical and digital. | Medium |
| **Tax calculation** | Auto-apply correct tax rates by item category (food vs. merchandise vs. green fees). | Low |
| **Receipt printing + email** | Thermal printer support. Email receipt option. | Low |
| **End-of-day reconciliation** | Cash count, card batch settlement, daily sales summary, variance reporting. | Medium |
| **Basic inventory tracking** | Stock counts, low-stock alerts, receiving. Not full warehouse management. | Medium |
| **Refunds and voids** | Manager approval workflow. Void in-progress transactions. Process returns. | Low |
| **Tee sheet integration** | When player checks in, tee time items auto-populate POS. Reduces double entry. | Medium (depends on tee sheet) |

### Differentiators (Competitive Advantage)

| Feature | Notes | Complexity | Dependencies |
|---------|-------|------------|--------------|
| **AI upsell suggestions** | When member checks in, suggest items based on purchase history + weather + time of day. "John usually buys a sleeve of Pro V1s -- remind staff." | High | Purchase history, AI package |
| **Member recognition** | When member swipes/scans, show their photo, name, preferences, recent purchases, membership tier, birthday flag. Staff can greet by name. Jonas sells this as a separate "MemberInsight" product. | Medium | Member profiles |
| **Mobile POS (tablet/phone)** | Beverage cart, on-course F&B, pop-up tournament stations. Jonas has this. Lightspeed has this. Essential for modern operations. | High | Offline sync, mobile UI |
| **Spending analytics per member** | Track LTV, average spend per visit, F&B vs. pro shop ratio, spending trends. Feed into churn prediction. | Medium | Member data, analytics |
| **Smart inventory reorder** | AI-suggested reorder points based on sell-through rates + seasonality. Not just static min/max. | Medium | Inventory data, AI package |
| **Beverage cart GPS routing** | Optimize cart route based on where groups are on the course. Push drink orders from the app. | High | Course map, player locations |
| **Kitchen display system (KDS)** | Replace paper tickets with digital display in kitchen. Auto-prioritize, show timing. | Medium | F&B module |
| **Unified reporting with tee sheet** | One dashboard showing revenue by source: green fees, cart, range, F&B, pro shop, events. Cross-reference with tee sheet utilization. | Medium | Tee sheet + POS data |

### Anti-Features (Do NOT Build)

| Feature | Why Not | Who Has It |
|---------|---------|------------|
| **Full restaurant management** | Table management, reservations, multi-course dining -- too complex for v1. Most clubs have simple grill rooms, not fine dining. Support basic F&B, not OpenTable. | Toast, Square for Restaurants |
| **Complex loyalty/rewards program** | Points systems are expensive to build and maintain. foreUP has one but it's basic. Offer simple punch-card style or spend-based tiers instead. Full loyalty is v2. | foreUP |
| **Integrated payment processing** | Don't build a payment processor. Integrate with Stripe Terminal, Square, or existing club merchant accounts. Processing margins aren't worth the compliance burden. | N/A |
| **Full procurement/purchasing** | Purchase orders, vendor management, multi-location warehouse -- overkill. Let Odoo handle backend procurement. POS just needs receiving + stock counts. | Jonas (via Odoo-like ERP modules) |
| **Tip pooling/payroll** | Payroll integration is a compliance nightmare. Let clubs use ADP/Gusto. At most, track tip amounts per employee for export. | Some restaurant POS systems |
| **Self-checkout kiosks** | Very few golf clubs want unmanned checkout. Staff interaction is part of the member experience. Don't build kiosk mode. | Retail POS systems |

---

## 3. Member Management Module

### Table Stakes (Must Have for MVP)

| Feature | Notes | Complexity |
|---------|-------|------------|
| **Member profiles** | Name, photo, contact info, membership type, start date, family linkages, emergency contact. | Low |
| **Membership types + tiers** | Full, social, junior, corporate, family, honorary, etc. Each with different privileges, rates, booking windows. | Medium |
| **Family/household linking** | Link spouse, dependents, and dependents' ages. Auto-age-out junior members. | Medium |
| **Billing + statements** | Monthly statements showing all charges (POS, dues, assessments, minimums). Email + print. | High (Odoo integration) |
| **Dues management** | Recurring monthly/quarterly/annual dues. Prorate on join/leave. Auto-billing. | Medium (Odoo integration) |
| **Account balance + payments** | View balance, make payments online, auto-pay setup. | Medium |
| **Guest tracking** | Who brought which guest, how many times, guest fees applied. Enforce guest limits per membership type. | Medium |
| **Directory** | Searchable member directory (opt-in). Jonas Roster module equivalent. | Low |
| **Communication tools** | Email blasts, segment by membership type or activity. Templates for renewals, events, announcements. | Medium |
| **Document storage** | Signed agreements, waivers, ID photos. Per-member file cabinet. | Low |
| **Status management** | Active, suspended, resigned, deceased, on-leave. Workflow for status changes with approvals. | Medium |
| **Basic reporting** | Member counts by type, new/resigned trends, demographic breakdown, dues revenue. | Medium |
| **GHIN/handicap integration** | Pull handicap index from GHIN. Display on profile. Use for tournament flights. | Low (API call) |

### Differentiators (Competitive Advantage)

| Feature | Notes | Complexity | Dependencies |
|---------|-------|------------|--------------|
| **AI churn prediction** | Predict which members are at risk of leaving based on visit frequency decline, spending drops, complaint patterns, social engagement changes. NO competitor has this. Jonas sells MemberInsight, MetricsFirst, Activity Tracking, and CRM as 4 separate products -- we unify into one. | High | Historical data, AI package |
| **360-degree member timeline** | Single view: every tee time, POS transaction, event attendance, communication, complaint, guest visit, billing event. Chronological. Staff sees everything in one place. | Medium | All module data |
| **Engagement scoring** | Automated score (1-100) based on visit frequency, F&B spend, event participation, app usage, committee involvement. Red/yellow/green dashboard. | Medium | Cross-module data, AI package |
| **Automated retention workflows** | When engagement score drops below threshold, auto-trigger: personal email from GM, invite to upcoming event, offer complimentary guest pass. Configurable rules. | High | Engagement scoring, email system |
| **Predictive lifetime value** | Forecast remaining LTV per member. Prioritize retention efforts on high-value at-risk members. | High | Financial data, AI package |
| **Member sentiment analysis** | Analyze survey responses, complaint text, and communication patterns for sentiment trends. Surface issues before they become resignations. | High | NLP, AI package |
| **Onboarding automation** | New member joins: auto-send welcome packet, schedule orientation, assign a mentor/buddy, create account, issue credentials. Configurable workflow. | Medium | Communication tools, workflow engine |
| **Smart segmentation** | AI-powered segments beyond static lists. "Members who play 2+ times/week but never eat at the grill" or "Families with kids aging out of junior membership next year." | Medium | Cross-module data, AI package |
| **Referral tracking** | Track who referred whom. Auto-credit referral bonuses. Surface top referrers for recognition. | Low | Member profiles |

### Anti-Features (Do NOT Build)

| Feature | Why Not | Who Has It |
|---------|---------|------------|
| **Social network/feed** | Members don't want another social network. They have group chats and WhatsApp. A club Facebook-clone will be a ghost town. | Some club apps |
| **In-app messaging between members** | Privacy concerns, moderation burden, liability. Let them use phone/text. | Some club apps |
| **Complex committee management** | Board governance, voting, minutes -- too niche for v1. Use Google Docs/SharePoint. | Jonas (rarely used) |
| **Full CRM with sales pipeline** | Membership sales pipeline is simple (inquiry -> tour -> offer -> join). Don't build Salesforce. A lightweight kanban board is enough. | Salesforce integrations |
| **Gamification/badges** | Engagement badges ("100 rounds!" "Spent $10K!") feel patronizing at a club. Members aren't mobile game players. | Some fitness apps |
| **Integrated survey builder** | Use Typeform/Google Forms. Building a survey engine is scope creep. Import results for sentiment analysis. | Various standalone tools |
| **Custom mobile app per club** | White-label native apps are expensive to maintain. PWA first. Maybe v3. | Jonas, Clubessential |

---

## 4. Online Booking Portal

### Table Stakes (Must Have for MVP)

| Feature | Notes | Complexity |
|---------|-------|------------|
| **Tee time search + booking** | Date picker, time range filter, # of players. Show available times with prices. One-click book. | Medium |
| **Mobile-responsive design** | 60-70% of bookings happen on mobile. Must be flawless on phone. | Medium |
| **Embeddable widget** | Drop a `<script>` tag on any website. Widget matches club branding (colors, logo). TeeWire, Lightspeed, foreUP all offer this. | Medium |
| **Standalone booking page** | Hosted page at `clubname.clubos.com` or custom domain. For clubs without a website. | Low |
| **Member vs. public pricing** | Members see member rates after login. Public sees rack rates. Different availability windows. | Medium |
| **Guest of member booking** | Member books and adds guests. Guest fees auto-applied. Guest gets confirmation. | Medium |
| **Credit card hold/prepayment** | Require card on file or full prepayment to reduce no-shows. Configurable per rate type. | Medium (Stripe) |
| **Cancellation policy enforcement** | Cancel window (24h, 48h), cancellation fees, refund rules. Clearly displayed at booking. | Low |
| **Confirmation + reminder emails** | Booking confirmation, 24h reminder, day-of weather note. Branded templates. | Low |
| **Add-ons at booking** | Cart rental, range balls, club rental, GPS -- offer at checkout for upsell. | Low |
| **Google Reserve integration** | "Book on Google" button in Maps/Search results. Major traffic source. Lightspeed has this. | Medium (API) |
| **Multi-language support** | At minimum English + Spanish for US market. | Low |

### Differentiators (Competitive Advantage)

| Feature | Notes | Complexity | Dependencies |
|---------|-------|------------|--------------|
| **AI-personalized recommendations** | Returning player sees: "Your usual Saturday 8am is open" or "Based on your preferences, try Tuesday twilight at $35." No competitor does this. | Medium | Player history, AI package |
| **Real-time dynamic pricing display** | Show prices that change based on demand. "Book now at $45 -- price goes to $55 this weekend" with urgency. Sagacity/Priswing offer this as separate products. | Medium | Dynamic pricing engine |
| **Weather-integrated booking** | Show forecast for each day. Highlight "great weather" days. Auto-suggest rain check policy. | Low | Weather API |
| **Group booking + social sharing** | Book a time, share link with friends to fill the group. Friends add themselves. Eliminates back-and-forth texting. | Medium | Booking system |
| **Smart search** | "Find me a Saturday morning time for 4 under $50" -- natural language or filter-based. Most portals are rigid date/time pickers. | Medium | Search engine, AI package |
| **Post-round feedback** | After round, prompt for quick rating (1-5 course condition, pace, experience). Feeds into course insights. | Low | Email system, data pipeline |
| **Conversion analytics** | Track: searches -> views -> bookings -> cancellations. Funnel analysis. What times/prices aren't converting? | Medium | Analytics pipeline |
| **Abandoned booking recovery** | Player starts booking but doesn't finish. Email reminder with the tee time held for 30 min. E-commerce standard, golf hasn't adopted. | Medium | Email system, session tracking |

### Anti-Features (Do NOT Build)

| Feature | Why Not | Who Has It |
|---------|---------|------------|
| **Marketplace/aggregator** | Don't become GolfNow. Courses hate the barter model and brand dilution. ClubOS booking is the CLUB's portal, not a marketplace. | GolfNow, TeeOff |
| **Tee time auction/bidding** | Feels slimy. "Bid on the best tee times" alienates members and regulars. | Some startups tried, all failed |
| **Complex package builder** | "Build your own golf+lunch+lesson package" configurator is scope creep. Offer pre-built packages. | Some resort systems |
| **Built-in reviews/ratings** | Don't host reviews. Google and Yelp handle this. Hosting reviews creates moderation headaches and legal risk. | GolfNow (reviews are contentious) |
| **Social login (Facebook/Apple)** | Email + phone auth is sufficient. Social login adds OAuth complexity and privacy concerns. Google Sign-In only if any. | Various |
| **Multi-course marketplace search** | "Find tee times across all ClubOS courses" -- this makes clubs compete against each other on YOUR platform. Each club gets their own portal. | GolfNow |
| **In-portal advertising** | Never show ads for other courses or products on a club's booking portal. This is their brand, not an ad network. | GolfNow (course listings are effectively ads) |

---

## Cross-Module Dependencies

These features span multiple modules and are critical for the AI advantage:

| Feature | Modules Involved | Priority | Notes |
|---------|-----------------|----------|-------|
| **Unified player/member profile** | All 4 | P0 | Single source of truth. Every module reads/writes to the same profile. This is architectural, not a feature. |
| **AI insights engine** | All 4 | P0 | Shared AI package that all modules consume. Churn prediction, demand forecast, upsell suggestions, engagement scoring all come from one engine. |
| **Real-time event bus** | All 4 | P0 | When a booking happens, POS needs to know. When a member's engagement drops, retention workflow triggers. Event-driven architecture. |
| **Odoo backend sync** | Billing, Inventory, Accounting | P1 | Odoo handles the financial plumbing. Custom frontend reads/writes via Odoo API. |
| **Reporting data warehouse** | All 4 | P1 | All modules feed into a unified analytics layer. Cross-module reports (e.g., "members who play 3+/week but spending is declining"). |
| **Notification system** | All 4 | P1 | Email, SMS, push (PWA). Shared service for confirmations, reminders, alerts, marketing. |

---

## MVP Feature Cut (Recommended)

For the 90-day MVP, focus on these from each module:

### Tee Sheet MVP
- Visual tee sheet with drag-and-drop
- Configurable intervals + sunrise/sunset
- Basic booking rules (advance windows, member vs. public)
- Player search + group management
- Check-in + no-show tracking
- Rate management (static, not dynamic yet)
- POS integration (green fee + cart flow to POS)

### POS MVP
- Quick-sale terminal (touch grid)
- Member charge-to-account
- Card payments (Stripe Terminal)
- Basic pro shop items
- Simple F&B (no KDS, just order + charge)
- Tab management
- End-of-day reconciliation

### Member Management MVP
- Member profiles + family linking
- Membership types with rate rules
- Guest tracking
- Basic billing (Odoo-powered)
- Communication (email blasts)
- Directory

### Online Booking MVP
- Tee time search + book
- Mobile-responsive
- Embeddable widget
- Member vs. public pricing
- Credit card hold (Stripe)
- Confirmation emails
- Add-ons at booking

### AI Layer MVP (Across Modules)
- Member engagement score (simple formula first, ML later)
- Basic demand indicator (historical same-day-of-week comparison)
- Member recognition at POS (photo + name + last visit)

---

## Complexity Estimates

| Complexity | Meaning | Typical Effort |
|-----------|---------|----------------|
| Low | Standard CRUD, API call, simple UI | 1-3 days |
| Medium | Business logic, integrations, moderate UI | 3-7 days |
| High | AI/ML, real-time systems, complex state | 1-3 weeks |

---

## Sources

- [2025 Tee Sheet and Booking Engine Market Moves](https://www.golfcoursetechnologyreviews.org/blog/2025-tee-sheet-and-booking-engine-market-moves-whos-winning-and-whos-falling-behind)
- [foreUP Tee Sheet Software](https://www.foreupgolf.com/tee-sheet-software/)
- [foreUP Golf Course POS](https://www.foreupgolf.com/golf-course-point-of-sale/)
- [Lightspeed Golf Platform](https://www.lightspeedhq.com/golf/)
- [Lightspeed Tee Sheet Management](https://www.lightspeedhq.com/golf/tee-sheet/)
- [Lightspeed Online Booking](https://www.lightspeedhq.com/golf/sales-marketing/online-booking/)
- [Club Caddie Golf Course Management](https://clubcaddie.com/)
- [Jonas Club Software](https://www.jonasclub.com/)
- [Jonas Tee Time Management](https://jonasclub.com/Software/Applications/Tee_Time_Management)
- [Jonas POS (work in progress)](https://www.jonasclub.com/pos-work-in-progress/)
- [GolfNow Barter Model Deep Dive](https://www.golfcoursetechnologyreviews.org/blog/trading-tee-times-for-tech-a-deep-dive-into-golfnows-barter-model-with-paul-sampliner)
- [US Tee-Time Booking Market Analysis](https://growthgcc.com/blog/the-u-s--tee-time-booking-market--who-controls-it--why-golf-clubs-are-losing--and-what-s-next)
- [CourseRev AI Voice Concierge](https://courserev.ai/)
- [Sagacity Golf Dynamic Pricing](https://www.sagacitygolf.com/resources/dynamic-pricing-strategies-for-golf-courses/)
- [Dynamic Pricing Buying Guide 2025](https://www.golfcoursetechnologyreviews.org/buying-guide/dynamic-pricing-for-golf-courses-a-comprehensive-buying-guide-for-2025)
- [Agilysys 2025 Guide to Tee Sheet Software](https://www.agilysys.com/en/blog/a-2025-guide-to-tee-sheet-software-booking-engines-and-golf-course-management-software/)
- [TeeWire Online Tee Times Software](https://teewire.com/online-tee-times-software)
- [Golf Course Management Software Market Outlook 2026-2034](https://www.intelmarketresearch.com/golf-course-management-software-market-35743)
- [Top Golf Course POS Systems 2026](https://www.connectpos.com/5-best-golf-course-pos-systems/)
- [Buz Club Software Golf POS](https://buzsoftware.com/golf-pos-systems)
