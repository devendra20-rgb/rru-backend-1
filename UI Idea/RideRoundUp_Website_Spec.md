# RideRoundUp — Website Build Specification

**Version:** 1.0 (Draft for development team)
**Date:** 8 August 2026
**Status:** For review, then freeze as Sprint 0 baseline
**Owner:** [Founder / Product Owner name]
**Audience:** Frontend, backend, data, design, content and QA leads

---

## 0. How to read this document

This document merges four separate inputs into one buildable brief:

| Source | What it contributed | How it was treated |
|---|---|---|
| `RideRoundUp_Strategy.pdf` — Strategic Product Thesis | Phasing, market sequencing, trust rules, data governance, launch gates | **Adopted as the governing framework.** Where documents conflict, this one wins on *sequencing and risk*. |
| `RRU_Product_Vision.docx` — Product Vision & Feature Roadmap | Module-by-module feature inventory, page fields, AI feature ideas | **Adopted as the feature catalogue.** Its scope is re-sequenced, not reduced — nothing is deleted, items move to later phases. |
| `Ride_Round_Up_Feedback.docx` — Paras' UI/UX feedback | Concrete defects in the current build: navbar, spacing, logo, font, card design, classification depth | **Adopted as the design-remediation brief.** Section 8 answers each point directly. |
| `RRU_Document.txt` — Team ideation notes | Positioning instinct, "autotainment", cost-of-ownership transparency, match score, buy/sell guides, YouTube channel | **Adopted selectively.** The strongest ideas (running cost, hidden costs, match score, autotainment, guides) are promoted into Phase 1. |

**Rule for the dev team:** if something is not in Sections 3–9 of this document, it is not in the current build. Ideas parked in Section 12 are real and approved in principle, but must not be started without written sign-off.

---

## 1. The recommendation — which ideation to build

You asked which of the four directions to follow. The answer is not one of them; it is a specific merge, and the merge has a shape worth stating plainly.

**Build the Strategy document's discipline, using the Vision document's feature list, judged by the Feedback document's UI standard, and differentiated by the Team Notes' cost-transparency ideas.**

Three decisions follow from that, and they are the decisions the whole build hangs on.

### Decision 1 — UAE first, India later. Architecture multi-country from day one.

The two documents disagree here and it has to be settled before a single schema is written. The Vision document leads with India and prices examples in rupees; the Strategy document recommends UAE first. **UAE wins**, for reasons the dev team should understand because it affects data modelling:

- India has roughly an order of magnitude more brand/model/variant/city/on-road-price combinations. On-road price in India varies by state *and* city (RTO, road tax, insurance loading). Getting that wrong publicly is worse than launching later.
- UAE has a smaller catalogue, higher dealer density per square kilometre, a genuinely bilingual requirement (which forces you to build localisation properly instead of bolting it on), and the GCC-spec vs imported-spec distinction — which is a *good* forcing function for a clean variant model.
- Your team is UAE-based. Dealer pilot recruitment, inspection logistics and content authenticity are all cheaper where you physically are.

**Build implication:** every table that holds a price, a listing, a piece of content or a dealer carries a `market_code` from the first migration. There is no "default market". India is a configuration, not a rewrite.

### Decision 2 — Phase 1 is "Discover, Compare, Decide, Connect". Nothing else ships.

The Vision document lists 29 modules plus 12 differentiators. Shipping all of it produces a wide, shallow site that loses to CarDekho and DubiCars on every individual axis. The Feedback document already independently reached the same conclusion about one module ("Financing… not required in current phase").

Phase 1 ships: **new car catalogue, controlled used listings, universal search, comparison, cost-of-ownership tools, content hub, dealer directory, AI assistant, user accounts, lead capture.**

Phase 1 does **not** ship: owned inventory, in-house inspection, home service, e-commerce, insurance issuance, loan underwriting, unmoderated forums.

### Decision 3 — The differentiator is *cost honesty*, not feature count.

This is the most valuable idea across all four documents and it came from the informal team notes, not the consultant deck. The notes ask for "car running cost in Dubai (insurance, service, tax, maintenance)" and "hidden cost in car purchase in between like tax and all".

No major regional competitor does this well. Every one of them shows you a sticker price and then lets the dealer surprise you. RideRoundUp should show, on every single vehicle page, a **Total Cost to Own** panel that includes the costs people actually get ambushed by: registration, Salik/toll, insurance band, annual service, tyres, depreciation curve, and — for used cars — the transfer and inspection fees.

That is a defensible position, it is cheap to build relative to inspection or logistics, it generates enormous long-tail SEO, and it is the thing that makes a first-time buyer trust you. **Section 6.4 specifies it in full.**

### What this means for the four documents

- The **Strategy** doc's Phase 1 scope is correct. Follow it.
- The **Vision** doc's module list is the product backlog for Phases 1–4. Nothing is wasted.
- The **Feedback** doc's UI criticisms are all valid and all must be fixed before public launch. They are not cosmetic — a bad navbar and cluttered cards directly suppress the click-through the whole business model depends on.
- The **Team Notes**' "quality over quantity" instinct is right and is now enforced structurally through launch gates (Section 11).

### One thing to reconsider

Two AI features in the Vision document carry real liability and should not ship as described:

- **AI Car Health Estimator** (upload photos → condition estimate). A photo cannot detect chassis damage, flood history, or engine condition. If a buyer relies on it and the car is bad, you are the reason. Ship it later as *"Photo quality check — is your listing missing angles?"*, which is useful and safe.
- **AI Price Recommendation** as a firm number. Ship as a **range with a confidence level and the comparable listings it was derived from**, never a single figure.

---

## 2. Product definition

**One-line definition:** RideRoundUp helps someone in the UAE decide which car to buy, understand what it will actually cost them to own, and reach a verified dealer — without being sold to.

**Phase 1 user promise (put this on the homepage):**
> Find the right car, know the real cost, talk to a verified dealer.

**Primary personas:**

| Persona | Share of Phase 1 traffic (target) | What they need | Primary conversion |
|---|---|---|---|
| First-time buyer, expat, 25–35 | 35% | Guidance, budget reality, running costs | Guided finder → shortlist → dealer enquiry |
| Known-model buyer | 25% | Variant detail, local price, who has it | Vehicle page → dealer enquiry |
| Used car buyer | 25% | Trust, condition, fair price | Listing → enquiry / inspection request |
| Enthusiast / researcher | 15% | Content, comparisons, news | Newsletter, saved models, return visits |

