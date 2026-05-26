# Statify

Music streaming analytics application. Catalog browsing, listening history, personal analytics, playlist management. Built on the Spotify Million Playlist Dataset, with 30-second previews fetched live from the iTunes Search API.

## Team

- Aykhan Ahmadzada, project lead
- Elshad Toklayev
- Rahila Dashdiyeva
- Eljan Mammadli

## Stack

- **Backend:** Node.js, NestJS 10, TypeScript, Prisma 5
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, shadcn/ui
- **Database:** PostgreSQL 16 (Neon)
- **Auth:** Email + password, Argon2id, JWT in httpOnly cookies
- **Monorepo:** pnpm workspaces

## Repository layout

```
statify/
├── apps/
│   ├── api/         NestJS backend
│   └── web/         Next.js frontend
├── packages/
│   ├── shared/      DTOs, Zod schemas, error codes
│   └── db/          Prisma schema, migrations, seed, MPD ingestion CLI
├── docs/            Architecture, ADRs, API, runbook, ERD
├── report/          Academic submission artifacts
├── scripts/         Commit attribution helper, etc.
└── .github/         CI workflows, PR template, CODEOWNERS
```

See `docs/adr/0001-tech-stack-and-foundation.md` for the architecture rationale.

## Quickstart

Prerequisites:

- Node.js 22 or higher
- pnpm 9
- PostgreSQL 16 (local via Docker Compose, or a Neon dev branch)

```bash
git clone https://github.com/aykhan019/statify.git
cd statify
cp .env.example .env
# Edit .env with your DATABASE_URL, DIRECT_URL, and JWT secrets

# Start local Postgres (option A: Docker)
docker compose up -d

# Install deps, generate Prisma client, apply migrations, build every workspace
pnpm setup

# Run both apps in dev mode
pnpm dev
```

`pnpm setup` is the recommended one-shot bootstrap (chains `pnpm install`, `prisma generate`, `prisma migrate deploy`, and `pnpm build`). Run it any time after pulling new commits to keep dependencies, Prisma client, and migrations in sync. Schema drift requires a one-time `pnpm --filter @statify/db run prisma:migrate:dev` first to author the new migration.

The API runs on http://localhost:4000 and the web app on http://localhost:3000.

## Artwork Backfill

Album and artist artwork is populated from the Spotify Web API. The Spotify
app owner must have an active Premium subscription while the app is in
development mode. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in
`.env`, then run:

```bash
pnpm --filter @statify/db db:backfill-media
```

The script only fills missing `image_url` values by default. Use
`--overwrite-existing` only when the stored artwork should be replaced.

## Working on the project

- Read `HANDOFF.md` first.
- Pick a task from `CHECKLIST.md`.
- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`).
- Commit through `scripts/commit-as.sh <key> -m "..."` only.
- Open a PR back to `dev` when ready.

See `CONTRIBUTING.md` for details.

## License

MIT. See `LICENSE`.
