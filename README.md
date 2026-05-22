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
pnpm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Start local Postgres (option A: Docker)
docker compose up -d

# Apply schema
pnpm --filter @statify/db prisma:migrate:dev

# Run both apps in dev mode
pnpm dev
```

The API runs on http://localhost:4000 and the web app on http://localhost:3000.

## Working on the project

- Read `HANDOFF.md` first.
- Pick a task from `CHECKLIST.md`.
- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`).
- Commit through `scripts/commit-as.sh <key> -m "..."` only.
- Open a PR back to `dev` when ready.

See `CONTRIBUTING.md` for details.

## License

MIT. See `LICENSE`.
