# Coding Agent Rules

- This repository is business/domain/application logic, not a website. Do not add UI frameworks, HTTP servers, databases, auth providers, Supabase, Vercel, or external APIs without an explicit task.
- Preserve the dependency direction: domain is framework-free; application coordinates domain through ports; adapters implement ports. Never import adapters from a domain module.
- Put business invariants and state transitions beside the owning aggregate. Keep AI/probabilistic behavior behind a port.
- Every aggregate and repository operation must preserve the explicit tenant boundary. Test both valid access and cross-tenant failure for new workflows.
- Use branded IDs, injected clocks/IDs, ISO timestamps, and integer-minor-unit Money. Do not use floating-point currency amounts.
- Add repository ports for new aggregate roots. Add a Unit of Work only with a concrete atomic persistence need.
- Commands that may be retried should be idempotent. Publish past-tense, tenant-scoped events only after successful state changes.
- Prefer focused modules and intentional exports. Avoid cross-context object graphs and barrel cycles; reference other aggregates by ID.
- Use fictional brands and external identifiers in examples/tests.
- Before finishing any change, run `npm run check` and inspect `git status`. Update architecture/domain documentation when boundaries or invariants change.