**North-star metric:** Qualified vehicle decisions per month — a user completes a comparison, saves a shortlist of 2+, submits a dealer enquiry, requests an expert callback, or books a test drive.

**Anti-goals (write these on the wall):**
- Not a banner farm. Sponsored content never exceeds 20% of above-the-fold real estate on any page.
- Not a stale classifieds site. A listing untouched for 30 days is auto-hidden.
- Not a chatbot that guesses. The assistant answers from our database or says it does not know.
- Not a checkout. Phase 1 takes no payments and transfers no vehicles.

---

## 3. Information architecture and URL structure

### 3.1 URL grammar

All URLs follow: `rideroundup.com/{market}/{lang}/{section}/...`

- `{market}`: `ae` at launch. Reserved: `sa`, `in`.
- `{lang}`: `en` | `ar`. Arabic serves RTL layout.
- Root `rideroundup.com` redirects (302, never 301) to detected market after a **confirmation interstitial** — never silently.

**Canonical rules:**
- Every page declares `<link rel="canonical">` to its own market+lang URL.
- `hreflang` pairs `ae/en` ↔ `ae/ar`, plus `x-default` → `ae/en`.
- Prices must never appear on a page whose market does not match the price's market. This is a hard validation, enforced at render time, not a guideline.

### 3.2 Sitemap

```
/ae/en/
├── new-cars/
│   ├── {brand}/                          e.g. /new-cars/toyota/
│   ├── {brand}/{model}/                  model overview
│   ├── {brand}/{model}/{year}/{variant}/ variant detail (the money page)
│   ├── upcoming/
│   ├── launches/
│   └── by/{budget|body|fuel|seats}/{value}/
├── used-cars/
│   ├── {city}/                           /used-cars/dubai/
│   ├── {city}/{brand}/
│   ├── {city}/{brand}/{model}/
│   ├── listing/{id}-{slug}/              individual listing
│   └── by/{budget|body|fuel|year|km}/{value}/
├── compare/
│   ├── {slug-a}-vs-{slug-b}/             up to 4: -vs- chained
│   └── popular/
├── cost-to-own/{brand}/{model}/          the differentiator pages
├── dealers/
│   ├── {city}/
│   └── {dealer-slug}/
├── news/  reviews/  guides/  videos/
├── offers/
├── sell/                                  valuation + list your car
├── wanted/                                buyer request board
├── ai/                                    assistant full-page
├── garage/                                authenticated
├── account/                               authenticated
└── about/ contact/ trust/ privacy/ terms/
```

**Slug rules:** lowercase, hyphenated, no year in model slugs (years live in the path segment), Arabic URLs use transliterated Latin slugs with Arabic `<title>` — do not put Arabic script in the path.

### 3.3 Navigation — top level

Exactly six primary items. The current build's navbar is criticised in the Feedback document for sprawl and dead space; six is the fix.

| Item | Mega-menu contents |
|---|---|
| **New Cars** | Brands (logo grid, 4 cols) · By budget · By body type · Upcoming · Recent launches · *Right rail:* one featured launch card |
| **Used Cars** | By city · By brand · By budget · Verified only · Under 3 years · *Right rail:* "Sell your car" CTA |
| **Compare** | Popular comparisons (6) · Start a new comparison · Saved comparisons (if logged in) |
| **Cost to Own** | Running cost calculator · Hidden costs explained · Insurance guide · Depreciation tracker |
| **Research** | Reviews · News · Buying guides · Selling guides · Videos · Autotainment |
| **Dealers** | By city · By brand · Top rated · Join as a dealer |

Right of the nav: search icon (opens overlay), market/language switcher, saved-cars heart with count, account.

---

## 4. Global components

These are built once, used everywhere. Build them as isolated, documented components before any page is assembled.

### 4.1 Universal search

Single input, present in the header on every page, expanded on the homepage.

**Must accept:**
- Exact: `Toyota Land Cruiser 2025`
- Natural language: `7 seater under 150k`, `best first car in Dubai`, `GCC spec SUV under 80k`
- Shorthand: `80k`, `1.5 lakh`, `AED 200,000`
- Arabic and transliterated input: `تويوتا`, `tayota`

**Behaviour:**
- Debounce 200ms; suggestions after 2 characters.
- Suggestion groups, in this order: Models · Used listings · Body/budget shortcuts · Dealers · Articles.
- Keyboard navigable (↑↓ Enter Esc), ARIA combobox roles.
- Zero-result state offers three fallbacks: nearest budget bracket, closest model match, "ask the assistant".
- Search terms with zero results are logged to a dashboard — this is a content and inventory gap report, treat it as a product input.

### 4.2 Vehicle card — the single most important component

The Feedback document is explicit: cards need USPs to tempt a click, and hover should show more images. This is correct — card CTR is the top of the entire funnel. Specification:

**Layout (default variant, 320×420px at 1x):**

```
┌──────────────────────────────┐
│  [image 4:3]     [♡ save]    │  ← marquee on hover
│  ●●●○  (image position dots)  │
├──────────────────────────────┤
│  [Verified]  [GCC Spec]      │  ← max 2 badges
│  Toyota Land Cruiser          │  ← 17px, semibold
│  2023 · GXR 3.5 V6 · 42,000 km│  ← 13px, muted
│                               │
│  AED 285,000                  │  ← 22px, tabular numerals
│  AED 4,120/mo · Est. runs     │
│  AED 1,850/mo to own          │  ← THE DIFFERENTIATOR
├──────────────────────────────┤
│  ✓ Full service history       │  ← USP chips, max 2
│  ✓ Single owner               │
├──────────────────────────────┤
│  Dubai · Al Awir Motors       │
│  [ View details ] [ Enquire ] │
└──────────────────────────────┘
```

