# Local PostgreSQL

Storyhouse uses PostgreSQL through `pg`, with no ORM. All application objects live in the private `storyhouse` schema; `public` is not used for domain data, and migration bootstrap revokes all `PUBLIC` access to the schema. Future runtime roles require explicit grants. The Compose service is dedicated to integration testing, listens on host port `55432`, uses PostgreSQL's local trust mode, and keeps its data in a container-local tmpfs. It is not production configuration.

## Local commands

```sh
npm run db:up
npm run db:migrate
npm run test:integration
npm run db:down
```

The scripts supply this non-secret local default when `DATABASE_URL` is absent:

```text
postgresql://postgres@127.0.0.1:55432/storyhouse_test
```

Set `DATABASE_URL` explicitly to use another local test instance. The migration runner reads the URL only from the environment. Integration setup drops and rebuilds `storyhouse`, and therefore refuses to run unless the current database name ends in `_test`.

`npm run check:all` runs the normal quality gate, starts the Compose database, and runs integration tests. It leaves Postgres available for inspection; use `npm run db:down` when finished.

## Migrations

Migration files in `db/migrations` are ordered by their zero-padded numeric prefix. The runner:

1. takes a PostgreSQL advisory lock for migration serialization;
2. transactionally creates and locks down the private schema and `schema_migrations` ledger if absent;
3. applies each unseen SQL file in its own transaction; and
4. records the filename and SHA-256 content checksum only after successful application.

Every startup verifies the checksum of each already-applied filename and fails loudly on drift. Never edit a migration that has shipped. Add the next ordered file. Migrations must preserve opaque text IDs, tenant scoping, JSONB round-tripping, relational projections, and scoped foreign keys. Migration `002_marketing_growth.sql` adds tenant-scoped marketing plans, experiments, explicit conversion events, and channel spend while keeping existing campaigns as the execution records.

## Durable command and outbox seam

`PostgresDurableCommandGateway` executes one typed command per transaction. Its repositories, receipt store, and outbox event bus share the transaction client. A transaction advisory lock serializes `(tenantId, commandId)` duplicates; completed receipts replay their stored result after restarts only when command type and full JSON payload match. Transactional point reads lock aggregate rows, and multi-aggregate batches lock in deterministic ID order. Failed transactions leave no aggregate change, new receipt, or new outbox event. When no ID generator is injected, durable commands use prefix-readable UUIDs from Node crypto; `SequenceIdGenerator` is reserved for tests and the demo.

`PostgresOutboxRepository` lists one tenant's pending events deterministically and records dispatched/failed attempts. Dispatch mutations that match no tenant/event pair raise a not-found domain error rather than silently succeeding. A future Avuhz adapter or background worker may consume this interface after commit. This repository does not implement that worker or an Avuhz connection.

Hosted database selection, production credentials, backups, connection pooling policy, finalized identity/auth and RLS, API transport, scheduling, external platform adapters, and binary asset storage remain intentionally deferred.
