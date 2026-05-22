# ADR-001: Statify Architecture and Foundation

**Project:** Statify, Music Streaming Analytics App
**Date:** 2026-05-22
**Status:** Accepted
**Authors:** Aykhan Ahmadzada (decision owner)

## 1. Context

Four developers, zero budget, university project that also serves as a portfolio piece. Data source is the Spotify Million Playlist Dataset (MPD), with 30-second previews fetched live from the iTunes Search API. The grading rubric rewards relational DB design (4-5 entities, 5-6 tables), realistic data volume, at least five advanced SQL queries meaningfully wired into the product, and a polished prototype with frontend and backend properly connected. Visible rubric weight: 10%. Remaining weight assumed to reward general engineering quality.

## 2. Decision Summary

| Area | Decision | Free tier confirmed |
|---|---|---|
| Backend | Node.js 22+ with TypeScript, NestJS 10 | Render free web service or Fly.io free allowance |
| ORM | Prisma 5 (Postgres provider) | OSS |
| Frontend | Next.js 15 (App Router), React 19, TypeScript | Vercel Hobby tier |
| Styling | Tailwind CSS 4, shadcn/ui, Radix primitives | OSS |
| Database | PostgreSQL 16 on Neon | 0.5 GB storage, 190 compute-hours/mo, branching |
| Auth | Email + password, Argon2id, JWT (access + refresh) in httpOnly cookies | Self-hosted |
| State (FE) | React Server Components first; TanStack Query for client; Zustand for ephemeral UI | OSS |
| Forms | React Hook Form, Zod | OSS |
| Validation | Zod schemas shared between FE and BE via `@statify/shared` | OSS |
| Email (future) | Resend free tier (100/day) | Yes |
| Monorepo | pnpm workspaces, single repo | Yes |
| Container (local) | Docker Compose for Postgres + adminer | Yes |
| CI/CD | GitHub Actions | Unlimited minutes on public repos |
| Hosting | Web on Vercel, API on Render free, DB on Neon | Yes; Render spins down after 15 min idle, warmed by cron-job.org |
| Error tracking | Sentry developer plan | 5k events/mo |
| Uptime | UptimeRobot | 50 monitors |
| Warm-up pings | cron-job.org | Unlimited 1-min jobs |
| Image/asset CDN | Use iTunes/Spotify image URLs directly | N/A |
| Audio | iTunes Search API `previewUrl` (30 s m4a) | Free, rate-limited |

## 3. Detailed Decisions

### 3.1 Repository layout

Single repo, pnpm workspaces monorepo, three packages:

```
statify/
  apps/
    web/        Next.js 15 frontend
    api/        NestJS 10 backend
  packages/
    shared/     Zod schemas, DTO types, shared enums, error codes
    db/         Prisma schema, migrations, seed scripts, MPD ingestion CLI
  docs/         ADRs, ERD, API docs, onboarding, runbooks
  scripts/      One-off shell scripts (commit attribution helper, etc.)
  .github/      Actions workflows, PR template, CODEOWNERS
  report/       Academic submission artifacts
```

Rationale: monorepo eliminates type-drift between FE and BE; `packages/shared` owns DTO + validation schemas, both sides import them. pnpm because npm workspaces are slower and yarn classic is unmaintained. Alternatives considered: separate repos (rejected because schema drift is the most common cause of bugs in this kind of project).

### 3.2 Database