**Rules:**
- **Marquee on hover:** cycles up to 4 images at 900ms intervals, starts after 300ms hover intent, resets on leave. Preload image 2 only; lazy-load 3 and 4 on first cycle. Must respect `prefers-reduced-motion` — when set, show static image with a "4 photos" count instead.
- **On touch devices:** no hover. Show a swipeable image strip with dots.
- **USP chips are derived, not typed.** Generate from structured fields: service history present, single owner, under warranty, low km for year, price below segment median, recently price-dropped. Maximum two, ranked by a fixed priority list. Never let a dealer write free text here.
- **Sponsored cards** carry a visible "Sponsored" label in the badge row, use a 1px accent border, and never exceed 1 in every 8 results.
- Fixed height across a row. No layout shift. Skeleton loader matches final dimensions exactly (CLS target below).

### 4.3 Comparison tray

Persistent bottom bar appearing once one car is marked for comparison. Holds up to 4. Shows thumbnails, remove buttons, and a "Compare (n)" button. Survives navigation. Persists in `localStorage` for guests, syncs to account on login.

The Feedback document identifies side-by-side comparison as a potential USP because competitors do it badly. Two things make ours better and both are cheap: **more than two cars at once** (the team notes explicitly ask for this — "2 se zyada car ke saath, not like CarDekho"), and **a "differences only" toggle** that collapses every row where all vehicles are identical.

### 4.4 Footer

Deep, SEO-weighted, four-column, per the Vision document. Each column caps at 12 links with a "View all" to a hub page. Categories: Used Cars (by city, brand, budget, body) · New Cars (by brand, price, fuel, upcoming) · Research (reviews, news, guides, comparisons, cost to own) · Company (about, contact, dealers, careers, trust, privacy, terms).

Bottom bar: market/language switcher, social links, copyright, and a plain-language line about what RideRoundUp does and does not do (we are not a lender, insurer, or seller of vehicles).

---

## 5. Page specifications — Part A: Discovery

Each page below gives: purpose, section order, required fields, states, and acceptance criteria. Sections are listed in render order top to bottom. Mobile order is the same unless noted.

### 5.1 Homepage — `/ae/en/`

**Job:** get the visitor into one of four paths within 8 seconds — search, browse new, browse used, or get guidance.

| # | Section | Contents | Notes |
|---|---|---|---|
| 1 | Hero | Market/city confirmation chip · headline · universal search · four intent shortcuts | Not a carousel. Carousels have near-zero engagement and hurt LCP. |
| 2 | Quick browse | Budget bands, body types, brands (logo row of 12 + "all") | Horizontal scroll on mobile |
| 3 | "Help me choose" | Guided finder entry, 3-line explainer, illustrative not photographic | Highest-value CTA on the page |
| 4 | Featured used listings | 8 cards, mixed cities, at least 6 verified | Refresh daily; never show a listing older than 14 days here |
| 5 | Cost to Own promo | Interactive mini-widget: pick a car → see monthly running cost | The differentiator, above the fold on mobile scroll 2 |
| 6 | Popular comparisons | 6 pre-built comparison links | Pure SEO + genuine utility |
| 7 | New launches & upcoming | 6 cards, split tabs | "Notify me" on upcoming |
| 8 | Offers | 4 active dealer offers with expiry countdown | Auto-hides when fewer than 3 are live |
| 9 | Research strip | 3 reviews, 2 news, 1 video | Pulled from CMS by recency + editorial pin |
| 10 | Dealers near you | 6 verified dealer cards, geolocated with consent | Falls back to Dubai |
| 11 | Trust block | Four plain statements: what verified means, how prices are dated, that we label sponsored content, that a human can help | Links to `/trust/` |
| 12 | Newsletter | Single field, market-aware, double opt-in | |

**Acceptance criteria:**
- LCP under 2.0s on 4G, mid-tier Android. Hero image preloaded, `fetchpriority="high"`.
- CLS below 0.05. Every async section has a reserved-height skeleton.
- Fully usable with JavaScript disabled for sections 1, 2, 6, 9, 12.
- Arabic version is full RTL: layout mirrors, numerals stay Western Arabic (0-9) for prices, chevrons flip.

### 5.2 New car listing — `/ae/en/new-cars/` and filtered variants

**Layout:** left filter rail (desktop) / bottom-sheet filters (mobile), results grid 3-up desktop / 1-up mobile, sticky result count and sort.

**Filters:** brand (multi) · budget (dual slider + preset bands) · body type · fuel (petrol/diesel/hybrid/EV) · transmission · seats · drivetrain · engine size · features (multi-select: 360 camera, ADAS, sunroof, CarPlay, ventilated seats) · availability status.

**Sort:** Relevance (default) · Price low→high · Price high→low · Newest launch · Most compared.

**Required states:**
- Empty (no filter matches): show nearest-match suggestion, "widen budget by 10%" one-click action, and assistant entry.
- Loading: skeleton cards, never a spinner.
- Error: retry action, no stack traces.
- Applied filters render as removable chips above results, and are reflected in the URL query string so results are shareable and back-button-safe.

**Acceptance:** filter application must not cause a full page reload; results update under 400ms p75 from a warm cache.

### 5.3 New car model page — `/ae/en/new-cars/{brand}/{model}/`

| # | Section | Contents |
|---|---|---|
| 1 | Header | Model name, year, price range "from AED X", body type, key badges, save, compare, share |
| 2 | Media | Gallery: exterior, interior, engine, dashboard, boot, seats · 360° viewer · walkaround video |
| 3 | At a glance | 6 tiles: price from, engine, power, fuel economy, seats, boot litres |
| 4 | Variant selector | Table of all variants: name, engine, transmission, drivetrain, price, key differentiator. Selecting one loads the variant page. |
| 5 | **Cost to Own** | The panel specified in 6.4 |
| 6 | Pros and cons | Editorial, 4 and 4, authored not generated |
| 7 | Specifications | Accordion groups: engine & performance, dimensions & weight, fuel & efficiency, transmission, suspension & brakes, safety, comfort & convenience, infotainment, exterior, warranty |
| 8 | Match score | Personalised "this is a 87% match for you" — only shown if the user has completed the guided finder or has garage data |
| 9 | Expert review | Embedded or linked, with scoring methodology visible |
| 10 | User reviews | Rating breakdown, verified-owner filter, write-review CTA |
| 11 | Compare with | 4 auto-selected rivals by segment and price band, one-click compare |
| 12 | Offers | Live dealer offers on this model, with validity dates |
| 13 | Dealers | Nearest 5 authorised dealers, contact, "check availability" |
| 14 | Related content | Reviews, news, guides, videos, comparisons involving this model |
| 15 | Enquiry | Sticky on mobile: "Get best price" / "Book test drive" |

