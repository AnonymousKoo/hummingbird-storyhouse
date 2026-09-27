# Architecture

## Shape and dependency rule

Hummingbird Storyhouse Core is a domain-first modular monolith. Domain modules contain business language and deterministic rules. The application layer coordinates aggregates. Ports describe capabilities at the boundary. Adapters implement ports. Dependencies must never point from domain modules to application or infrastructure.

```text
transport / orchestrator → typed commands → application → domain
                                      ↓
                                  ports ← adapters
                                          ├─ in-memory
                                          └─ PostgreSQL
```

## Bounded contexts

| Context | Aggregate root | Responsibility |
| --- | --- | --- |
| Clients/Brands | Brand | Organization identity and brand brain |
| Strategy | Strategy | Versioned goals, pillars, channels, KPI targets |
| Campaigns | Campaign | Dates, budget, channels, deliverables, assignments |
| Content | ContentItem | Ideas, briefs, copy/variants, lineage, metadata |
| Production | ContentItem lifecycle | Ordered production state machine |
| Approvals | ApprovalRequest | Decisions, revision reasons, audit trail |
| Assets | MediaAsset | Logical media, versions, linkage, usage rights |
| Distribution | PublicationIntent | Channel variants, schedule, receipt/status |
| Analytics | PerformanceObservation | Normalized, attributable metrics |
| Learning | Insight | Evidence-backed recommendation and disposition |
| Creators/Talent | Creator | Skills, rates, availability references, assignments |
| Commerce | Engagement / Invoice | Packages, revenue, cost, payout, margin |

Aggregate references are IDs, not nested mutable objects. Every aggregate carries a tenant ID; repositories require it in reads and partition lists by it. Cross-aggregate rules are enforced in `StoryhouseService`, which loads all participants inside the same tenant boundary.

## Command boundary, events, and idempotency

`StoryhouseCommand` is a transport-neutral discriminated union. Each envelope carries an opaque command ID, tenant ID, command type, and typed payload; its result is mapped by command type. `StoryhouseCommandDispatcher` is the only translation from contracts to `StoryhouseService`, so a future HTTP or Avuhz adapter does not enter the domain.

Successful use cases publish past-tense domain events containing an event ID, tenant ID, aggregate ID, ISO timestamp, and small payload. Direct in-memory service use retains instance-local command deduplication and an event collector.

The durable gateway starts one PostgreSQL transaction and takes a transaction-scoped advisory lock derived from tenant and command ID. It replays an existing receipt only when the tenant, command ID, command type, and complete JSON payload match. Reusing the receipt key for a different type or payload is a conflict. Otherwise it builds a fresh service whose repositories, receipt store, and outbox bus all use the same transaction client. The transaction commits only after command result receipt storage. Exceptions roll back aggregate writes, receipt, and events together.

## Ports and adapters

There is a repository port per aggregate root, plus `Clock`, `IdGenerator`, `EventBus`, `AssetStorage`, `CommandReceiptRepository`, `OutboxRepository`, `UnitOfWork`, and `InsightGenerator`. The last keeps probabilistic generation outside entities. In-memory repositories, a fixed clock, sequential IDs, and event collection make tests and the demo deterministic. `SequenceIdGenerator` is not a production ID source. The durable gateway defaults to `RandomUuidIdGenerator`, which uses Node `crypto.randomUUID()` behind the existing port and retains readable aggregate/event prefixes. Asset storage is intentionally only a port.

The PostgreSQL adapter uses `pg` without an ORM. Aggregate payloads round-trip losslessly through JSONB while important relationships and timestamps are duplicated into relational columns for constraints and access paths. Every aggregate query includes a tenant predicate. The durable service composes repositories whose point reads use `SELECT ... FOR UPDATE`, so different command IDs targeting the same aggregate serialize and re-evaluate domain transitions against committed state. Batch reads acquire locks in sorted ID order. Composite foreign keys include `tenant_id` to reject cross-tenant references where the relationship is singular; array relationships remain queryable relational columns and are validated by application workflows.

The private `storyhouse` schema also owns the migration ledger, tenant-scoped command receipts, and outbox. Bootstrap revokes `PUBLIC` schema access. The advisory-locked migration runner records a SHA-256 checksum with each filename and refuses to run when an applied file has drifted. Outbox readers require a tenant and order pending records by occurrence time then event ID; dispatch mutations preserve the tenant predicate and raise a not-found domain error when no matching row exists. Dispatch is deliberately separate from transaction execution.

## Avuhz integration seam

Avuhz can later orchestrate Hummingbird Storyhouse by submitting typed commands and dispatching/consuming committed outbox events. It must not import domain internals, mutate aggregates directly, or become the source of Hummingbird business rules. No Avuhz client or worker is implemented in this phase.

Hosted database selection, identity/authentication, tenant RLS tied to that identity, API transport, scheduler/worker operation, platform adapters, and binary asset storage remain intentionally deferred.