**Engine:** Postgres 16 on Neon. Each developer gets a personal branch (Neon's free tier supports branching) so nobody steps on shared dev data.

**Schema philosophy:** start from MPD's natural shape, normalize aggressively, add app-layer tables on top.

**Tables (draft v0):**

MPD-derived (read-mostly, populated by ingestion):
1. `artists` (id PK, spotify_uri UNIQUE, name, normalized_name for search, created_at)
2. `albums` (id PK, spotify_uri UNIQUE, name, primary_artist_id FK, created_at)
3. `tracks` (id PK, spotify_uri UNIQUE, name, album_id FK, duration_ms, itunes_track_id NULL, preview_url NULL, preview_fetched_at NULL)
4. `track_artists` (track_id FK, artist_id FK, role ENUM('primary','featured'), PK(track_id, artist_id))
5. `mpd_playlists` (id PK, mpd_pid UNIQUE, name, collaborative, modified_at, num_followers, num_edits, duration_ms)
6. `mpd_playlist_tracks` (playlist_id FK, track_id FK, pos, PK(playlist_id, pos))

App-layer (read-write):

7. `users` (id PK, email UNIQUE, password_hash, display_name, role ENUM('user','admin') default 'user', created_at, last_login_at)
8. `refresh_tokens` (id PK, user_id FK, token_hash UNIQUE, expires_at, revoked_at NULL, user_agent, ip_addr)
9. `listening_history` (id PK, user_id FK, track_id FK, played_at, source ENUM('preview','seed'), duration_played_ms, INDEX(user_id, played_at DESC))
10. `user_playlists` (id PK, user_id FK, name, description, is_public, created_at, updated_at)
11. `user_playlist_tracks` (user_playlist_id FK, track_id FK, pos, added_at, PK(user_playlist_id, pos))
12. `audit_log` (id PK, actor_user_id FK NULL, action, target_table, target_id, metadata JSONB, created_at, INDEX(actor_user_id, created_at DESC))

Comfortably exceeds the 5-6 table minimum. Audit log is wired in from day one so admin features later are plumbing, not retrofit.

**Genres:** MPD does not carry genre data. We derive a `genres` and `track_genres` table from the iTunes Search API's `primaryGenreName` field, populated lazily as previews are fetched. Documented as a future Phase 4 piece.

**Indexing strategy (initial):**
- B-tree on every FK
- B-tree on `tracks.spotify_uri`, `artists.spotify_uri`, `albums.spotify_uri`
- GIN trigram (`pg_trgm`) on `tracks.name`, `artists.name`, `albums.name` for fuzzy search
- Composite `(user_id, played_at DESC)` on `listening_history`
- Partial index `WHERE preview_url IS NOT NULL` on `tracks`

**Migrations:** Prisma Migrate. Every schema change is a reviewable migration file. No `prisma db push` against shared DBs.

### 3.3 Data ingestion (MPD)

Full MPD (~33 GB raw JSON, 2.26M unique tracks) does not fit Neon's 0.5 GB free tier. Decision: ingest a curated subset.

```
packages/db/src/ingest/
  download.ts       Loads MPD slices from a local path (each slice contains 1000 playlists). Not committed.
  parse.ts          Streams JSON without loading into memory.
  normalize.ts      Pure functions: raw playlist -> { artists, albums, tracks, playlist, playlist_tracks }.
  upsert.ts         Batched Prisma upserts (500 rows per batch), deterministic conflict on spotify_uri.
  cli.ts            `pnpm db:ingest --slices 10 --resume`
  checkpoint.ts     Writes progress to an `ingest_checkpoints` table so partial failures resume.
```

Target: 10-25 slices (10k-25k playlists). Estimated final size: 150-300 MB, comfortably under 0.5 GB.

The MPD itself is never committed. The README documents how each developer downloads it locally.

### 3.4 iTunes Search API integration

Adapter pattern with strict isolation:

```
apps/api/src/integrations/itunes/
  itunes.module.ts
  itunes.service.ts       Public interface
  itunes.client.ts        Raw HTTP client with timeout and retries
  itunes.adapter.ts       iTunes response -> domain shape
  itunes.cache.ts         Postgres-backed (no Redis on free tier)
  itunes.types.ts
```

Rules:
- Caching is persistent, not in-memory. Once a track is resolved, `itunes_track_id`, `preview_url`, `preview_fetched_at` are written onto the `tracks` row. Future requests skip the API.
- Rate limit: in-process token bucket at 20 req/s.
- Graceful degradation: failed lookups set `preview_fetched_at` to the failure time and `preview_url` to NULL. UI hides the play button. Failed lookups are retried after 7 days.
- Lazy not eager. Previews are not pre-fetched during ingestion.

### 3.5 Backend architecture (NestJS)

Layered, with strict direction of dependency. Controllers depend on Services. Services depend on Repositories. Repositories depend on Prisma.

```
apps/api/src/
  modules/
    auth/         AuthModule, AuthController, AuthService, strategies, guards
    users/        UsersModule, UsersController, UsersService, UsersRepository
    catalog/      tracks, artists, albums (read-mostly, heavy queries here)
    playlists/    user playlists CRUD
    history/      listening history write + analytics queries
    analytics/    the 6 advanced SQL queries (each its own service method)
    admin/        admin endpoints, guarded by RolesGuard
  integrations/
    itunes/       see 3.4
  common/
    decorators/   @CurrentUser, @Roles
    guards/       JwtAuthGuard, RolesGuard, ThrottleGuard
    interceptors/ LoggingInterceptor, TransformInterceptor
    filters/      AllExceptionsFilter
    pipes/        ZodValidationPipe
    dto/          base DTOs (PaginationDto, SortDto)
  config/         ConfigModule with Zod-validated env schema
  database/       PrismaModule, PrismaService
  main.ts
  app.module.ts
```

**Patterns applied where:**
- **Repository:** every module that touches the DB has a `*.repository.ts`. Services never touch Prisma directly. Mockable at the repository boundary for unit tests; swappable to raw SQL where needed (the 6 analytics queries use `$queryRaw` directly inside their service for clarity).
- **Service Layer:** all business logic. Pure-ish: input DTO in, domain object out, no HTTP knowledge.
- **DTO:** every controller boundary has a request DTO and a response DTO defined in `packages/shared` as Zod schemas.
- **Adapter:** iTunes integration only.
- **Strategy:** auth (local-jwt now, oauth-google extension point reserved).
- **Factory:** test fixtures (`packages/db/src/test-factories/`). No production factories.

### 3.6 The six advanced SQL queries

Pre-planned so we do not retrofit. Each lives in `analytics.service.ts` as a method using raw parameterized SQL via `prisma.$queryRaw`, with a typed return type. Each is wired into a specific route:

1. **Top N artists for a user, with rank, listen count, and total minutes** (window function `DENSE_RANK() OVER (PARTITION BY ...)`, GROUP BY, HAVING listen_count > 1). Route: `/me/stats/top-artists`.
2. **"Discover": tracks frequently appearing in playlists alongside the user's top track but not yet heard by the user** (correlated subquery + NOT EXISTS). Route: `/discover`.
3. **Listening trend by day of week and hour of day** (GROUP BY EXTRACT, 7x24 heatmap). Route: `/me/stats/heatmap`.
4. **Artists trending in the last 7 days vs prior 7 days, per user** (two CTEs, percentage delta, HAVING growth > threshold). Route: `/me/stats/trending`.
5. **Playlist similarity by Jaccard index** for "playlists similar to this one" (CTE with set intersection over `mpd_playlist_tracks`). Route: `/playlists/:id/similar`.
6. **Global "hidden gems"**: tracks in many playlists but with no preview ever played by any user (LEFT JOIN, IS NULL, HAVING count > N). Route: `/explore/hidden-gems`.

Six total, one buffer over the rubric's five-query minimum. The report will document each query with its SQL and sample I/O in `report/sql-queries.md`.

### 3.7 API design

REST. GraphQL is overkill for a 4-person uni project and complicates caching and rate-limiting.

- Versioning: URL prefix `/api/v1/...`.
- Resource naming: plural nouns, kebab-case where multi-word. `/api/v1/user-playlists`.
- Pagination: cursor-based for feeds (`?cursor=...&limit=20`), offset for stable catalog lists.
- Filtering: `?filter[genre]=rock&filter[year]=2020`.
- Sorting: `?sort=-played_at` (minus for descending).
- Error envelope:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] }, "requestId": "..." }
  ```
- Success envelope: none. Return the resource directly. Trust HTTP status codes.
- Error codes: centralized enum in `packages/shared/src/errors.ts`. Every error has a stable machine-readable `code`.

### 3.8 Frontend architecture (Next.js 15)

```
apps/web/src/
  app/
    (marketing)/             public landing
    (auth)/login, signup     auth flows
    (app)/
      layout.tsx             authed shell
      catalog/...
      me/
        history/
        stats/
        playlists/
      playlists/[id]/
      admin/                 guarded by middleware
    api/                     reserved for webhooks only; backend is NestJS
  components/
    ui/                      shadcn primitives
    catalog/                 domain components
    player/                  audio player
    stats/                   chart components (Recharts)
    forms/                   built on RHF + Zod
  lib/
    api-client.ts            typed fetch wrapper, reads shared DTOs
    auth/
    hooks/
    utils/
  middleware.ts              route guarding (auth + role)
  styles/