**Critical data rule:** every price and specification renders with its `last_verified` date visible on hover or tap. If `last_verified` is older than 45 days, the price displays as "AED 285,000 *(price last confirmed 12 June — confirm with dealer)*". This is non-negotiable and comes straight from the Strategy document's trust rules.

### 5.4 Used car search — `/ae/en/used-cars/{city}/`

Filters, in this order (matching how people actually shop):

1. Budget (dual slider, presets)
2. City / emirate
3. Brand & model (cascading)
4. Year range
5. Kilometres range
6. Body type
7. Fuel · Transmission · Seats
8. Seller type (dealer / private / certified)
9. Verified only (toggle)
10. Specification (GCC / imported / American / Japanese) — **UAE-critical, do not omit**
11. Warranty remaining · Service history available · Accident-free declared
12. Colour

**Result density:** 12 per page, infinite scroll with a "load more" fallback and a URL-addressable page number for SEO.

**Map view toggle:** cluster pins by listing location. Deferred to Phase 2 if it threatens the timeline — flag early.

### 5.5 Used car listing detail — `/ae/en/used-cars/listing/{id}-{slug}/`

| # | Section | Contents |
|---|---|---|
| 1 | Gallery | Minimum 8 images enforced at upload · 360° where available · video · full-screen viewer with keyboard nav |
| 2 | Title block | Year Make Model Variant · price · price rating badge (below/at/above market) · save · share · compare |
| 3 | Key facts strip | Km · year · transmission · fuel · specification · owners · colour · location |
| 4 | Price context | "This is AED 12,000 below the average for similar cars in Dubai" with the comparable set expandable. Never a bare number. |
| 5 | **Cost to Own** | Running cost for *this specific car* given its age and mileage |
| 6 | Condition & verification | Verified badge with scope defined, inspection report if present, condition score, declared accident history |
| 7 | Full specification | Same accordion structure as new cars |
| 8 | Seller | Dealer card with rating, response time, other listings, location map, verified status |
| 9 | Contact | Enquiry form · call (masked number) · WhatsApp (tracked) · book test drive · request inspection |
| 10 | Similar listings | 6, same city, ±20% price |
| 11 | Related content | Model review, buying guide, comparison |

**Enquiry form fields:** name, phone (with country code, validated), email, message (prefilled: "Is this car still available?"), timeframe (this week / this month / just researching), finance interest (yes/no/not sure), trade-in (yes/no).

That timeframe and finance field is what converts a raw click into a *qualified* lead — which is the entire dealer revenue model. Do not let it be dropped for "form simplicity".

**States:** sold (banner + similar cars, page stays live for SEO with `noindex`), expired, price-dropped (show old price struck through with date), reserved.

### 5.6 Comparison — `/ae/en/compare/{a}-vs-{b}/`

**Supports 2 to 4 vehicles.** Desktop: fixed left label column, horizontally scrollable vehicle columns. Mobile: first vehicle pinned, others swipe.

**Row groups:** price & offers · engine & performance · fuel & running cost · dimensions · safety (with NCAP where available) · comfort & convenience · infotainment · exterior · warranty · **total cost to own over 3 and 5 years**.

**Required controls:**
- **"Show differences only"** toggle — collapses identical rows. This is the feature competitors lack.
- Per-row "best" highlight where a row is objectively orderable (higher power, lower price, better economy). Never highlight subjective rows.
- Verdict block: "Best on value", "Best for families", "Best for running cost" — editorially defined rules, not AI-generated prose.
- Save comparison (account) · share via URL · export to PDF.

**Acceptance:** comparison URL is deterministic and canonical — `toyota-land-cruiser-vs-nissan-patrol` and `nissan-patrol-vs-toyota-land-cruiser` resolve to one canonical URL, alphabetically ordered, the other 301s.

---

## 6. Page specifications — Part B: Decision tools

### 6.1 Guided car finder — `/ae/en/find-my-car/`

One question per screen, progress bar, back always available, answers editable at the summary step. Maximum 8 questions.

1. New, used, or open to both?
2. Budget — total, or monthly? (both paths accepted)
3. Who's riding? (solo / couple / small family / large family / need 7 seats)
4. Mostly driving where? (city / highway commute / desert & off-road / mixed)
5. What matters most? (rank 3 of: running cost, resale value, space, performance, tech & features, comfort, safety)
6. Fuel preference (petrol / hybrid / electric / no preference — with a one-line note on charging availability)
7. Parking situation (tight / normal / spacious) — drives size recommendations
8. When are you buying? (this month / 1–3 months / just exploring)

**Output:** 5 recommended vehicles, each with a **match score** and — this matters — a **plain-language reason**: "92% match — 7 seats, strong resale in the UAE, and the lowest service cost in its class." The team notes explicitly asked for a match percentage; the reason is what makes the number credible rather than decorative.

Also output: one "stretch" option slightly above budget with the delta stated, and one "save money" option below budget. Results are savable and shareable.

### 6.2 AI assistant

**Placement:** persistent launcher bottom-right, plus a full page at `/ae/en/ai/`, plus contextual entry on vehicle pages ("ask about this car").

**Hard architectural requirement — retrieval-grounded only.** The assistant answers from: the vehicle database, live listings, published editorial content, dealer records, and market configuration. It does not answer from model memory. If retrieval returns nothing relevant, the correct response is "I don't have verified information on that — want me to connect you with one of our advisors?"

**Answer format, every time:**
1. Direct answer
2. Assumptions made (market, budget, spec)
3. Relevant vehicles or listings as cards
4. Source links and data timestamps
5. One suggested next action

**Refuse and escalate on:** mechanical diagnosis, accident/legal advice, loan approval likelihood, insurance recommendations, registration/customs procedure, anything safety-critical, any request for a guarantee.

**Logging:** every conversation stores retrieved sources, whether the user marked it helpful, and whether it escalated. Unhelpful answers create a content-gap ticket automatically. This turns the assistant into a product research instrument, which is most of its early value.

### 6.3 Autotainment — `/ae/en/autotainment/`

