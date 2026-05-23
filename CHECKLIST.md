# Statify, Master Checklist

> **Convention:** Aykhan drives every task. The "Commit author" column records which team member's identity the resulting commits are attributed to, not who does the work. Effort tags (S/M/L/XL) reflect approximate session time, not external workload distribution.

## Current State (updated every session)

- **Phase 4 status:** complete. Seed script merged. Initial Prisma migration committed on `chore/initial-prisma-migration` (commit `50d4c5e`), awaiting PR + merge to `dev`. After that lands, `dev` will be 53 commits ahead of `main`; hold the promotion until Phase 6 deployment items are unblocked.
- **Last finished:** M1 Auth UI (signup, login, logout, password change, account deletion). Soft-delete schema column + migration `20260523150122_add_user_soft_delete`.
- **Working on now:** Phase 5 roadmap, milestone by milestone. M2 Catalog browsing is the next milestone.
- **Open file/component:** none.
- **Open decisions:** none.
- **Blocker:** none.
- **Next concrete action:** open PR for `feat/auth-ui` into `dev`, merge with `--rebase`. Then start M2 Catalog browsing on `feat/catalog-browsing` (commits attributed to `rahila`).

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

- [x] Signup form + validation + success state - M - aykhan (depends on F4)
- [x] Login form + error states - M - aykhan
- [x] Logout - S - aykhan
- [x] Password change - M - aykhan
- [x] Account deletion (soft delete, audit logged) - M - aykhan

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
- [x] Seed script that produces meaningful number of tuples reliably - M - eljan
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

- [x] Generate initial Prisma migration (`prisma migrate dev --name initial`); commit `packages/db/prisma/migrations/` - S - aykhan
- [ ] Production env vars set in Vercel and Render - S - aykhan
- [ ] Smoke test against production URLs - S - aykhan
- [ ] Demo dataset confirmed on prod DB (10k-playlist subset ingested) - M - eljan
- [ ] Warm-up ping verified via cron-job.org - S - elshad
- [ ] Report final draft circulated - L - aykhan
- [ ] Slides for in-class presentation - M - aykhan
- [ ] Final demo dry-run - M - all
- [ ] Submit - S - aykhan
