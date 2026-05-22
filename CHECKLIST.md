# Statify, Master Checklist

> **Convention:** Aykhan drives every task. The "Commit author" column records which team member's identity the resulting commits are attributed to, not who does the work. Effort tags (S/M/L/XL) reflect approximate session time, not external workload distribution.

## Current State (updated every session)

- **Last finished:** Phase 2 (ADR-001 approved). Phase 3 scaffolding kickoff: repo initialized at `/Users/aykhan/Documents/projects/statify/`, foundation docs written.
- **Working on now:** Phase 3 scaffolding.
- **Open file/component:** none.
- **Open decisions blocking scaffolding:** none.
- **Next concrete action:** initialize git, make foundational commits, install pnpm workspace, configure root tooling, scaffold each app and package, wire CI, push to GitHub with branch protection.

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
- [ ] Write `docs/adr/0001-tech-stack-and-foundation.md` - L - aykhan
- [ ] Write `README.md` - S - aykhan
- [ ] Write `CONTRIBUTING.md` - S - aykhan
- [ ] Write `LICENSE` (MIT) - S - aykhan
- [ ] Write `.gitignore`, `.editorconfig`, `.nvmrc`, `.env.example` - S - aykhan
- [ ] Write `scripts/commit-as.sh` and `scripts/.authors`, make executable - S - aykhan
- [ ] `git init`, set default branch `dev`, first commit (foundation docs) - S - aykhan
- [ ] Initialize pnpm workspace: `pnpm-workspace.yaml`, root `package.json`, root `tsconfig.base.json` - M - elshad
- [ ] Add Prettier config (`.prettierrc`, `.prettierignore`) - S - elshad
- [ ] Add ESLint config (root `eslint.config.mjs`, shared rules) - M - elshad
- [ ] Add commitlint config (`commitlint.config.cjs`) - S - elshad
- [ ] Add Husky + lint-staged (`.husky/pre-commit`, `.husky/commit-msg`) - S - elshad
- [ ] Scaffold `packages/shared`: error codes enum, AppError base, Pagination DTO, Zod base schemas - M - aykhan
- [ ] Scaffold `packages/db`: Prisma init, `prisma/schema.prisma` with 12 tables, seed stub, ingest CLI stub directory - L - eljan
- [ ] Prisma schema commits (the 12 tables from ADR-001 Section 3.2) - L - aykhan
- [ ] Scaffold `apps/api` (NestJS): ConfigModule, PrismaModule, LoggerModule (Pino), AllExceptionsFilter, ZodValidationPipe, /healthz endpoint - L - eljan
- [ ] Scaffold `apps/web` (Next.js 15 App Router): Tailwind 4, shadcn/ui init, base layout, theme tokens, /healthz route stub - L - rahila
- [ ] Add `docker-compose.yml` for local Postgres + adminer - S - elshad
- [ ] Add `.github/workflows/ci.yml` (typecheck, lint, build) - M - elshad
- [ ] Add `.github/pull_request_template.md` and `CODEOWNERS` - S - elshad
- [ ] Run `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`; fix any errors - M - aykhan
- [ ] Push to `https://github.com/aykhan019/statify.git`, create `dev` branch, set branch protection on `main` and `dev` - S - aykhan
- [ ] Verify commit attribution on GitHub for all four identities - S - aykhan

## Phase 4, Foundation pieces (one at a time; each gated on Aykhan's approval)

- [ ] **F1: Config and Logging foundation** (env Zod schema, Pino, request IDs, Sentry wiring) - M - eljan
- [ ] **F2: Database layer foundation** (PrismaService, base repository pattern, transaction helper) - M - eljan
- [ ] **F3: Error handling and API envelope foundation** (AllExceptionsFilter, error codes, validation pipe wired end-to-end) - M - elshad
- [ ] **F4: Auth foundation** (registration, login, refresh rotation, password hashing, CSRF, JwtAuthGuard, RolesGuard, refresh_tokens table use) - XL - aykhan
- [ ] **F5: User session on the frontend** (server-side session lookup, middleware route guard, `useCurrentUser` hook) - L - rahila
- [ ] **F6: Catalog read foundation** (TracksRepository, ArtistsRepository, AlbumsRepository, list+detail endpoints with pagination/filter/sort, DTOs in `shared`) - L - eljan
- [ ] **F7: iTunes adapter foundation** (client, adapter, persistent cache via tracks table, rate limiter, fallback behaviour, integration test against a mock server) - L - elshad
- [ ] **F8: Listening history foundation** (write endpoint with idempotency, repository, schema, indexes) - M - aykhan
- [ ] **F9: Analytics foundation** (the six advanced SQL queries, raw $queryRaw, typed return types, unit tests with seed data) - XL - aykhan
- [ ] **F10: Frontend design system foundation** (theme tokens, base components, layout primitives, navigation shell, audio player component) - L - rahila
- [ ] **F11: MPD ingestion CLI** (parser, normalizer, batched upserts, checkpoint table, resume capability, 10k-playlist dry run) - XL - eljan
- [ ] **F12: Admin extensibility foundation** (audit log writer, admin module skeleton, RolesGuard usage, no UI yet) - M - aykhan

