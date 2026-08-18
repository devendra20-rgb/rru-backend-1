# RideRoundUp — API Development Roadmap

## Goal
Build the backend module-by-module in dependency order. Do not build all APIs together.

Core catalog:
**Brand → Model → Generation → Variant → Market / Variant Market**

## Phase 0 — Backend Foundation
Module: `core`
- Express + TypeScript
- MongoDB + Mongoose
- environment/config
- error handling
- validation
- logging
- pagination/filter/sort helpers
- RBAC middleware
- Swagger/OpenAPI
- API versioning: `/api/v1`
- health endpoint

## Phase 1 — Auth + RBAC
Module: `auth`, `users`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`
- Admin user CRUD APIs
Done when protected admin APIs work.

## Phase 2 — Brands
Module: `catalog/brands`
- `GET /api/v1/brands`
- `GET /api/v1/brands/:id`
- `GET /api/v1/brands/slug/:slug`
- `POST /api/v1/brands`
- `PATCH /api/v1/brands/:id`
- `DELETE /api/v1/brands/:id`
Rules: unique brandCode, unique slug, case-insensitive duplicate protection.

## Phase 3 — Models
Module: `catalog/models`
- model CRUD
- `GET /api/v1/brands/:brandId/models`
Filters: brand, body type, segment, status, search.

## Phase 4 — Generations
Module: `catalog/generations`
- generation CRUD
- `GET /api/v1/models/:modelId/generations`
Supports historical generations such as LC200 → LC300.

## Phase 5 — Variants
Module: `catalog/variants`
- variant CRUD
- `GET /api/v1/models/:modelId/variants`
- `GET /api/v1/generations/:generationId/variants`
Filters: fuel, transmission, drivetrain, seats, model year, etc.
This is the most important catalog module.

## Phase 6 — Markets + Variant Markets
Modules: `catalog/markets`, `catalog/variant-markets`
Market CRUD plus:
- `GET /api/v1/variants/:variantId/markets`
- `POST /api/v1/variants/:variantId/markets`
- `PATCH /api/v1/variant-markets/:id`
- `DELETE /api/v1/variant-markets/:id`
Pricing:
- `GET /api/v1/variant-markets/:id/pricing`
- `POST /api/v1/variant-markets/:id/pricing`
- `PATCH /api/v1/variant-markets/:id/pricing/:priceId`

## Phase 7 — Specifications
Module: `catalog/specifications`
- specification master CRUD
- `GET /api/v1/variants/:variantId/specifications`
- `PUT /api/v1/variants/:variantId/specifications`
Use flexible specifications for long-tail automotive data; keep high-use fields such as engine, fuel, transmission and seats as first-class fields.

## Phase 8 — Features
Module: `catalog/features`
- feature CRUD
- `GET /api/v1/variants/:variantId/features`
- `PUT /api/v1/variants/:variantId/features`
Categories: safety, comfort, interior, exterior, entertainment, ADAS, performance.

## Phase 9 — Colors
Module: `catalog/colors`
- color CRUD
- `GET /api/v1/variant-markets/:id/colors`
- `PUT /api/v1/variant-markets/:id/colors`

## Phase 10 — Media + AWS S3
Module: `media`
Flow:
Frontend → backend presigned URL → S3 → save metadata in MongoDB.
APIs:
- `POST /api/v1/media/presign`
- `POST /api/v1/media`
- `GET /api/v1/media/:id`
- `GET /api/v1/variants/:variantId/media`
- `PATCH /api/v1/media/:id`
- `DELETE /api/v1/media/:id`
MongoDB stores metadata; S3 stores actual files.

## Phase 11 — Public New Cars
Module: `public/new-cars`
- `GET /api/v1/public/new-cars`
- `GET /api/v1/public/new-cars/:slug`
- `GET /api/v1/public/new-cars/popular`
- `GET /api/v1/public/new-cars/latest`
- `GET /api/v1/public/new-cars/upcoming`
- `GET /api/v1/public/new-cars/brands`
Filters: market, brand, model, body type, fuel, transmission, seats, price range, search, sort, pagination.
Example:
`GET /api/v1/public/new-cars?market=UAE&bodyType=SUV&seats=7&maxPrice=150000`

## Phase 12 — Cost to Own
Module: `ownership`
- ownership profile CRUD
- cost configuration CRUD
- `GET /api/v1/variants/:variantId/cost-to-own`
- `POST /api/v1/variants/:variantId/cost-to-own`
Inputs can include market, annual km, ownership years and fuel price.
Output: finance, depreciation, fuel, insurance, maintenance, tyres, registration, tolls, total monthly cost.

## Phase 13 — Reviews
Module: `reviews`
- review CRUD
- `GET /api/v1/variants/:variantId/reviews`
- `GET /api/v1/variants/:variantId/reviews/summary`
Ratings: overall, comfort, reliability, performance, fuel economy, features, value.

## Phase 14 — News / Guides
Module: `articles`
- article CRUD
- `GET /api/v1/articles`
- `GET /api/v1/articles/:slug`
- publish/unpublish APIs
Categories: news, buying guide, EV, ownership, comparison, review.

## Phase 15 — Compare
Module: `comparisons`
Build only after variant/spec/feature/cost data is stable.
- `POST /api/v1/comparisons`
- `GET /api/v1/comparisons/:id`
- `PATCH /api/v1/comparisons/:id`
- `DELETE /api/v1/comparisons/:id`
- add/remove vehicles
- `GET /api/v1/comparisons/:id/result`
Support up to 4 vehicles and `showDifferencesOnly`.

## Phase 16 — My Garage
Modules: `users`, `garage`
- profile APIs
- saved vehicles
- saved searches
- user vehicles
Endpoints should be under `/api/v1/me/...`.

## Phase 17 — Leads
Module: `leads`
- `POST /api/v1/leads`
- Admin lead listing/detail/update
Types: vehicle enquiry, test drive, callback, service, other.

## Phase 18 — Book a Service
Module: `service`
- service types
- create booking
- user booking history
- admin status updates
Build after the actual service business workflow is finalized.

## Phase 19 — AI Assistant
Module: `ai`
Build late because it depends on stable catalog, price, market, ownership and review data.
- conversation CRUD
- `POST /api/v1/ai/conversations/:id/messages`
- `POST /api/v1/ai/recommendations`
AI output must be grounded in RRU data and include assumptions/source context where appropriate.

## Phase 20 — Homepage Aggregation
Module: `homepage`
Build after individual public modules work.
Primary:
`GET /api/v1/public/homepage?market=UAE`
It can aggregate hero, browse hubs, featured new cars, brands, comparisons, cost-to-own teaser, AI, reviews, poll, news, service and CTA.

## Phase 21 — Data Entry Import
Module: `imports`
Build after catalog APIs are stable.
Flow:
Excel/CSV → upload → staging → validation → duplicate detection → preview → commit → MongoDB.
APIs:
- `POST /api/v1/admin/imports`
- `GET /api/v1/admin/imports`
- `GET /api/v1/admin/imports/:id`
- `GET /api/v1/admin/imports/:id/errors`
- `POST /api/v1/admin/imports/:id/validate`
- `POST /api/v1/admin/imports/:id/commit`
- `POST /api/v1/admin/imports/:id/rollback`

## Phase 22 — Audit
Module: `audit`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:id`
Track create, update, delete, publish, import and rollback, especially price/spec/media changes.

