# Hummingbird Storyhouse Core

Hummingbird Storyhouse Core is the domain and application foundation for a Black-owned multimedia/content company. It turns a client objective into a measurable operating loop: brand intelligence → strategy → campaign → content → production → approval → distribution → analytics → learning → renewal economics.

This repository contains a TypeScript domain/application core, the private Next.js operator app in `apps/operator`, and the public Hummingbird Storyhouse site in `apps/web`. The public and operator applications are separate: the public site is static-first and has no database dependency, while the operator app uses the durable PostgreSQL path exclusively.

## Quickstart

Requires Node.js 22+ and npm. The default checks and demo need no database.

```sh
npm install
npm run check
npm run demo
```

The demo uses only fictional data and in-memory adapters. It runs the golden path and prints a small result summary.

For the durable path, Docker Compose exposes a dedicated test Postgres on port `55432`:

```sh
npm run db:up
npm run db:migrate
npm run test:integration
npm run db:down
```

`DATABASE_URL` may override the local default for migration and integration scripts. Integration tests refuse to clean a database whose name does not end in `_test`. See [db/README.md](./db/README.md).

## Internal operator app

The local-only operator workspace covers Command Center, Brands, Campaigns, Content, Approvals, Distribution, Analytics, Insights, and Commerce. It reads tenant-scoped application read models and submits all writes through typed durable commands.

```sh
npm run db:up
npm run db:migrate
npm run operator:seed
npm run operator:dev
```

The documented commands default only for local development to `storyhouse_test` and tenant `tenant_storyhouse_demo`. Production-like runs must explicitly provide `DATABASE_URL` and `STORYHOUSE_TENANT_ID`; the tenant environment value is context, not an authorization mechanism. See [apps/operator/README.md](./apps/operator/README.md).

## Public site

The public site presents the Storyhouse as a media operating company across strategy, production, distribution, audience intelligence, and original IP. It is an independently installable Next.js App Router application with no core, operator, PostgreSQL, or environment-variable requirement.

```sh
cd apps/web
npm ci
npm run dev
```

Its intake form is intentionally a transparent client-side acknowledgement in this phase; it does not transmit or persist submissions. For local commands and Vercel root-directory settings, see [apps/web/README.md](./apps/web/README.md).

## Architecture

The core is organized as a framework-independent modular monolith:

- `src/domain`: twelve bounded contexts, value objects, transitions, and invariants.
- `src/application`: useful cross-context commands and the end-to-end operating loop.
- `src/application/operator-queries.ts`: transport-neutral, tenant-explicit operator read models.
- `src/ports`: clocks, IDs, events, storage, transaction, receipt, outbox, and repository contracts.
- `src/adapters`: deterministic in-memory implementations plus `pg` repositories, migrations, outbox, receipts, unit of work, and durable command gateway.
- `db/migrations`: ordered SQL for the private `storyhouse` schema.
- `test`: unit coverage and a Docker-backed PostgreSQL integration suite.

Dependencies point inward: adapters depend on ports/domain; application coordinates domain through ports; domain code does not import application or infrastructure. See [ARCHITECTURE.md](./ARCHITECTURE.md) and [DOMAIN_MODEL.md](./DOMAIN_MODEL.md).

## Current capabilities

- Onboard tenant-scoped organizations and brand brains.
- Version and activate content strategies with channel roles and KPI targets.
- Create active campaigns and campaign-derived content briefs.
- Move content through controlled production states.
- Request and audit approvals or revisions; approval gates scheduling.
- Schedule channel variants and record platform-neutral publication receipts.
- Normalize performance observations and generate evidence-backed insights through an injected generator.
- Model assets, rights, creators, rates, assignments, packages, invoices, costs, payouts, and contribution margin.
- Dispatch transport-neutral typed command envelopes for every implemented workflow.
- Atomically persist aggregate changes, durable idempotency receipts, and outbox events through PostgreSQL.
- Replay completed commands only when command type and payload match, and serialize concurrent duplicates with transaction-scoped advisory locks.
- Generate production-safe, prefix-readable UUID IDs by default for durable commands; sequential IDs remain limited to deterministic tests and the demo.
- Lock transactional aggregate reads so competing state transitions observe committed state instead of overwriting it.
- Read pending outbox events in deterministic order and report missing or cross-tenant dispatch mutations to a future worker.
- Operate the complete local workflow through a responsive, server-rendered internal workspace with real PostgreSQL reads and typed-command writes.
- Present the public Storyhouse narrative through an accessible, static-first media experience without exposing private runtime dependencies.

## Example golden path

`src/demo.ts` composes the service with a fixed clock, sequential IDs, in-memory repositories, event collection, and a deterministic insight generator. Sequential IDs are intentionally for tests and demos only; `PostgresDurableCommandGateway` defaults to Node's cryptographically random UUID generator while preserving readable prefixes such as `brand_`. The PostgreSQL integration suite runs the same loop through typed command envelopes: brand → strategy → activation → campaign → content/production → approval → publication → metrics → insight → commerce. It also proves tenant isolation, strict restart-safe replay, concurrent transition safety, migration checksum enforcement, schema privacy, rollback, atomic outbox/receipt writes, lossless payload round-trips, and minor-unit economics.

## Quality gates

```sh
npm run check       # lint, strict types, unit tests, build
npm run check:all   # check + local Postgres startup + integration tests
npm audit
cd apps/web && npm run check && npm audit
```

## Deliberately not built

There is no public intake backend, hosted database, object storage implementation, authentication provider, RLS policy, background scheduler/outbox worker, AI vendor, or social-platform integration. There is no Supabase runtime or committed Vercel project metadata. Hosted database selection and authorization policy remain deferred until the identity model is finalized. Avuhz is not a dependency: future orchestration can issue idempotent commands, consume the outbox, and implement ports without entering the domain core.
