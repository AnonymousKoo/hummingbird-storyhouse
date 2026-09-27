# Coding Agent Rules

- This repository is business/domain/application logic, not a website. Do not add UI frameworks, HTTP servers, databases, auth providers, Supabase, Vercel, or external APIs without an explicit task.
- Preserve the dependency direction: domain is framework-free; application coordinates domain through ports; adapters implement ports. Never import adapters from a domain module.
- Put business invariants and state transitions beside the owning aggregate. Keep AI/probabilistic behavior behind a port.
- Every aggregate and repository operation must preserve the explicit tenant boundary. Test both valid access and cross-tenant failure for new workflows.
- Use branded IDs, injected clocks/IDs, ISO timestamps, and integer-minor-unit Money. Do not use floating-point currency amounts.
- Add repository ports for new aggregate roots. Add a Unit of Work only with a concrete atomic persistence need.
- Keep PostgreSQL in `src/adapters/postgres`; use the private `storyhouse` schema and ordered migrations. Never put SQL or `pg` imports in domain modules.
- Every durable command must keep aggregate writes, its receipt, and outbox events on one transaction-scoped client. Do not publish externally before commit.
- Keep command envelopes transport-neutral. HTTP, provider SDK, auth, and orchestration details belong in future edge adapters, not application contracts.
- Require tenant predicates on all aggregate repository operations and tenant-scoped foreign keys where practical. Integration tests must use a database ending in `_test` before destructive cleanup.
- Commands that may be retried should be idempotent. Publish past-tense, tenant-scoped events only after successful state changes.
- Prefer focused modules and intentional exports. Avoid cross-context object graphs and barrel cycles; reference other aggregates by ID.
- Use fictional brands and external identifiers in examples/tests.
- Before finishing any persistence change, run `npm run check:all`, `npm audit`, `git diff --check`, and inspect `git status`. Update architecture/domain documentation when boundaries or invariants change.