From the team notes, and worth building in Phase 1 because it is cheap, distinctive, and gives social media something to post daily.

A feed of short-form automotive content: facts, "did you know", myth-busting, spec trivia, historical models, weird engineering decisions, UAE-specific automotive culture. Card format, swipeable on mobile, each card shareable as an image to Instagram/WhatsApp with the RideRoundUp watermark.

Each card links to a relevant model or guide page — so it is a genuine traffic funnel, not a novelty. CMS-managed, one card per weekday minimum.

### 6.4 Cost to Own — the differentiator

**This is the most important spec in this document.** It appears as a panel on every vehicle page and as standalone pages at `/ae/en/cost-to-own/{brand}/{model}/`.

**Panel structure:**

```
YOUR MONTHLY COST TO OWN
Based on: [Dubai ▾] [15,000 km/year ▾] [3 years ▾]

Finance / depreciation      AED  2,450
Insurance                   AED    390   (comprehensive, 30yo, clean)
Fuel                        AED    620   (@ AED 2.90/L, 11.4 L/100km)
Servicing & maintenance     AED    310   (dealer schedule)
Tyres (amortised)           AED     95
Registration & testing      AED     35
Salik / tolls               AED     80   (est. 4 crossings/day)
─────────────────────────────────────
TOTAL                       AED  3,980/month
                            AED 143,280 over 3 years

⚠ HIDDEN COSTS AT PURCHASE
Registration transfer       AED    420
Insurance (year 1, upfront) AED  4,680
Number plate                AED    350
Bank processing (if financed) AED 1,850
Inspection (used cars)      AED    350
─────────────────────────────────────
Budget on top of price      AED  7,650

[ How we calculate this ]  [ Adjust assumptions ]
```

**Requirements:**
- Every input is user-adjustable and every assumption is visible. A cost figure with a hidden assumption is worse than no figure.
- Fuel consumption comes from the variant record, fuel price from a configured market rate with a `last_updated` date.
- Insurance is a **band with a range**, driven by vehicle value, age, and body type — clearly labelled "estimate, actual quotes vary".
- Depreciation uses a per-segment curve, maintained as editable configuration, not hard-coded.
- Every figure carries a source and date. The methodology page is public.
- Comparison pages surface a 3-year and 5-year total.

**Why this earns its build cost:** it is the answer to "how will we stand out" from the team notes, it produces thousands of indexable long-tail pages ("Toyota Land Cruiser running cost in Dubai"), it is the reason a user comes back, and no regional competitor does it honestly.

### 6.5 Sell your car — `/ae/en/sell/`

Phase 1 scope is **valuation + listing creation + dealer lead**, not managed sale.

Flow: vehicle details (make/model/year/variant/km/condition/service history/accidents) → indicative valuation **range** with comparables shown → choose path: list it yourself (free) or get dealer offers (we route to verified dealers).

**Never show a single valuation number.** Show a range, the confidence level, and the listings it was derived from. The Vision document's "AI Price Recommendation" is implemented this way.

### 6.6 Buyer request board — `/ae/en/wanted/`

From the Vision document, and a genuinely good idea: users post what they're looking for; verified dealers respond.

**Post fields:** budget range, city, new/used, body type, fuel, transmission, seats, timeframe, free-text note (moderated).
**Privacy:** the poster's contact details are never public. Dealers respond in-platform; contact is exchanged only when the buyer accepts.
**Moderation:** all posts queue for approval in Phase 1. No exceptions. Rate-limit to 2 active posts per user.

---

## 7. Page specifications — Part C: Content, dealers, accounts

### 7.1 Content hub

`/news/` · `/reviews/` · `/guides/` · `/videos/` · `/autotainment/`

**Article page requirements:** named author with profile and credentials · publish and last-updated dates · reading time · category · related vehicles pulled from structured data (never retyped) · sponsored disclosure banner where applicable · share tools · newsletter inline · related articles.

**Guides needed at launch** (from the team notes — "guide to buy a car and guide to sell a car"):
- How to buy a used car in the UAE — the 12-point checklist
- What a car actually costs to run in Dubai
- GCC spec vs imported: what changes and why it matters at resale
- New vs used in the UAE — the resale maths
- How to inspect a used car before you pay
- Selling privately vs to a dealer — what you lose and gain
- First car in the UAE: licence, insurance, registration, finance

These are conversion assets, not blog filler. Each links into search results and cost-to-own pages.

**Editorial rules:** sponsored content is visually distinct and labelled at the top. Reviews state the exact variant tested and the market. Scoring methodology is published. Content is reviewed or archived when prices or regulations change.

### 7.2 Dealer directory and profile

**Directory:** filter by city, brand, dealer type (authorised/independent/certified), rating, verified status.

**Profile page:** name, verified badge with scope, brands served, address with map, opening hours, phone (masked), WhatsApp (tracked), rating with breakdown, response time, review list with right of reply, full inventory with the standard search UI, active offers, "about this dealer".

### 7.3 User account and My Garage

**Account:** saved cars, saved searches with alerts, saved comparisons, enquiry history with status, followed brands/models, notification preferences, language/market, delete account.

**My Garage** (Phase 1, minimal version — expands in Phase 4): add owned vehicles, store registration/insurance/warranty expiry dates, get reminders, see current estimated value of owned cars with trend, service log. Keep it small in Phase 1; the value is in establishing the habit and the data, not the feature count.

### 7.4 Dealer portal

Separate authenticated application at `dealers.rideroundup.com`.

**Modules:** onboarding & verification (trade licence upload, address verification, brand relationship) · inventory (add, edit, bulk CSV, feed status, duplicate warnings, expiry, mark sold) · leads inbox (requirement details, SLA timer, assign, notes, outcome logging) · offers (create, validity, city, stock) · analytics (views, saves, enquiries, response rate, cost per lead) · reviews (view, respond) · billing.

**SLA enforcement:** leads unanswered after 4 working hours escalate to a RideRoundUp advisor and count against the dealer's response score, which is publicly displayed. Dealers must be told this at onboarding.

### 7.5 Admin and CMS

Vehicle data management with approval workflow · content authoring and scheduling · dealer verification queue · listing moderation queue · buyer-request moderation · lead routing rules · user support tools · AI conversation review · data-correction queue · full audit log of who changed what and when · feature flags per market.


