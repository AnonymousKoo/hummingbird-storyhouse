# Architecture

## Shape and dependency rule

Hummingbird Storyhouse Core is a domain-first modular monolith. Domain modules contain business language and deterministic rules. The application layer coordinates aggregates. Ports describe capabilities at the boundary. Adapters implement ports. Dependencies must never point from domain modules to application or infrastructure.

```text
adapters ──→ ports ←── application ──→ domain
                   domain ──→ shared domain primitives
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

## Events and idempotency

Successful use cases publish past-tense domain events containing an event ID, tenant ID, aggregate ID, ISO timestamp, and small payload. `EventBus` is delivery-neutral; the supplied in-memory bus records events for tests and internal execution. Commands take opaque command IDs. A service instance returns the original in-flight/completed result when the same ID is delivered again and clears failed attempts so they can be retried.

This initial in-memory boundary does not promise durable event delivery or durable idempotency. A persistence adapter should store command receipts and aggregate changes atomically; introduce a Unit of Work/outbox only when that adapter exists.

## Ports and adapters

There is a repository port per aggregate root, plus `Clock`, `IdGenerator`, `EventBus`, `AssetStorage`, and `InsightGenerator`. The last keeps probabilistic generation outside entities. In-memory repositories, a fixed clock, sequential IDs, and event collection make the full workflow deterministic. Asset storage is intentionally only a port.

## Avuhz integration seam

Avuhz can later orchestrate Hummingbird Storyhouse by translating its work into application commands and subscribing to emitted events. It may supply durable repositories, an event bus/outbox, a clock, IDs, storage, and an insight generator. It must not import domain internals, mutate aggregates directly, or become the source of Hummingbird business rules. This preserves independent operation if Avuhz is absent.
