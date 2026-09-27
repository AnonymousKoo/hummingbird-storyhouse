# Phase 2 — Persistence-ready Hummingbird Storyhouse

Extend the existing working domain/application core. Preserve all current behavior and tests.

## Goal
Make Storyhouse restart-safe and Postgres-ready without provisioning or depending on hosted Supabase, Avuhz, Vercel, auth, or a UI.

The durable path must prove this invariant:
A successful application command atomically persists aggregate changes, its durable idempotency receipt, and its domain events/outbox records. A failed command persists none of them.

## Architecture constraints
- Node 22+, strict TypeScript, ESM, npm.
- Use PostgreSQL through the `pg` driver; no ORM.
- Existing domain must not import Postgres, SQL, HTTP, Supabase, or infrastructure code.
- Keep the current in-memory adapters/demo/tests working.
- Use a private Postgres schema named `storyhouse`, not `public`.
- IDs remain current branded opaque text IDs; do not convert domain IDs to UUIDs.
- Tenant filtering is mandatory on every aggregate repository read/list/write.
- No secrets committed. Database URL only via env.
- No hosted database changes.

## Persistence model
Create ordered SQL migrations under `db/migrations` plus a migration runner.

Persist each aggregate root in a context-specific table rather than one generic aggregate table:
brands, strategies, campaigns, content_items, approval_requests, media_assets,
publication_intents, performance_observations, insights, creators, engagements, invoices.

Each table must have:
- id text primary key
- tenant_id text not null
- payload jsonb not null for lossless domain round-tripping
- useful relational reference columns for important relationships (brand_id, strategy_id, campaign_id, content_id, publication_id etc. where applicable)
- timestamps/indexes appropriate to its context
- unique (tenant_id, id), with tenant_id indexed
- foreign keys scoped safely enough to prevent cross-tenant references where practical.

Also create:
- command_receipts: durable idempotency result store
- outbox_events: durable domain event store, with dispatch state fields
- schema_migrations: migration ledger

Do not create auth/user tables. Do not assume an Avuhz tenant/auth model that has not been finalized.

## Durable execution
Introduce persistence ports without contaminating the domain:
- transaction boundary / UnitOfWork abstraction where useful
- durable command receipt/idempotency port
- transactional outbox-backed EventBus

Implement a Postgres durable command gateway/executor that:
1. begins a DB transaction,
2. takes a transaction-scoped advisory lock for the command ID to serialize concurrent duplicates,
3. checks command_receipts,
4. if complete, returns the stored result without rerunning the command,
5. otherwise composes StoryhouseService using transaction-scoped Postgres repositories + outbox EventBus,
6. executes the typed application command,
7. stores the command result receipt,
8. commits all aggregate changes + receipt + events atomically,
9. rolls back completely on error.

Keep StoryhouseService useful directly for in-memory execution.

## Application API contracts
Add a transport-neutral application command contract layer (NOT an HTTP server):
- typed command envelope with commandId, tenantId, type, payload
- discriminated command types for existing workflows
- command dispatcher mapping contracts to StoryhouseService
- typed result mapping sufficient for callers and durable receipt replay

No REST/Fastify/Next.js endpoints in this phase.

## Local verification
Add Docker Compose for a local Postgres dedicated to integration tests. Avoid collision with common 5432 if practical.
Add scripts for:
- db:up
- db:down
- db:migrate
- test:integration
- check:all (existing checks + integration)

Integration tests must prove:
- migrations apply cleanly to empty Postgres
- Postgres repositories round-trip representative aggregates
- tenant A cannot read/list tenant B through repository API
- duplicate command replay survives constructing a NEW durable gateway instance and returns the original result
- failed commands roll back aggregate changes, command receipt, and outbox
- successful command writes outbox event(s) and receipt atomically
- the complete golden path runs on Postgres through the typed durable command API: brand -> strategy -> activation -> campaign -> content -> production -> approval -> publication -> metrics -> insight -> commerce
- economics stay correct.

Tests may use a dedicated local database/container and must clean their data deterministically.

## Outbox
Expose an outbox repository/reader with methods sufficient for future Avuhz dispatch:
- list pending in deterministic order
- mark dispatched
- mark failed / increment attempts if useful
Do not implement Avuhz or a background worker yet.

## Documentation
Update README, ARCHITECTURE, DOMAIN_MODEL, ROADMAP and AGENTS.
Add db/README.md explaining migrations/local Postgres and the future Avuhz integration seam.
Document what remains intentionally deferred: hosted DB selection, auth/RLS policy tied to finalized identity model, API transport, scheduler/worker, external platform adapters, asset storage implementation.

## Quality / security
- Install pinned/compatible packages and commit lockfile.
- npm audit must report 0 known vulnerabilities if achievable without breaking the project.
- `npm run check` must still pass.
- `npm run check:all` must pass with local Postgres.
- Run git diff --check.
- No embedded credentials.
- Keep the implementation pragmatic; do not add speculative microservices.
- Do not remove or weaken tests/lint/type safety to make gates green.

At the end, summarize design decisions, commands run, and any intentionally deferred decisions.