# Exact working order

1. Backend Foundation
2. Auth + RBAC
3. Brands
4. Models
5. Generations
6. Variants
7. Markets
8. Variant Markets + Pricing
9. Specifications
10. Features
11. Colors
12. Media + S3
13. Public New Cars
14. Cost to Own
15. Reviews
16. Articles / News
17. Compare
18. My Garage
19. Leads
20. Service
21. AI
22. Homepage Aggregation
23. Import System
24. Audit / optimization

# Per-module implementation workflow

For every module follow:

Schema → Repository → Service → Controller → Routes → Validation → Swagger → Unit tests → Integration tests → Postman → Dashboard integration → Frontend integration

Do not jump directly from schema to frontend.

# Recommended backend structure

```text
src/
├── config/
├── database/
├── middlewares/
├── utils/
└── modules/
    ├── auth/
    ├── users/
    ├── catalog/
    │   ├── brands/
    │   ├── models/
    │   ├── generations/
    │   ├── variants/
    │   ├── markets/
    │   ├── specifications/
    │   ├── features/
    │   ├── colors/
    │   └── media/
    ├── ownership/
    ├── reviews/
    ├── articles/
    ├── comparisons/
    ├── garage/
    ├── leads/
    ├── service/
    ├── ai/
    ├── homepage/
    ├── imports/
    └── audit/
```

# First milestone

Do not start with homepage or AI.

Start with:

**Foundation → Auth → Brands → Models → Generations → Variants → Markets → Variant Markets**

Once this is stable, the New Cars listing and Vehicle Detail APIs can be built on a reliable catalog.

Then add:

**Specifications → Features → Colors → Media/S3 → Cost to Own → Reviews → Compare → Garage → AI → Homepage.**
