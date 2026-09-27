# Hummingbird Storyhouse Operator

The operator app is Hummingbird’s internal editorial operating workspace. It is a Next.js App Router application running on Node and backed by the repository’s local PostgreSQL adapter. It is not the public site and has no hosted services, authentication provider, social integration, or browser-side database access.

## Run locally

From the repository root:

```sh
npm install
npm run operator:deps
npm run db:up
npm run db:migrate
npm run operator:seed
npm run operator:dev
```

Open `http://localhost:3000`. These scripts intentionally provide local defaults:

- `DATABASE_URL=postgresql://postgres@127.0.0.1:55432/storyhouse_test`
- `STORYHOUSE_TENANT_ID=tenant_storyhouse_demo`

Set both variables explicitly outside the documented local workflow. `STORYHOUSE_TENANT_ID` selects local operating context; it is not authentication and must never be presented as a production security boundary.

The seed migrates first, refuses databases not ending in `_test` or `_dev`, and uses fictional data submitted only through typed durable commands. Fixed command IDs make it restart-safe and idempotent without table mutation or broad cleanup.

## Boundaries

- Server components read through the transport-neutral `OperatorQueryService`.
- Server actions write through `PostgresDurableCommandGateway` and typed commands.
- Domain invariants remain in aggregate modules; pages only present valid workflow affordances.
- `server/runtime.ts` owns the singleton pool, system clock, random gateway IDs, local rule-based insight generator, and environment validation.
- No database URL or core secret is exposed to a client component.

## Quality

```sh
npm run check:all
npm run operator:check
npm audit
git diff --check
```
