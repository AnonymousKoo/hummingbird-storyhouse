# Roadmap

## 1. Domain core — complete

Maintain the thirteen bounded contexts, deterministic rules, in-memory adapters, golden-path orchestration, and tests. Exercise the core in internal planning sessions and refine language from real operations.

## 2. Local durable persistence and command contracts — complete

Maintain the local PostgreSQL schema/migrations, tenant-aware repositories, typed transport-neutral commands, durable receipts, transactional outbox, and restart/rollback/golden-path integration coverage. Evolve relational projections only from measured access patterns. Optimistic concurrency can be added when multi-writer aggregate updates require it.

## 3. Internal operations UI — complete

Run the local Node-runtime Next.js operator workspace over PostgreSQL. Refine brand intake, campaign planning, production, approval, distribution, analytics, learning, and commerce workflows through internal use. The current environment-selected tenant is local context only, not an authorization boundary.

## 4. Public media-tech site — complete

Maintain the static-first Next.js public experience in `apps/web`: media + marketing positioning, capabilities, the Media Meets Marketing journey, Story Engine, ecosystem concepts, Originals, media/business signals, engagement model, and accessible project intake acknowledgement. Keep it independent from the private operator and PostgreSQL runtime. Connect intake delivery only through a reviewed adapter in a later phase; do not imply delivery before it exists.

## 5. Marketing + growth domain — complete

Maintain Hummingbird-owned marketing plans above the existing Campaign execution aggregate: audience segments, positioning, offers, funnel/channel roles, conversion goals, linked campaigns, experiments, explicit conversion attribution, spend, CAC/ROAS, and transport-neutral marketing read models. Keep Avuhz as a future orchestration layer rather than the owner of marketing rules.

## 6. Hosted runtime and API transport

Select a hosted database from operational requirements. Finalize the identity/tenant model, then add authentication, authorization, and database RLS policies. Add a versioned transport adapter, edge validation, observability, and contract tests without moving transport concepts into aggregates. Vercel currently hosts only the independent public web app; hosted core database/runtime selection remains deferred.

## 7. Identity and authenticated operations

Finalize the identity and tenant model, then add authentication, authorization, and database RLS. Put the internal workspace behind that boundary without moving identity concepts into domain aggregates.

## 8. Platform integrations and workers

Implement the outbox scheduler/worker, asset storage, social publishing, metrics ingestion, advertising/channel adapters where appropriate, accounting, CRM/email, and calendar adapters one at a time. Add retry/dead-letter handling, secret management, rate-limit controls, reconciliation, and explicit capability flags. Never represent an unverified platform action as successful.

## 9. Avuhz orchestration

Connect through idempotent application commands and domain events. Add durable workflow correlation and human checkpoints while retaining standalone Hummingbird operation and ownership of its media and marketing business rules.

## 10. External client product

After internal workflows and authorization boundaries are proven, introduce scoped client review/reporting surfaces, notification preferences, exports, accessibility and service-level objectives. Public marketing remains a separate concern.