---

## 8. Design system — and the response to the UI feedback

The Feedback document raises seven specific problems with the current build. Each is answered here with a concrete instruction. **All seven are launch blockers.**

### 8.1 "Font and logo should be updated"

**Logo brief.** Commission a proper wordmark. Requirements: legible at 24px height in the header and at 512px for app icons; works in single colour; has a standalone mark (the "RRU" monogram or an abstracted form) for favicons, social avatars, and the Autotainment watermark; works on both light and dark backgrounds; does not rely on a stock car silhouette or a speedometer.

**Typography.** Move off system defaults. Recommended pairing, both with strong Arabic companions — which is a hard requirement, not a nice-to-have:

| Role | Typeface | Use |
|---|---|---|
| Display | **Söhne** or **Aeonik** (alt: Inter Tight, Archivo) | Headlines, model names, price figures |
| Body | **Inter** or **IBM Plex Sans** | Everything else |
| Arabic | **IBM Plex Sans Arabic** or **Almarai** | Full RTL, weight-matched to the Latin faces |
| Numerals | Tabular figures, always | Prices, specs, comparison tables — non-tabular numerals in a price column look broken |

**Type scale** (rem, 16px base): 0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 1.875 / 2.25 / 3. Nothing outside this scale. Line height 1.5 for body, 1.2 for display.

### 8.2 "The navbar and menu bar is looking really bad, with all the empty space and bad spacing"

This is the most damaging of the seven — it is the first thing every visitor sees. Fix specification:

- **Height:** 64px desktop, 56px mobile. Sticky with a subtle shadow appearing on scroll past 100px.
- **Horizontal padding:** 24px mobile, 48px tablet, 64px desktop. Content max-width 1440px, centred.
- **Six nav items only** (Section 3.3). Gap between items: 32px. If items don't fit at 1024px, the answer is fewer items, not smaller type.
- **No dead space:** logo left, nav items left-aligned starting 48px after the logo, utilities right-aligned. Do not centre the nav with large gaps on both sides — that is the specific defect in the current build.
- **Mega-menu:** opens on 150ms hover intent (not instant, not click), full-width panel, max-height 480px, 4-column grid with 32px gutters, closes on Esc or outside click, fully keyboard navigable.
- **Mobile:** hamburger opens a full-screen drawer with accordion sections, search pinned at top, market switcher at the bottom.

### 8.3 "Vehicle classification can be better — sub-headers to divide by body-type, mileage, other major attributes"

The ZigWheels reference is the right one. Implement as **browse hubs** with real sub-headers, not a flat filter list:

`/ae/en/new-cars/by/body/` renders sections: SUVs · Sedans · Hatchbacks · Coupes · Crossovers · Pickups · MPVs · Convertibles — each with a count, a representative image, a one-line description, and 4 popular models.

Repeat the pattern for: by budget (under 50k / 50–100k / 100–200k / 200–400k / 400k+) · by fuel · by seats · by use case (family / off-road / city commute / highway / luxury / first car). These pages are simultaneously the classification fix and the strongest SEO asset the site has.

### 8.4 "Car cards should include the USPs… hovering can have the marquee images"

Specified in full in Section 4.2. Build that component first; everything else depends on it.

### 8.5 "For a clean and good UI, take a reference from carvana.com/cars"

The transferable qualities from that reference are: generous whitespace, one clear action per card, restrained colour, large legible pricing, and a filter rail that doesn't shout. Take those. **Do not** copy the layout — the whole point of Section 8.1 is a distinct identity.

**Colour tokens** — pick a direction that is not the automotive-default red-and-black:

| Token | Value | Use |
|---|---|---|
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-sunken` | `#F6F7F9` | Page background |
| `--ink` | `#0F1720` | Primary text |
| `--ink-muted` | `#5B6875` | Secondary text |
| `--border` | `#E3E7EC` | 1px hairlines |
| `--accent` | `#0B5FFF` (or a chosen brand hue) | Primary actions, links |
| `--accent-quiet` | `#EBF1FF` | Accent backgrounds |
| `--verified` | `#0F8B5F` | Verification badges only |
| `--alert` | `#C4451D` | Price drops, expiring offers, errors |

Radius scale: 6 / 10 / 16px. Shadow: two levels only. Spacing: 4px base grid, steps 4/8/12/16/24/32/48/64.

### 8.6 "Community building… social media tagging"

Phase 1 delivers: social share on every listing, comparison, and Autotainment card, with correct Open Graph and Twitter card images generated per-page. User-generated community (forums) is Phase 2 and only launches when moderation staff exist — the Strategy document is right that an unmoderated forum is a liability, not an asset.

### 8.7 "Virtual garage" and "Financing not required in current phase"

Garage: minimal version in Phase 1, per Section 7.3. Financing: agreed — Phase 1 ships **calculators and education only** (EMI, down payment, tenure, eligibility explainer). No applications, no partner routing, no pre-approval. This matches both the Feedback and Strategy documents.

### 8.8 Accessibility floor (non-negotiable)

WCAG 2.1 AA. Visible keyboard focus on every interactive element. 4.5:1 contrast on text. All images have alt text (vehicle images: "2023 Toyota Land Cruiser GXR, front three-quarter view"). Forms have real labels, not placeholders. `prefers-reduced-motion` respected by the card marquee, the 360 viewer, and all transitions. Full RTL support tested by an Arabic reader, not by mirroring alone.

---

## 9. Data model

The vehicle hierarchy is the company's most valuable asset. Get it wrong and every downstream feature — comparison, AI, valuation, SEO — inherits the error.

### 9.1 Canonical hierarchy

```
Market → Brand → Model → Generation → ModelYear → BodyStyle
       → Variant → Powertrain → Transmission/Drivetrain
       → LocalSpecification → PriceRecord
```

### 9.2 Core entities

