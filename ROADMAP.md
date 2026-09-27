# Roadmap

## 1. Domain core — complete

Maintain the twelve bounded contexts, deterministic rules, in-memory adapters, golden-path orchestration, and tests. Exercise the core in internal planning sessions and refine language from real operations.

## 2. Local durable persistence and command contracts — current

Maintain the local PostgreSQL schema/migrations, tenant-aware repositories, typed transport-neutral commands, durable receipts, transactional outbox, and restart/rollback/golden-path integration coverage. Evolve relational projections only from measured access patterns. Optimistic concurrency can be added when multi-writer aggregate updates require it.

## 3. Hosted runtime and API transport

Select a hosted database from operational requirements. Finalize the identity/tenant model, then add authentication, authorization, and database RLS policies. Add a versioned transport adapter, edge validation, observability, and contract tests without moving transport concepts into aggregates. Hosted Supabase, Avuhz, Vercel, and other providers are not selected yet.

## 4. Internal operations UI

Build an authenticated internal workspace over the API for brand intake, strategy/campaign planning, production boards, approval queues, scheduling, rights checks, finance, and reports. Optimize for staff workflows before client-facing polish.

## 5. Platform integrations and workers

Implement the outbox scheduler/worker, asset storage, social publishing, metrics ingestion, accounting, and calendar adapters one at a time. Add retry/dead-letter handling, secret management, rate-limit controls, reconciliation, and explicit capability flags. Never represent an unverified platform action as successful.

## 6. Avuhz orchestration

Connect through idempotent application commands and domain events. Add durable workflow correlation and human checkpoints while retaining standalone Hummingbird operation and ownership of its business rules.

## 7. External client product

After internal workflows and authorization boundaries are proven, introduce scoped client review/reporting surfaces, notification preferences, exports, accessibility and service-level objectives. Public marketing remains a separate concern.
