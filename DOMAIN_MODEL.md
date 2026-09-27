# Domain Model

## Shared values and rules

IDs are opaque by aggregate type. Money is an integer count of minor units plus a normalized three-letter currency code; cross-currency arithmetic fails. Times enter through `Clock` and are persisted as ISO strings. `DomainError` subclasses distinguish invariant, transition, not-found, and conflict failures.

Every aggregate has a `tenantId`. Repository lookup requires both tenant and aggregate ID, preventing an ID learned in one tenant from accessing another tenant's record.

## Aggregate invariants

- **Brand:** organization/name/purpose are present and at least one audience exists.
- **Strategy:** positive integer version, goals, and pillars are required. Only drafts activate.
- **Campaign:** belongs to an active strategy for the same brand; dates are ordered; budget is nonnegative. Creation activates the campaign for immediate operation.
- **Content / production:** campaign-derived briefs begin at `brief`, with idea, hook, brief, and CTA. Normal movement follows `brief → script → production → edit → QA → review`. Approval, scheduling, and receipt workflows exclusively control the remaining `approved → scheduled → published` states. Optional parent IDs express derivative content.
- **Approval:** content must be in review. A pending request can be approved or sent for revision once; revisions require a note. Every action is appended to the audit history. Only an approved request unlocks scheduling.
- **Asset:** one or more immutable logical versions and an identified rights owner are required. Rights capture territories and optional expiry; IDs link assets to content and campaigns.
- **Publication:** approved content produces a scheduled channel intent. A receipt moves it to published and carries a platform-neutral external ID, optional URL, and publish time.
- **Observation:** only published work accepts finite normalized metrics. The observation traces publication → content → campaign → strategy and has an ordered measurement window.
- **Insight:** at least one observation is evidence. Evidence must share a strategy and campaign. Finding, recommendation, and confidence `[0,1]` are stored; acceptance/rejection can later feed strategy planning.
- **Creator:** name and specialty are required; rates use Money and assignments tie agreed deliverables/fees to campaigns.
- **Engagement / Invoice:** engagement revenue, costs, and creator payouts share a currency. Contribution margin is revenue minus all costs and payouts. Invoice quantities are positive integers.

## Consistency boundary

Each aggregate is independently stored and references other aggregates by branded ID. Direct in-memory execution uses the application service as coordinator and retains its existing instance-local idempotency behavior.

Durable execution expands the consistency boundary to one application command. One PostgreSQL transaction contains all changed aggregate payloads/relational projections, the completed command receipt, and the command's outbox events. A failure commits none of those changes. Receipt identity is `(tenantId, commandId)`, and the durable result is replayed without rerunning domain behavior.

PostgreSQL persistence does not change aggregate invariants: JSONB is the lossless domain representation, while scoped relational references enforce tenant-safe singular relationships. Outbox dispatch state and command receipts are persistence concerns, not domain entities.
