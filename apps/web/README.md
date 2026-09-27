# Hummingbird Storyhouse Public Web

The public Storyhouse site is a static-first Next.js App Router application positioning Hummingbird as a media + marketing operating company. It is intentionally separate from the private operator workspace and does not import the domain core, PostgreSQL adapter, or operator UI.

## Local development

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Production verification:

```sh
npm run typecheck
npm run build
npm audit
npm run start
```

No environment variables, database, analytics service, or external API are required.

## Intake behavior

The project intake form validates in the browser and shows a local acknowledgement. It does **not** deliver or persist submissions. Before production lead collection is enabled, replace the explicit TODO in `components/intake-form.tsx` with an approved transport while keeping provider and orchestration details outside application contracts.

## Vercel project settings

- Project name: `hummingbird-storyhouse`
- Root directory: `apps/web`
- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm ci`
- Environment variables: none for this phase

Do not point the Vercel project at the repository root or `apps/operator`; the operator application is private and has separate runtime requirements.
