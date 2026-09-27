# Hummingbird Storyhouse — Domain/Application Foundation

Build a production-quality, domain-first TypeScript foundation for Hummingbird Storyhouse.
This repository is NOT the marketing website. It is the business/domain/application logic behind a Black-owned multimedia/content company.
The system must be usable internally before public launch and remain independent of Avuhz, while exposing clean ports/events so Avuhz can orchestrate it later.

## Business outcome
Turn a business objective into a measurable media operating loop:
lead -> brand intelligence -> strategy -> campaign -> content plan -> production -> approval -> distribution -> analytics -> learning -> renewal.

## Architecture principles
- TypeScript strict mode, Node 22+, npm.
- Domain-driven modular architecture: domain, application, ports, adapters.
- Framework-independent core. No Next.js, UI, database, HTTP server, auth provider, or external APIs yet.
- Deterministic domain rules; AI is behind interfaces, never embedded in entities.
- Explicit tenant/client boundaries from day one.
- Domain events and idempotent application commands where appropriate.
- Money stored as integer minor units + currency.
- Timestamps ISO/Date with injectable Clock.
- Branded/opaque IDs and typed lifecycle/status transitions.
- Prefer small modules with tests over speculative infrastructure.

## Required bounded contexts
1. Clients/Brands: organization, brand profile/brand brain, audience, voice, objectives, constraints, platforms.
2. Strategy: goals, content pillars, channel strategy, KPI targets, strategy versioning/activation.
3. Campaigns: goals, dates, budget, channels, deliverables, assignments, lifecycle.
4. Content: ideas, hooks, briefs, scripts/copy, variants, parent/derivative relationships, CTA, content metadata.
5. Production: production jobs and state machine: idea -> brief -> script -> production -> edit -> QA -> review -> approved -> scheduled -> published.
6. Approvals: review requests, revision requests, decisions, audit trail.
7. Assets: logical media assets, versions, rights/usage metadata, ownership, linkage to content/campaigns; storage itself is a port.
8. Distribution: channel publication intents, platform variants, scheduling, publication receipts/status.
9. Analytics: normalized performance observations and KPI snapshots tied back to publication/content/campaign/strategy.
10. Learning: evidence-backed insights/recommendations generated from observations; acceptance/rejection feeds strategy.
11. Creators/Talent: creator profiles, specialties, rates, availability references, campaign assignments, deliverables.
12. Commerce: service packages, engagements/retainers/projects, invoices/line items, costs, creator payouts, contribution margin.

## Application workflows
Implement useful use cases, not just interfaces:
- onboard brand
- activate strategy
- create campaign
- create content brief from campaign
- advance content through valid production states
- request approval / approve / request revision
- schedule approved content for publication
- record publication receipt
- ingest normalized metrics
- generate/store learning insight through an injectable InsightGenerator port
- create engagement and calculate campaign/engagement economics

## Cross-cutting requirements
- DomainError hierarchy and invariant helpers.
- Repository ports per aggregate root, plus UnitOfWork only if genuinely useful.
- EventBus port plus in-memory implementation.
- Clock and IdGenerator ports with deterministic test implementations.
- In-memory repositories so the complete workflow runs without infrastructure.
- An application-level orchestration service/demo proving the golden path end to end.
- Seed/example data should use fictional brands only.
- Public exports should be intentional; avoid giant barrel-file cycles.

## Tests / quality gates
- Vitest unit tests for critical invariants and state transitions.
- At least one integration-style test for the golden path from brand onboarding through analytics/learning.
- Tests for tenant isolation boundaries, invalid transitions, approval gating before scheduling, money/economics math, and idempotency where implemented.
- npm scripts: build, typecheck, test, lint (use ESLint if practical), check.
- All quality gates must pass before finishing.

## Repository documentation
Create:
- README.md: business purpose, quickstart, architecture, current capabilities, example golden path, and what is deliberately not built yet.
- ARCHITECTURE.md: contexts, dependency rule, aggregate boundaries, events, ports/adapters, Avuhz integration seam.
- DOMAIN_MODEL.md: entities/value objects and important invariants.
- ROADMAP.md: phased path from domain core -> persistence/API -> internal ops UI -> platform integrations -> Avuhz orchestration -> external client product.
- AGENTS.md: rules for future coding agents to preserve domain boundaries and quality.
- .gitignore and .editorconfig.

Do not create a website. Do not add Supabase/Vercel yet. Do not pretend integrations exist.
Use pragmatic code over ceremony. Finish by running npm install as needed, npm run check, git status, and summarize the implementation in the Codex output.