| Entity | Key fields |
|---|---|
| `market` | code, name, currency, locale(s), tax_basis, fuel_price, price_label_convention, active |
| `brand` | slug, name_en, name_ar, logo, country_of_origin, markets[] |
| `model` | brand_id, slug, name, body_styles[], segment, status (current/upcoming/discontinued) |
| `generation` | model_id, code, year_start, year_end |
| `variant` | generation_id, model_year, name, engine_code, power_hp, torque_nm, transmission, drivetrain, seats, fuel_type, consumption_l100km, spec_json, market_id |
| `price_record` | variant_id, market_id, city_id, amount, currency, basis (ex-showroom/on-road/starting-from), source, effective_date, **last_verified_at** |
| `listing` | variant_id, dealer_id OR seller_id, market_id, city_id, price, km, year, colour, spec_origin (GCC/import), condition, owners, service_history, accident_declared, images[], status, verified_scope, created_at, **last_refreshed_at**, expires_at |
| `dealer` | legal_name, trade_licence, verification_status, verification_scope, brands[], locations[], response_score, rating, package_tier |
| `lead` | user_id, listing_id/variant_id, dealer_id, requirements_json, timeframe, finance_interest, trade_in, status, sla_due_at, outcome, outcome_reason |
| `content` | type, market_id, lang, author_id, title, body, related_variants[], sponsored_by, published_at, last_reviewed_at, status |
| `cost_assumption` | market_id, segment, fuel_price, insurance_rate_band, service_cost_year, tyre_cost, depreciation_curve_json, registration_fee, effective_date |

### 9.3 Data quality rules (enforce in code, not policy)

1. Every `price_record` and specification field carries `source`, `market`, `effective_date`, `last_verified_at`. No exceptions, no nullable `last_verified_at`.
2. Conflicting source values raise an editorial review task — never silent overwrite.
3. Variants inherit model-level data but local overrides always win.
4. Listings auto-expire at 30 days unless refreshed by the dealer. Expired listings return HTTP 200 with a "no longer available" state and `noindex`, preserving link equity.
5. Deduplicate listings on VIN/chassis where available, plus perceptual image hash plus attribute match. Flag, don't auto-delete.
6. A user-reported data error creates a ticket and is visible to the data team within one hour.
7. **No price renders on a page without its date.** Enforce in the price component itself so it cannot be bypassed.

---

## 10. SEO, performance and technical requirements

### 10.1 SEO

- Server-side rendered or statically generated for all public pages. A client-rendered vehicle catalogue will not rank against CarDekho or DubiCars.
- Structured data: `Vehicle`, `Car`, `Product` with `Offer`, `AggregateRating`, `Review`, `BreadcrumbList`, `FAQPage`, `Organization`, `LocalBusiness` for dealer pages.
- Unique title and meta description per page, templated but variable-rich.
- XML sitemaps split by section, capped at 45,000 URLs each, regenerated nightly.
- Internal linking: every vehicle page links to its comparisons, its cost-to-own page, its city-level used listings, and its related guides.
- **No thin pages.** A brand/body/budget combination page only generates if it has 3+ genuine results. Empty permutation pages will get the whole site classified as doorway spam.
- Breadcrumbs on every page, rendered and marked up.

### 10.2 Performance budgets (enforce in CI, fail the build)

| Metric | Budget |
|---|---|
| LCP (mobile, 4G, p75) | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.05 |
| JS bundle, initial route | ≤ 180KB gzipped |
| Image format | AVIF with WebP fallback, responsive `srcset`, lazy below fold |
| Time to first byte | ≤ 400ms from UAE |

CDN with a UAE/Middle East edge presence. Vehicle images served from an image CDN with on-the-fly resizing.

### 10.3 Suggested stack

Not mandatory, but this combination is well-suited and hiring is easy for it in the region:

- **Frontend:** Next.js (App Router) with ISR — gives SSR for SEO plus static speed for the catalogue.
- **Backend:** Node/NestJS or Django. Separate the vehicle PIM from the application API from the start.
- **Database:** PostgreSQL. Vehicle spec JSON in `jsonb` with indexed common fields.
- **Search:** Elasticsearch or Typesense. Do not build faceted search on SQL — you will rewrite it within six months.
- **AI retrieval:** vector store over vehicle records + published content, with strict source filtering per market.
- **Media:** S3-compatible object storage + Cloudinary or imgix.
- **Analytics:** GA4 plus a product analytics tool with a defined event taxonomy (see 11.2).

### 10.4 Security and compliance

- HTTPS everywhere, HSTS, CSP, rate limiting on all enquiry and search endpoints.
- Phone numbers masked in the UI; real numbers only exposed to the assigned dealer.
- Dealer trade licence documents encrypted at rest, access-logged.
- UAE PDPL-aligned: explicit consent for marketing, data export and deletion self-service, purpose limitation, retention schedule documented.
- Cookie consent that actually gates non-essential scripts.
- Full audit trail on vehicle data, listing status, verification status, and content changes.

---

## 11. Launch gates, analytics and QA

### 11.1 Public launch gates — all must pass

| Gate | Condition |
|---|---|
| Vehicle data | Top 15 UAE brands, all current models, variant-complete, editorially reviewed. Spot-check accuracy ≥ 98% on price and ≥ 95% on key specs. |
| Inventory | Minimum 400 live listings across 5+ pilot dealers, freshness SLA met for 14 consecutive days, sold cars removed within 24h. |
| Search | Top 100 intended queries return relevant results. Zero-result rate below 4%. No cross-market price leakage in any test. |
| Comparison | Variant mapping verified correct on 50 sampled comparisons. Readable on a 360px viewport. |
| Cost to Own | Methodology reviewed and published. All assumptions sourced and dated. |
| Leads | 100% of test enquiries tracked, routed, acknowledged, and outcome-loggable. |
| AI | Zero unsupported price or spec claims across a 200-question evaluation set. Escalation works in production. |
| Content | 25 published pieces minimum, including all 7 launch guides. |
| UI | All seven Feedback-document items closed and signed off by Paras. |
| Accessibility | Automated scan clean, manual keyboard and screen-reader pass, Arabic RTL reviewed by a native reader. |
| Performance | All budgets in 10.2 met on staging under production-like data volume. |
| Legal | Terms, privacy policy, dealer agreement, content disclosure policy reviewed by UAE counsel. |

### 11.2 Event taxonomy (define before build, not after)

Minimum events: `search_performed` (query, results_count, filters) · `filter_applied` · `vehicle_viewed` · `listing_viewed` · `card_clicked` (position, sponsored flag) · `comparison_started` / `comparison_completed` · `finder_started` / `finder_completed` · `cost_to_own_interacted` · `save_added` · `enquiry_submitted` (with qualification fields) · `dealer_contacted` (channel) · `ai_message_sent` / `ai_escalated` / `ai_rated` · `account_created` · `alert_created`.

