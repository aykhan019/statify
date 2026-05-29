# Statify

**Statify** is a full-stack music streaming analytics application for exploring a playlist-scale catalog, playing 30-second previews, managing playlists, and turning listening history into personal music insights.

The project is built around the **Spotify Million Playlist Dataset**, a normalized PostgreSQL database, a NestJS API, and a Next.js web application.

---

## Features

- Browse tracks, albums, artists, and playlists
- Search and filter a normalized music catalog
- Play 30-second track previews through the web player
- Record listening history
- View personal analytics such as top tracks, top artists, trends, heatmaps, and hidden gems
- Create and manage user playlists
- Admin catalog views for users, tracks, albums, artists, and audit logs
- Authentication with email/password, Argon2 password hashing, JWT, and httpOnly cookies
- Shared DTOs, validation schemas, and types across frontend and backend

---

## Tech Stack

| Area       | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend    | Node.js, NestJS 10, TypeScript                   |
| Database   | PostgreSQL 16, Prisma 5                          |
| Auth       | Argon2, JWT, httpOnly cookies                    |
| Monorepo   | pnpm workspaces                                  |
| Validation | Zod                                              |
| Testing    | Vitest                                           |
| CI         | GitHub Actions                                   |
| Deployment | Vercel for web, Render for API                   |

---

## Repository Structure

```text
statify/
├── apps/
│   ├── api/              # NestJS backend API
│   └── web/              # Next.js frontend
├── packages/
│   ├── db/               # Prisma schema, migrations, seed, ingest scripts
│   └── shared/           # Shared DTOs, schemas, constants, and types
├── docs/                 # Architecture notes, API docs, runbooks, ERD
├── scripts/              # Project helper scripts
├── .github/              # CI workflows and GitHub templates
├── docker-compose.yml    # Local PostgreSQL setup
├── pnpm-workspace.yaml   # Workspace configuration
└── package.json          # Root scripts and tooling
```

---

## Prerequisites

Install these before running the project:

- Node.js 22 or higher
- pnpm 9.x
- Docker Desktop, or another PostgreSQL 16 database
- Git

Enable pnpm with Corepack if needed:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Environment Setup

Create a local environment file:

```bash
cp .env.example .env
```

Important variables:

```env
DATABASE_URL=postgresql://statify:statify@localhost:5432/statify?schema=public
DIRECT_URL=postgresql://statify:statify@localhost:5432/statify?schema=public

API_PORT=4000
API_BASE_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3000

JWT_ACCESS_SECRET=replace-me-with-a-32-byte-random-string
JWT_REFRESH_SECRET=replace-me-with-a-different-32-byte-random-string

COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Never commit real secrets or production `.env` files.

---

## Local Development

Install dependencies:

```bash
pnpm install
```

Start local PostgreSQL:

```bash
docker compose up -d
```

Generate Prisma client:

```bash
pnpm --filter @statify/db prisma:generate
```

Apply database migrations:

```bash
pnpm --filter @statify/db prisma:migrate:dev
```

Run the frontend and backend:

```bash
pnpm dev
```

Default local URLs:

| Service          | URL                           |
| ---------------- | ----------------------------- |
| Web app          | http://localhost:3000         |
| API              | http://localhost:4000         |
| API health check | http://localhost:4000/healthz |
| Adminer          | http://localhost:8080         |

---

## Useful Commands

| Command                                           | Purpose                             |
| ------------------------------------------------- | ----------------------------------- |
| `pnpm dev`                                        | Run local development servers       |
| `pnpm build`                                      | Build all workspace projects        |
| `pnpm typecheck`                                  | Run TypeScript checks               |
| `pnpm lint`                                       | Run ESLint                          |
| `pnpm lint:fix`                                   | Auto-fix lint issues where possible |
| `pnpm format`                                     | Format files with Prettier          |
| `pnpm format:check`                               | Check Prettier formatting           |
| `pnpm test`                                       | Run tests                           |
| `pnpm --filter @statify/db prisma:generate`       | Generate Prisma client              |
| `pnpm --filter @statify/db prisma:migrate:dev`    | Apply local migrations              |
| `pnpm --filter @statify/db prisma:migrate:deploy` | Apply production migrations         |

---

## Database

The database package contains the Prisma schema, migrations, seed scripts, and ingestion utilities.

Common database workflow:

```bash
pnpm --filter @statify/db prisma:generate
pnpm --filter @statify/db prisma:migrate:dev
pnpm --filter @statify/db db:seed
```

For production or hosted databases, use:

```bash
pnpm --filter @statify/db prisma:migrate:deploy
```

---

## Development Workflow

Recommended branch flow:

```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature
```

Before pushing:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
```

Commit messages follow Conventional Commits:

```text
<type>(<scope>): <subject>
```

Examples:

```bash
git commit -m "feat(web): add listening history page"
git commit -m "fix(api): validate playlist ownership"
git commit -m "refactor(db): simplify catalog query helpers"
```

Common types:

```text
feat, fix, chore, docs, refactor, test, perf, ci, build, style
```

---

## CI

GitHub Actions runs checks on pushes and pull requests to `main` and `dev`.

The CI pipeline checks:

- dependency installation
- Prisma client generation
- TypeScript type checking
- ESLint
- Prettier formatting
- production build

---

## Deployment Notes

The project is designed for split deployment:

| Service      | Platform          |
| ------------ | ----------------- |
| Web frontend | Vercel            |
| API backend  | Render            |
| Database     | PostgreSQL / Neon |

Production environment variables must be configured separately in the deployment dashboards.

Recommended production settings:

```env
NODE_ENV=production
COOKIE_SECURE=true
ALLOWED_ORIGINS=https://your-web-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

---

## Team

- Aykhan Ahmadzada
- Elshad Toklayev
- Rahila Dashdiyeva
- Eljan Mammadli

---

## License

MIT License.
