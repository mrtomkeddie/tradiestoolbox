# Build Brief — Traders Toolkit (traderstoolkit.io)

---

## Overview

| Field | Value |
|-------|-------|
| Agency name | Traders Toolkit |
| Domain | traderstoolkit.io |
| Package | Agency portfolio site (not a client build) |
| Stack | React 19 + TypeScript + Vite + Tailwind + Framer Motion (existing codebase) |
| Codebase | `TradeSync-main/` — solid foundation, needs rebrand + content overhaul |

---

## Positioning

**One-liner:** We build websites for tradespeople, then give them AI tools that work while they're on the job.

**Target audience:** UK trades businesses — plumbers, electricians, roofers, HVAC, carpenters. Owner-operators who are busy, skeptical of agencies, and have been burned by generic web designers who don't understand their business.

**Key differentiators vs. WeGrowTrades and generic agencies:**
1. Trades-only — we don't build sites for cafés or startups. We know your customers.
2. One-off build, you own it — not a monthly subscription you can never escape
3. AI-powered — we use AI in the build process AND offer AI tools as an upsell (voice receptionist, coming soon)
4. Fully async — no calls required. Everything done by message.

---

## Design Direction

### Colour Palette

| Role | Name | Hex | Notes |
|------|------|-----|-------|
| Primary | Brand Orange | `#FF6B00` | Already in codebase — keep it |
| Dark | Dark Slate | `#0F172A` | Already in codebase — keep it |
| Background | Warm White | `#F8F7F4` | Soften from current `#F8FAFC` |
| Text | Near Black | `#111827` | Body copy |
| Muted | Cool Grey | `#6B7A8D` | Supporting text |

### Typography

| Role | Font | Notes |
|------|------|-------|
| Headings | Space Grotesk | Already in codebase — keep it |
| Body | DM Sans | Replace Inter — too generic |

### Feel
Premium but grounded. Not corporate. Not cheap. Looks like it was built by someone who takes craft seriously — which resonates with tradespeople who take their own craft seriously.

### Layout Rules (same as client sites)
- Hero: split layout — text left, visual/mockup right. Never centred stacked.
- No pure black `#000000` — `#0F172A` is the darkest permitted
- Body copy max-width: `65ch`
- No three equal horizontal cards as a primary layout pattern
- Framer Motion: opacity + transform only, easeOut, 0.1s stagger on cards

---

## Site Architecture

### Pages (single-page app, section-based)

| Section | ID | Purpose |
|---------|-----|---------|
| Hero | `#hero` | Hook, value prop, primary CTA |
| How It Works | `#how-it-works` | 3-step async process |
| Services / What You Get | `#services` | Website build + AI upsell |
| Portfolio | `#portfolio` | 2 real client builds (Wayne Edwards, Craig Edwards) |
| Pricing | `#pricing` | 3 tiers — TBD on final numbers |
| Testimonials | `#results` | Placeholder until real ones come in |
| Get Started Form | `#start-build` | Lead capture → Airtable |
| Footer | — | Nav, domain, legal |

### Nav
```
How It Works | Results | Pricing | [Get Started →]
```

---

## Section-by-Section Brief

### Hero
- **Headline:** "Websites built for the trades. AI tools to back them up."
- **Sub:** "We build high-converting sites for plumbers, electricians, roofers and more — then arm you with AI that answers calls and books jobs while you're on site."
- **CTA primary:** "See Our Work" → scrolls to portfolio
- **CTA secondary:** "Get a Free Quote" → scrolls to form
- **Right side:** Mockup of a client site on a phone/laptop (use Wayne Edwards or Craig Edwards screenshot — no photos of people, team, or vans. This is a faceless agency.)
- **Trust bar below hero:** "Trades only · Async delivery · You own it · AI-powered"

### How It Works
3 steps — keep it honest about the async model:
1. **Fill in the form** — tell us your trade, your area, your current site (if any)
2. **We research and build** — we analyse your competitors and build a site that beats them
3. **Review and go live** — you get a preview link, approve it, we handle the rest

### Services
Two cards, not three equal columns:
1. **Website Build** — everything that's in the current pricing tiers
2. **AI Receptionist** *(Coming Soon)* — answers calls 24/7, qualifies leads, books jobs. "Join the waitlist."

### Portfolio
2 cards minimum:
- Wayne Edwards Plumbing & Gas — Llanelli, South Wales. Multi-page SEO site, Growth package.
- Craig Edwards Plumbing — Llanelli. Multi-page, service-page focused.
Each card: business name, trade, location, screenshot/preview, link to staging URL (once deployed).

### Pricing
3 tiers. Prices TBD — leave as placeholders `[PRICE]` for now.
- **Starter** — Single page, basic SEO, async delivery
- **Growth** — Multi-page, deep local SEO, Google review integration
- **Scale** — Full build + AI receptionist setup *(price TBD once AI costs confirmed)*

Add-ons:
- Rush delivery — `[+£TBD]`
- Logo refresh — `[+£75]`
- Monthly maintenance — `[£TBD/mo]`

### Get Started Form
Replace the current tabbed form. Single flow:
- Business name
- Trade (dropdown)
- Location / service area
- Current website URL (optional)
- Package interested in (dropdown)
- Email address
- Submit → POST to Airtable

Remove: style selector (internal decision, not client-facing), "preferred contact method" (we're async — there is no phone call option)

---

## What to Keep from Existing Codebase
- Colour tokens (orange, slate, white) — already correct
- Nav scroll behaviour (blur on scroll)
- Framer Motion animation patterns
- Mobile menu
- Overall component structure

## What to Change
- Agency name: TradeWeb → **Traders Toolkit**
- Body font: Inter → **DM Sans**
- Hero copy — full rewrite
- Form — simplify and wire to Airtable
- Add portfolio section
- Add "Coming Soon" AI section
- Remove style selector from form
- Remove "preferred contact method" from form
- Pricing: mark as TBD

---

## Open Items (do not block build)
- [ ] Final pricing numbers
- [ ] AI receptionist pricing and implementation method
- [ ] Real portfolio screenshots (deploy Wayne Edwards + Craig Edwards to Netlify first)
- [ ] Real testimonials (none yet — use placeholder)
- [ ] Logo / wordmark (text-based for now)
