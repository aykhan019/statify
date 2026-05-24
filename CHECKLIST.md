# Statify, Master Checklist

> **Convention:** Aykhan drives every task. The "Commit author" column records which team member's identity the resulting commits are attributed to, not who does the work. Effort tags (S/M/L/XL) reflect approximate session time, not external workload distribution.

## Current State (updated every session)

- **Phase 4 status:** complete. Seed script and initial Prisma migration merged to `dev`. Hold the dev → main promotion until Phase 6 deployment items are unblocked.
- **Current milestone:** Deployment and submission. Wait for explicit approval before starting.
- **Last shipped:** M8 Rubric / quality demands 6/6. PR #25 landed the DBML source, relational model write-up, advanced SQL queries doc, final report, and demo script; the follow-up docs commit added `docs/erd.png` and ticked the ERD row. The seed script row was already ticked from F11.
- **Last maintenance fix:** Local API browser login now accepts CORS preflight from `http://localhost:3000` through the existing `ALLOWED_ORIGINS` config.
- **Open file/component:** none.
- **Open decisions:** none for the current milestone.
- **Blocker:** none for milestone work.
- **Next concrete action:** wait for approval to start deployment and submission. First deployment row is production env vars set in Vercel and Render.

---

## Phase 1, Discovery

- [x] Stack chosen (NestJS, Next.js 15, Postgres on Neon, Argon2 + JWT) - S - aykhan
- [x] Constraints, rubric, dataset stance captured - S - aykhan

## Phase 2, Architecture Decision Record

- [x] ADR-001 drafted - L - aykhan
- [x] ADR-001 approved - S - aykhan
- [x] Open items resolved (dataset subset, repo visibility, no-AI-references, lazy iTunes-derived genres) - S - aykhan

## Phase 3, Scaffolding

- [x] Create directory tree at `/Users/aykhan/Documents/projects/statify/` - S - aykhan
- [x] Write `HANDOFF.md` - S - aykhan
- [x] Write `CHECKLIST.md` - S - aykhan
- [x] Write `docs/adr/0001-tech-stack-and-foundation.md` - L - aykhan
- [x] Write `README.md` - S - aykhan
- [x] Write `CONTRIBUTING.md` - S - aykhan
- [x] Write `LICENSE` (MIT) - S - aykhan
- [x] Write `.gitignore`, `.editorconfig`, `.nvmrc`, `.env.example` - S - aykhan
- [x] Write `scripts/commit-as.sh` and `scripts/.authors`, make executable - S - aykhan
- [x] `git init`, first commit (foundation docs) - S - aykhan
- [x] Initialize pnpm workspace: `pnpm-workspace.yaml`, root `package.json`, root `tsconfig.base.json` - M - elshad
- [x] Add Prettier config (`.prettierrc`, `.prettierignore`) - S - elshad
- [x] Add ESLint config (root `eslint.config.mjs`, shared rules) - M - elshad
- [x] Add commitlint config (`commitlint.config.cjs`) - S - elshad
- [x] Add Husky + lint-staged (`.husky/pre-commit`, `.husky/commit-msg`) - S - elshad
- [x] Scaffold `packages/shared`: error codes enum, AppError base, Pagination DTO - M - aykhan
- [x] Scaffold `packages/db`: Prisma init, seed stub, ingest CLI stub directory - L - eljan
- [x] Prisma schema commits (the 12 tables from ADR-001 Section 3.2) - L - aykhan
- [x] Scaffold `apps/api` (NestJS): ConfigModule, PrismaModule, LoggerModule (Pino), AllExceptionsFilter, ZodValidationPipe, /healthz endpoint - L - eljan
- [x] Scaffold `apps/web` (Next.js 15 App Router): Tailwind 4, base layout, theme tokens, /healthz route - L - rahila
- [x] Add `docker-compose.yml` for local Postgres + adminer - S - elshad
- [x] Add `.github/workflows/ci.yml` (typecheck, lint, build) - M - elshad
- [x] Add `.github/pull_request_template.md` and `CODEOWNERS` - S - elshad
- [x] Run `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`; fix any errors - M - aykhan
- [x] Push to `https://github.com/aykhan019/statify.git`, create `dev` branch, set branch protection on `main` and `dev` - S - aykhan
- [x] Verify commit attribution on GitHub for all four identities - S - aykhan

## Phase 4, Foundation pieces (one at a time; each gated on Aykhan's approval)

- [x] **F1: Config and Logging foundation** (env Zod schema, Pino, request IDs, Sentry wiring) - M - eljan
- [x] **F2: Database layer foundation** (PrismaService, base repository pattern, transaction helper) - M - eljan
- [x] **F3: Error handling and API envelope foundation** (AllExceptionsFilter, error codes, validation pipe wired end-to-end) - M - elshad
- [x] **F4: Auth foundation** (registration, login, refresh rotation, password hashing, CSRF, JwtAuthGuard, RolesGuard, refresh_tokens table use) - XL - aykhan
- [x] **F5: User session on the frontend** (server-side session lookup, middleware route guard, `useCurrentUser` hook) - L - rahila
- [x] **F6: Catalog read foundation** (TracksRepository, ArtistsRepository, AlbumsRepository, list+detail endpoints with pagination/filter/sort, DTOs in `shared`) - L - eljan
- [x] **F7: iTunes adapter foundation** (client, adapter, persistent cache via tracks table, rate limiter, fallback behaviour, integration test against a mock server) - L - elshad
- [x] **F8: Listening history foundation** (write endpoint with idempotency, repository, schema, indexes) - M - aykhan
- [x] **F9: Analytics foundation** (the six advanced SQL queries, raw $queryRaw, typed return types, unit tests with seed data) - XL - aykhan
- [x] **F10: Frontend design system foundation** (theme tokens, base components, layout primitives, navigation shell, audio player component) - L - rahila
- [x] **F11: MPD ingestion CLI** (parser, normalizer, batched upserts, checkpoint table, resume capability, 10k-playlist dry run) - XL - eljan
- [x] **F12: Admin extensibility foundation** (audit log writer, admin module skeleton, RolesGuard usage, no UI yet) - M - aykhan

