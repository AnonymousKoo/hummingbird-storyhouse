# Phase 3 — Hummingbird Storyhouse Internal Operator App

Build the first real internal operating experience on top of the existing Hummingbird domain/application/Postgres core.

This is NOT the public marketing website. It is an internal operator application for Hummingbird's team.

## Architecture
- Keep the existing root TypeScript core authoritative and framework-independent.
- Add a Next.js App Router application under `apps/operator`.
- Use Node runtime, not Edge, because the app talks to PostgreSQL.
- The operator app may import/use the core application contracts and PostgreSQL adapters, but the core must not import Next.js/React/UI code.
- No Supabase. No hosted DB. No Avuhz dependency. No auth provider yet.
- Current internal tenancy comes from env `STORYHOUSE_TENANT_ID`; default only in documented local development commands, never as a production security claim.
- DATABASE_URL comes from env. Local development targets the existing Docker Postgres at port 55432.
- Writes MUST go through PostgresDurableCommandGateway/typed Storyhouse commands. Do not mutate tables directly.
- Reads should go through a transport-neutral application query/read-model service added to core, backed by repository ports/Postgres as appropriate.
- No browser-side database credentials or core secrets.

## Internal product outcome
An operator should be able to open one app and understand:
1. What brands are active?
2. What campaigns are running?
3. What content needs work right now?
4. What is blocked on approval?
5. What is scheduled/published?
6. What is performing?
7. What has the system learned?
8. What revenue/margin is attached to the work?

The UI should feel like premium editorial/media operations software, not a generic admin template.

## Information architecture
Persistent left navigation:
- Command Center
- Brands
- Campaigns
- Content
- Approvals
- Distribution
- Analytics
- Insights
- Commerce

Top context:
- Hummingbird Storyhouse wordmark
- internal/operator badge
- current tenant label
- current date/context
- global “New” action where useful

Responsive desktop-first; usable on tablet/mobile.

## Required screens / workflows

### 1. Command Center (/)
Executive operating dashboard with real read models:
- counts: brands, active campaigns, content in production, pending approvals, scheduled publications
- content pipeline by state
- recent activity derived from outbox events
- publishing/performance snapshot
- economics snapshot: contracted revenue, modeled costs, contribution margin
- “needs attention” section based on deterministic rules (pending approvals, review items, scheduled without receipt, etc.)
- fast actions: onboard brand, create campaign, create content brief

### 2. Brands (/brands)
- brand list/cards
- brand detail route
- onboard brand form that issues `brand.onboard`
- show purpose, audiences, objectives, voice, platforms, constraints
- brand detail should show related strategies/campaigns/content counts

### 3. Campaigns (/campaigns)
- campaign list with status/dates/budget/strategy/brand
- campaign detail with goals, channels, deliverables, content pipeline, economics if any
- create campaign flow based on an ACTIVE strategy
- if no active strategy exists, make the dependency obvious; do not fake one

### 4. Content (/content)
- production board/list grouped by state: brief, script, production, edit, qa, review, approved, scheduled, published
- create brief form from an active campaign
- content detail with hooks, brief, CTA, metadata, lineage, approval state, publication state, metrics
- valid “Advance” actions only; use domain transition rules
- revision state should be visible

### 5. Approvals (/approvals)
- queue of pending approvals
- approve and request-revision actions through typed commands
- revision note required
- show audit history

### 6. Distribution (/distribution)
- approved/scheduled/published content
- schedule approved content (channel + date/time + optional caption/variant)
- record a publication receipt manually for internal testing
- do not integrate social APIs yet

### 7. Analytics (/analytics)
- aggregate real normalized observations
- KPI/content performance table
- simple meaningful charts using CSS/SVG or a small dependency if truly needed
- content/campaign attribution
- empty states when no metrics exist
- manual metrics ingestion affordance for published content (views and completion rate at minimum) so internal testing is possible

### 8. Insights (/insights)
- list stored evidence-backed insights
- generate insight from selected observations using injected local deterministic InsightGenerator for now
- label local generator clearly as internal/rule-based, not AI
- show finding, recommendation, confidence, source observations, status

### 9. Commerce (/commerce)
- engagements list
- contracted revenue, costs, payouts, contribution margin
- create engagement form from one or more existing campaigns
- use integer minor units in the core; UI may accept/display dollars and must convert safely

## Query/read model layer
Add transport-neutral query services/types in root core so UI pages do not encode business joins themselves.
At minimum support:
- operator dashboard summary
- brand list/detail
- campaign list/detail
- content list/detail
- pending approvals/detail
- distribution view
- analytics summary
- insights list
- commerce summary

Keep tenant input explicit on every query.
Do not add event-sourcing/CQRS infrastructure; this is a pragmatic read layer over current repositories/outbox.

## Local operator runtime
Add a server-only composition module inside operator app:
- singleton pg Pool
- Fixed/System clock suitable for real current time (create SystemClock adapter if missing)
- RandomUuidIdGenerator via gateway default
- deterministic RuleBasedInsightGenerator adapter in root or operator server layer
- tenant from STORYHOUSE_TENANT_ID
- helpers to make command IDs
- safe env validation with useful error messages

Add server actions (or route handlers only where more appropriate) for writes.
Use revalidatePath/redirect patterns correctly.
Surface domain errors to forms without leaking internals.

## Seed/demo
Add a safe local-only seed command/script that:
- refuses to run against a database not ending in _test or _dev
- migrates first
- seeds a rich fictional Storyhouse tenant through typed commands (not raw inserts)
- includes at least 2 brands, active strategies/campaigns, content across multiple stages, pending approval, scheduled/published content, observations/insight, commerce
- is idempotent or resets only the explicit local tenant safely
Prefer deterministic fictional data.

## Visual direction
Premium media operating system:
- warm editorial palette: near-black/ink, parchment/ivory surfaces, honey/amber accent, muted clay/olive support
- high legibility, restrained decoration, generous spacing
- serif/editorial display voice paired with clean sans body (prefer next/font system-safe package choices; no manually bundled font files)
- strong hierarchy, thoughtful empty states, useful status chips
- avoid generic SaaS gradients, neon dashboards, excessive cards, or childish “creator” styling
- responsive and accessible; visible keyboard focus and semantic forms/tables

No generated imagery is required. The product should stand on typography, layout, data visualization, and interaction quality.

## Quality
- Preserve all existing root tests.
- Add query-service unit/integration coverage where valuable.
- Next app: typecheck and production build must pass.
- Add root scripts for operator dev/build/check/seed without breaking current scripts.
- `npm run check:all` must still pass.
- Add an `operator:check` that at least installs/resolves dependencies, typechecks/lints if configured, and runs next build.
- npm audit should remain 0 if practical.
- no credentials committed.
- update root README/ARCHITECTURE/ROADMAP and add `apps/operator/README.md`.

Before finishing:
1. npm run check:all
2. npm run operator:check
3. npm audit
4. git diff --check
5. start local DB, migrate, seed, start operator dev server
6. verify key routes in a real browser and inspect for Next error overlays/console failures
7. stop dev server and DB
8. summarize.