## Phase 5, Feature Roadmap (decomposed)

### Catalog browsing

- [ ] Tracks list page with infinite scroll - M - rahila (depends on F6, F10)
- [ ] Track detail page with preview player, artist + album links - M - rahila
- [ ] Artists list and detail with discography - M - rahila
- [ ] Albums list and detail with track list - M - rahila
- [ ] Genres list and detail (post-genre derivation) - M - rahila

### Search and filtering

- [ ] Global search bar with debounce, multi-entity results - L - eljan (depends on pg_trgm indexes)
- [ ] Filter UI: genre, year, duration range - M - rahila
- [ ] Sort controls on every list - S - rahila

### Accounts and authentication

- [ ] Signup form + validation + success state - M - aykhan (depends on F4)
- [ ] Login form + error states - M - aykhan
- [ ] Logout - S - aykhan
- [ ] Password change - M - aykhan
- [ ] Account deletion (soft delete, audit logged) - M - aykhan

### Listening history

- [ ] "Play" event fires from audio player to backend - S - aykhan (depends on F8)
- [ ] Recent listens page with infinite scroll - M - aykhan
- [ ] Per-track play count on detail pages - S - aykhan

### Personal stats and analytics views

- [ ] Top artists page (advanced query #1 wired into UI with Recharts) - L - aykhan
- [ ] Top tracks page (variant of #1) - M - aykhan
- [ ] Discover page (#2) - L - aykhan
- [ ] Listening heatmap (#3) - M - aykhan
- [ ] Trending artists (#4) - M - eljan
- [ ] Similar playlists (#5) - M - eljan
- [ ] Hidden gems (#6) - M - eljan

### Playlist creation and management

- [ ] Create user playlist - M - elshad
- [ ] Add/remove tracks, reorder (drag-drop) - L - elshad
- [ ] Public vs private toggle - S - elshad
- [ ] Browse other users' public playlists - M - elshad

### iTunes preview playback integration

- [ ] Audio player UI (play, pause, scrub, volume) - L - rahila (depends on F7, F10)
- [ ] Auto-fetch preview on play if not cached - S - rahila (depends on F7)
- [ ] Graceful "preview unavailable" state - S - rahila

### Admin / data management

- [ ] Admin login route + role gate - S - aykhan (depends on F12)
- [ ] Users list with search, ban/unban, role change (audit logged) - M - aykhan
- [ ] Ingestion run trigger from admin UI - M - eljan
- [ ] Audit log viewer - M - aykhan

### Rubric / quality demands

- [ ] ERD diagram (dbdiagram.io DBML export + PNG in `docs/`) - S - aykhan
- [ ] Relational model write-up in `report/erd-explanation.md` - M - aykhan
- [ ] Advanced SQL queries documented in `report/sql-queries.md` - M - aykhan
- [ ] Seed script that produces meaningful number of tuples reliably - M - eljan
- [ ] Final report - L - aykhan
- [ ] Demo script - M - aykhan

## Stretch features (post-rubric)

- [ ] PWA install + offline shell - M
- [ ] AZ / RU translations - M
- [ ] Google OAuth - M
- [ ] Spotify OAuth (if dashboard cooperates) - L
- [ ] Track recommendations via simple matrix factorization on `listening_history` - XL
- [ ] Social: follow other users, see their public listens - XL
- [ ] Native shell via Capacitor - L

## Deployment and submission

- [ ] Production env vars set in Vercel and Render - S - aykhan
- [ ] Smoke test against production URLs - S - aykhan
- [ ] Demo dataset confirmed on prod DB (10k-playlist subset ingested) - M - eljan
- [ ] Warm-up ping verified via cron-job.org - S - elshad
- [ ] Report final draft circulated - L - aykhan
- [ ] Slides for in-class presentation - M - aykhan
- [ ] Final demo dry-run - M - all
- [ ] Submit - S - aykhan
