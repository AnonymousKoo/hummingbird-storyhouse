# Roadmap

## 1. Domain core — current

Maintain the twelve bounded contexts, deterministic rules, in-memory adapters, golden-path orchestration, and tests. Exercise the core in internal planning sessions and refine language from real operations.

## 2. Persistence and API

Choose storage from measured access patterns. Add durable tenant-aware repositories, migrations, optimistic concurrency, command receipts, and a transactional outbox. Expose a versioned API with authentication/authorization at the edge, validation, observability, and contract tests. Keep transport models out of aggregates.

## 3. Internal operations UI

Build an authenticated internal workspace over the API for brand intake, strategy/campaign planning, production boards, approval queues, scheduling, rights checks, finance, and reports. Optimize for staff workflows before client-facing polish.

## 4. Platform integrations

Implement storage, social publishing, metrics ingestion, accounting, and calendar adapters one at a time. Add retry/dead-letter handling, secret management, rate-limit controls, reconciliation, and explicit capability flags. Never represent an unverified platform action as successful.

## 5. Avuhz orchestration

Connect through idempotent application commands and domain events. Add durable workflow correlation and human checkpoints while retaining standalone Hummingbird operation and ownership of its business rules.

## 6. External client product

After internal workflows and authorization boundaries are proven, introduce scoped client review/reporting surfaces, notification preferences, exports, accessibility and service-level objectives. Public marketing remains a separate concern.