Every event carries: market, language, device, logged-in state, session, and traffic source.

### 11.3 QA requirements

Cross-browser: Chrome, Safari (iOS especially — high share in the UAE), Firefox, Edge. Devices: iPhone 12+, mid-range Android, iPad, 1366px and 1920px desktop. RTL tested as a full pass, not a spot check. Test with realistic data volume (10,000+ listings), not 20 seeded rows — pagination, search and filter bugs only appear at scale.

---

## 12. Build sequence

Indicative, assuming a team of roughly 6–8 (2 frontend, 2 backend, 1 data, 1 designer, 1 QA, PM).

| Sprint | Weeks | Deliverable |
|---|---|---|
| 0 | 1–2 | Data model finalised, design system and tokens, component library skeleton, environments, CI with performance budgets |
| 1 | 3–4 | Vehicle PIM + admin CRUD, brand/model/variant ingestion for top 5 brands, search index |
| 2 | 5–6 | Vehicle card component, new car listing + model + variant pages, filter rail |
| 3 | 7–8 | Used car listings, listing detail, dealer entity, dealer profile pages |
| 4 | 9–10 | Universal search, comparison engine, comparison page with differences-only |
| 5 | 11–12 | **Cost to Own** engine, panels, standalone pages, methodology page |
| 6 | 13–14 | Accounts, saved cars/searches/comparisons, alerts, minimal Garage |
| 7 | 15–16 | Dealer portal: onboarding, inventory, leads inbox, SLA |
| 8 | 17–18 | Guided finder, match score, AI assistant with retrieval + escalation |
| 9 | 19–20 | CMS, content hub, Autotainment, launch guides, Arabic localisation pass |
| 10 | 21–22 | SEO hardening, structured data, performance tuning, accessibility remediation |
| 11 | 23–24 | Private beta with pilot dealers, data QA, launch-gate verification |
| 12 | 25–26 | Fixes, soft launch, monitoring, public launch |

**Sequencing rule:** the vehicle card (Sprint 2) and the data model (Sprint 0) block almost everything. Over-invest in both.

---

## 13. Deferred backlog

Approved in principle, not in this build. Nothing here starts without written sign-off and a gate being met.

| Item | Source | Earliest phase | Gate before starting |
|---|---|---|---|
| Dealer self-service onboarding at scale | Strategy | 2 | 25+ dealers onboarded manually first |
| Private seller listings | Strategy, Vision | 2 | Moderation team staffed |
| Negotiation / propose-your-price | Strategy | 2 | Dealer response SLA consistently met |
| Forums / community | Vision, Feedback | 2 | Moderation tooling + staff |
| Test drive booking with live calendars | Vision | 2 | Dealer portal adoption above 70% |
| Finance partner routing & pre-qualification | Vision, Feedback | 2–3 | Regulatory review of intermediary status |
| Insurance comparison & referral | Vision | 2–3 | Regulatory review |
| Inspection service & reports | Strategy, Vision | 3 | Inspector network + QA process |
| Managed selling / dealer auction | Strategy | 3 | Valuation accuracy proven |
| Full My Garage: service history, expenses, reminders | Vision, Feedback | 4 | Account adoption above 20% of returning users |
| Service centre booking, home service, detailing | Strategy, Vision | 4 | Partner network signed |
| EV charging map, battery health, subsidies | Vision | 4 | Reliable charging data source |
| Accessories / parts e-commerce | Vision | 4 | Fitment data + returns process |
| AI maintenance predictor | Vision | 4 | 12 months of service data |
| Road trip planner | Vision | 4 | — |
| AI car health estimator from photos | Vision | 4+ | Reframed as photo-quality check only |
| Owned inventory, reconditioning, physical outlets | Strategy | 5 | Transaction volume + unit economics proven |
| KSA launch | Strategy | 2 | UAE gates in 11.1 sustained for 3 months |
| India launch | Strategy | 4 | Data automation mature, KSA stable |
| YouTube channel | Team notes | Parallel, marketing-owned | Not an engineering dependency |

---

## 14. Open questions for the founder

These block specific parts of the build and need answers before the sprint they affect.

1. **Vehicle data source** — licensed feed, manual entry, or hybrid? This determines Sprint 1 entirely and is the single biggest schedule risk. *(Blocks Sprint 1)*
2. **Existing build** — is the current site being replaced, or progressively refactored? The Feedback document implies a live build exists. *(Blocks Sprint 0)*
3. **Brand identity** — is logo and typography commissioned, and by when? *(Blocks Sprint 0)*
4. **Dealer pilot** — which 5–10 dealers, and are commercial terms agreed? *(Blocks Sprint 3)*
5. **Arabic content** — translated, or independently authored? Budget and resourcing differ substantially. *(Blocks Sprint 9)*
6. **Cost-to-own data** — who owns and maintains insurance bands, service costs, and depreciation curves? This needs a named person, not a team. *(Blocks Sprint 5)*
7. **Legal entity and regulatory position** — confirmed as lead generator, not broker or intermediary, in the UAE? *(Blocks launch)*
8. **Budget and headcount** — confirmed against the 26-week plan?

---

## 15. Summary of what changes from the current thinking

| Was | Now | Why |
|---|---|---|
| India + UAE + KSA at once | UAE only, architected for three | Data complexity, dealer proximity, faster proof |
| 29 modules in v1 | 10 modules, deep | Shallow breadth loses to incumbents on every axis |
| "Innovative features" as differentiator | Cost transparency as differentiator | Defensible, cheap, SEO-rich, trust-building |
| AI health estimate from photos | Deferred and reframed | Liability without corresponding user value |
| Single valuation figure | Range + confidence + comparables | Honest, and legally safer |
| Financing in v1 | Calculators only | Agreed across two of the four source documents |
| Nav with dead space | Six items, 64px, disciplined spacing | First impression drives everything downstream |
| Plain vehicle cards | USP chips + hover marquee + cost-to-own line | Card CTR is the top of the entire funnel |

---

*End of specification. Version 1.0 — circulate for comment, freeze before Sprint 0.*