```

**State:**
- Server data: React Server Components for the initial render; TanStack Query for client-side mutations and revalidation. No Redux.
- UI state (modals, sidebars, current playing track): Zustand. One store per concern.
- Form state: React Hook Form, validation via shared Zod schemas.

**Design system:** Tailwind 4 + shadcn/ui copy-paste components. Tokens (color, spacing, radii) defined once in `tailwind.config.ts`.

**Accessibility:** Radix primitives via shadcn handle most of this. Enforced: focus rings, semantic HTML, labelled inputs, `eslint-plugin-jsx-a11y` in CI.

**Responsive:** mobile-first Tailwind. Min target: 360 px wide.

### 3.9 Configuration and constants

- Env vars loaded once at boot, validated by Zod, exposed as a typed `config` object. No `process.env.X` access outside the config module.
- Layers: `.env.example` (committed), `.env.local` (per-dev), `.env.test`, production env via platform UIs. No `.env` ever committed.
- Constants: `packages/shared/src/constants/` for domain constants (max page size, allowed sort keys). `apps/*/src/constants/` for app-specific constants.

### 3.10 Testing strategy

- Unit tests (Vitest): pure functions, services with mocked repositories. Target: 70% line coverage on service files and shared.
- Integration tests (Vitest + Testcontainers for ephemeral Postgres): one test per repository method, real DB. Target: every repository method has at least one happy-path test.
- API end-to-end (Vitest + Supertest, full Nest app): one test per controller endpoint covering 200, 400, 401, 403, 404.
- Frontend end-to-end (Playwright): smoke suite covering signup, login, play preview, view stats. Runs on `main` and on PRs labelled `e2e`.
- Frontend component: skip in v1.
- Fixtures: factory functions in `packages/db/src/test-factories/`. Deterministic with a seed.
- What we mock: iTunes API at the client boundary. Nothing else.

### 3.11 Code standards

- ESLint with `@typescript-eslint`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react-hooks`. Custom rule: no `process.env` outside config module.
- Prettier with project config.
- Naming: PascalCase types/classes/components, camelCase vars/functions, SCREAMING_SNAKE_CASE constants, kebab-case files except React components (PascalCase.tsx).
- File size soft cap 300 lines, hard cap 500.
- Cyclomatic complexity max 10.
- Pre-commit: Husky + lint-staged runs eslint --fix and prettier --write on staged files, plus tsc --noEmit on the whole repo.
- Commit messages: Conventional Commits. Enforced by commitlint in the commit-msg hook.

### 3.12 Error handling and logging

- Domain errors extend `AppError` (in `packages/shared`). Each has a `code`, `httpStatus`, and `userMessage`. `AllExceptionsFilter` in NestJS converts them to the standard envelope.
- Logging: Pino, JSON structured. Levels: fatal, error, warn, info, debug, trace. Request-scoped `requestId` correlated through every log line. PII never logged.
- Frontend errors: Sentry browser SDK (free dev plan), 5k events/mo cap.
- Backend errors: Sentry Node SDK alongside Pino.
- Audit log: every admin write and every privileged action (login, password change, account deletion) inserts into `audit_log`.

### 3.13 Security

- Passwords: Argon2id (`argon2` npm pkg), `memoryCost=19456, timeCost=2, parallelism=1` (OWASP 2024 baseline).
- Tokens: Access JWT 15 min, refresh JWT 30 days. Both in httpOnly, SameSite=Lax, Secure cookies. Refresh token rotation on every use; old refresh tokens added to a revocation list.
- CSRF: double-submit cookie for state-changing endpoints.
- Input validation: Zod at every controller boundary.
- SQL injection: Prisma parameterizes everything. Raw queries use the `$queryRaw` template tag.
- Rate limiting: `@nestjs/throttler`. Stricter limits on auth endpoints (5/min/IP) than catalog (100/min).
- CORS: explicit allowlist of origins. No wildcards.
- Secrets: never committed, never logged. Production secrets in platform UIs.
- Headers: `helmet` with strict CSP excluding inline scripts (Next.js handles via nonces).

### 3.14 Performance

- Query budget: any endpoint exceeding 300 ms server time is a bug. Logged with a warning.
- N+1 prevention: Prisma `include` is the default. Lint rule against bare relations. Repository layer enforces eager loading.
- Caching: browser caches static assets via Next. Server-side queries cached briefly (60 s) for catalog reads via `revalidate` in RSCs. No Redis. Postgres-backed cache for iTunes results.
- Connection pooling: Neon's pooled connection string (pgbouncer) for the API; Prisma `?pgbouncer=true`.
- Bundle size: `@next/bundle-analyzer` checked monthly.

### 3.15 Git workflow

Single repo at https://github.com/aykhan019/statify.git, public.

Branch model:
- `main`, protected, only merged from `dev` via PR. CI must be green.
- `dev`, integration branch, also protected.
- Feature branches: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`. Branched from `dev`.
- Hotfixes: branched from `main`, merged into `main` and back-merged to `dev`.

**Commit attribution:** every commit goes through `scripts/commit-as.sh <person-key>`. The wrapper sets `GIT_AUTHOR_*` and `GIT_COMMITTER_*` environment variables from `scripts/.authors` for that one commit. No global git config is modified. Aykhan reviews and merges PRs.

**PR template:** `.github/pull_request_template.md`, includes summary, screenshots (FE), DB migration noted, test plan, breaking changes.

### 3.16 CI/CD

GitHub Actions, four workflows:

1. `ci.yml` on PR and push to `dev`/`main`: typecheck, lint, unit + integration tests (Postgres service container), build both apps.
2. `e2e.yml` on PRs labelled `e2e` and on `main`: Playwright against a deployed preview.
3. `deploy-web.yml`: handled by Vercel Git integration (no GHA needed).
4. `deploy-api.yml`: triggers Render deploy hook on push to `main`.

Public repo gives unlimited GH Actions minutes on standard runners.

### 3.17 Deployment

| Component | Where | Notes |
|---|---|---|
| `apps/web` | Vercel Hobby | Free, generous limits, edge network |
| `apps/api` | Render free web service | Spins down after 15 min idle; warmed by cron-job.org pinging `/healthz` every 10 min |
| Database | Neon free | 0.5 GB, auto-pause on idle, instant resume |
| Static assets | Served by Next.js | No separate CDN |
| Domain | Auto-assigned `*.vercel.app` initially | Custom domain optional later |

### 3.18 Documentation

Lives in `docs/`:
- `README.md` (root): project overview, quickstart.
- `docs/architecture.md`: living narrative summary linking to ADRs.
- `docs/erd.png` + `docs/erd.dbml`: ERD source (dbdiagram.io DBML format).
- `docs/api.md`: generated from NestJS Swagger annotations.
- `docs/onboarding.md`: how a new teammate gets running locally in under 15 minutes.
- `docs/adr/`: ADRs.
- `docs/runbook.md`: recovery procedures.

### 3.19 Extensibility hooks

- **Auth providers:** AuthService implements a Strategy interface; adding Google OAuth later means adding a new strategy, not refactoring.
- **Audio sources:** `TrackPreviewProvider` interface in `apps/api/src/integrations/`. iTunes is one implementation.
- **i18n:** every user-facing string goes through `t('key')` (next-intl). v1 ships English only with all strings extracted.
- **PWA:** `next-pwa` config reserved. Manifest lives at `apps/web/public/manifest.json` from day one.
- **Admin:** `audit_log` and `users.role` exist from day one; admin UI is a Phase 5 feature.

### 3.20 Things we are explicitly NOT doing in v1

- Microservices, message queues, event sourcing.
- Redis (no free tier that matters; Postgres handles it).
- Docker for production (platform-native is simpler and free).
- Custom design tokens system; Tailwind config is enough.
- Storybook.
- API gateway / BFF.
- GraphQL.
- WebSockets.
- Multi-tenancy.

If we change our minds, a new ADR is written.

## 4. Consequences

Positive:
- Type safety from DB to UI; runtime validation matches compile-time types.
- Every architectural choice has a free-tier exit.
- The 12-table schema and 6 pre-planned advanced queries directly address the rubric.
- The `scripts/commit-as.sh` workflow keeps attribution clean.

Negative:
- Render free spin-down adds 30-60 s warm-up on first request after idle. Mitigated by warm pings.
- Neon 0.5 GB cap means we cannot ingest the full MPD; the 10k-25k playlist subset is documented and accepted.
- Roll-our-own auth is more code than Clerk or Supabase Auth would be, but it is the rubric-aligned choice.

## 5. Alternatives Considered

- **Backend:** Express/Fastify (rejected: less structure for patterns), Python FastAPI (rejected: dual-language stack), Java Spring (rejected: cold-start hurts demo).
- **Frontend:** Vite SPA (rejected: no SSR for catalog SEO), SvelteKit (rejected: smaller team familiarity), Angular (rejected: heaviest).
- **Database:** Supabase Postgres (rejected: bundled auth/storage we will not use), MySQL via Aiven (rejected: weaker window-function/CTE story for analytics).
- **Auth:** Clerk / Supabase Auth (rejected: hides the password-handling code the rubric likely rewards), Spotify OAuth (rejected: app-review risk).
