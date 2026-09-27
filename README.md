# Hummingbird Storyhouse Core

Hummingbird Storyhouse Core is the domain and application foundation for a Black-owned multimedia/content company. It turns a client objective into a measurable operating loop: brand intelligence → strategy → campaign → content → production → approval → distribution → analytics → learning → renewal economics.

This repository is a TypeScript library and executable domain demo. It is deliberately **not a website**.

## Quickstart

Requires Node.js 22+ and npm.

```sh
npm install
npm run check
npm run demo
```

The demo uses only fictional data and in-memory adapters. It runs the golden path and prints a small result summary.

## Architecture

The core is organized as a framework-independent modular monolith:

- `src/domain`: twelve bounded contexts, value objects, transitions, and invariants.
- `src/application`: useful cross-context commands and the end-to-end operating loop.
- `src/ports`: clocks, IDs, events, storage, and repository contracts.
- `src/adapters`: deterministic and in-memory implementations for local operation and tests.
- `test`: invariant, boundary, idempotency, economics, and golden-path coverage.

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
- Publish domain events and safely deduplicate application commands.

## Example golden path

`src/demo.ts` composes the service with a fixed clock, sequential IDs, in-memory repositories, event collection, and a deterministic insight generator. The integration test proves the same workflow from onboarding through analytics/learning and engagement economics.

## Deliberately not built

There is no UI, HTTP server, database, object storage implementation, authentication provider, background scheduler, AI vendor, or social-platform integration. There is no Supabase or Vercel setup. Avuhz is not a dependency: future orchestration can issue idempotent commands, subscribe to events, and implement ports without entering the domain core.