## Phase 5, Feature Roadmap (by milestone)

Each milestone is one PR into `dev`. Per-task commits are attributed via the "Commit author" column. A milestone is ticked `[x]` only when every row underneath it is ticked.

- [x] **M1: Authentication UI** - 5/5
  - [x] Signup form + validation + success state - M - aykhan (depends on F4)
  - [x] Login form + error states - M - aykhan
  - [x] Logout - S - aykhan
  - [x] Password change - M - aykhan
  - [x] Account deletion (soft delete, audit logged) - M - aykhan

- [ ] **M2: Catalog browsing** - 4/5
  - [x] Tracks list page with infinite scroll - M - rahila (depends on F6, F10)
  - [x] Track detail page with preview player, artist + album links - M - rahila
  - [x] Artists list and detail with discography - M - rahila
  - [x] Albums list and detail with track list - M - rahila
  - [ ] Genres list and detail (post-genre derivation; waits for later iTunes-derived genre data) - M - rahila

- [x] **M3: Audio player + listening history** - 6/6
  - [x] Audio player UI (play, pause, scrub, volume) - L - rahila (depends on F7, F10)
  - [x] Auto-fetch preview on play if not cached - S - rahila (depends on F7)
  - [x] Graceful "preview unavailable" state - S - rahila
  - [x] "Play" event fires from audio player to backend - S - aykhan (depends on F8)
  - [x] Recent listens page with infinite scroll - M - aykhan
  - [x] Per-track play count on detail pages - S - aykhan

- [x] **M4: Indexes + search/filter** - 3/3
  - [x] Global search bar with debounce, multi-entity results - L - eljan (depends on pg_trgm indexes)
  - [x] Filter UI: duration range and preview availability - M - rahila (genre/year waits for later iTunes-derived data)
  - [x] Sort controls on every list - S - rahila

- [x] **M5: Personal stats and analytics views** - 8/8
  - [x] Top artists page (advanced query #1 wired into UI with Recharts) - L - aykhan
  - [x] Top tracks page (variant of #1) - M - aykhan
  - [x] Discover page (#2) - L - aykhan
  - [x] Listening heatmap (#3) - M - aykhan
  - [x] Trending artists (#4) - M - eljan
  - [x] MPD playlist browsing (list + detail endpoints and /catalog/playlists pages, prereq for #5) - M - eljan
  - [x] Similar playlists (#5) - M - eljan
  - [x] Hidden gems (#6) - M - eljan

- [x] **M6: Playlist creation and management** - 4/4
  - [x] Create user playlist - M - elshad
  - [x] Add/remove tracks, reorder (drag-drop) - L - elshad
  - [x] Public vs private toggle - S - elshad
  - [x] Browse other users' public playlists - M - elshad

- [x] **M7: Admin / data management** - 4/4
  - [x] Admin login route + role gate - S - aykhan (depends on F12)
  - [x] Users list with search, ban/unban, role change (audit logged) - M - aykhan
  - [x] Ingestion run trigger from admin UI - M - eljan
  - [x] Audit log viewer - M - aykhan

- [x] **M8: Rubric / quality demands** - 6/6
  - [x] ERD diagram (dbdiagram.io DBML export + PNG in `docs/`) - S - aykhan
  - [x] Relational model write-up in `report/erd-explanation.md` - M - aykhan
  - [x] Advanced SQL queries documented in `report/sql-queries.md` - M - aykhan
  - [x] Seed script that produces meaningful number of tuples reliably - M - eljan
  - [x] Final report - L - aykhan
  - [x] Demo script - M - aykhan

## Stretch features (post-rubric)

- [ ] PWA install + offline shell - M
- [ ] AZ / RU translations - M
- [ ] Google OAuth - M
- [ ] Spotify OAuth (if dashboard cooperates) - L
- [ ] Track recommendations via simple matrix factorization on `listening_history` - XL
- [ ] Social: follow other users, see their public listens - XL
- [ ] Native shell via Capacitor - L

## Deployment and submission

- [x] Generate initial Prisma migration (`prisma migrate dev --name initial`); commit `packages/db/prisma/migrations/` - S - aykhan
- [ ] Production env vars set in Vercel and Render - S - aykhan
- [ ] Smoke test against production URLs - S - aykhan
- [ ] Demo dataset confirmed on prod DB (10k-playlist subset ingested) - M - eljan
- [ ] Warm-up ping verified via cron-job.org - S - elshad
- [ ] Report final draft circulated - L - aykhan
- [ ] Slides for in-class presentation - M - aykhan
- [ ] Final demo dry-run - M - all
- [ ] Submit - S - aykhan
