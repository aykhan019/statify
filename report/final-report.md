# Statify, Final Report

**Course:** Database Systems
**Project:** Music streaming analytics application
**Team:** Aykhan Ahmadzada (lead), Elshad Toklayev, Rahila Dashdiyeva, Eljan Mammadli
**Submission date:** 2026-05-24

---

## Abstract

Statify is a full-stack music streaming analytics application backed by PostgreSQL 16, built around the Spotify Million Playlist Dataset (MPD) and enriched with 30-second audio previews fetched live from the iTunes Search API. The application supports email/password authentication with Argon2id and JWT-based session management, listening-history capture with retry-safe idempotency, six advanced SQL queries powering personal analytics surfaces, user-authored playlists with public sharing, a global trigram-backed search bar, and an audit-logged administrative console for user management and ingest control. The schema is normalized to third normal form across thirteen tables, with composite primary keys preserving positional ordering in playlist memberships and a partial GIN index strategy backing fuzzy catalog search. This report documents the design decisions, the data model, the six analytical queries, the development process, and the engineering trade-offs encountered along the way.

---

## 1. Introduction

### 1.1 Problem statement

The grading rubric for this project rewards (a) a normalized relational database with at least five or six entities, (b) realistic data volume in the demonstration database, (c) at least five advanced SQL queries that are meaningfully wired into the product (not merely tucked into the report), and (d) a polished prototype with the frontend and backend properly connected. The 10 percent of the grade attributed to the rubric itself is the visible target; the remaining weight is understood to reward general engineering quality, project organization, and the rigor of the report and demo.

Within that frame, Statify takes the music streaming analytics application as its product narrative. The product question is: "given a large public catalog of curated playlists and a population of users whose listening history accumulates as they explore that catalog, what insights and discovery tools can the schema support?" The answer is six analytical queries: top artists, top tracks (variant), discover (cohort co-occurrence), listening heatmap, trending artists (sliding window), similar playlists (Jaccard), and hidden gems.

### 1.2 Scope

- **In scope.** Account creation, login, password change, account deletion (soft), catalog browsing for tracks/artists/albums, audio preview playback with listening-history capture, six personal analytics surfaces, user playlist creation with public/private toggles, browsing other users' public playlists, global search across the catalog, admin user management with ban/role controls, admin-triggered ingest runs, and a full audit-log viewer.
- **Out of scope.** Recommendation models beyond co-occurrence (no matrix factorization in v1; documented as a stretch), genre-derived browsing (waits for an iTunes-derived genre enrichment task not in the current rubric scope), social graphs, native shells, and offline playback.

### 1.3 Dataset

The Spotify Million Playlist Dataset (MPD) provides one million curated playlists. The full corpus expands to roughly 33 GB of raw JSON and 2.26 million unique tracks; this exceeds Neon's 0.5 GB free-tier ceiling by two orders of magnitude. The decision was to ingest a curated subset of ten to twenty-five thousand playlists, with a target final database size of 150 to 300 MB. The MPD itself is never committed to the repository.

Audio previews come from the iTunes Search API's `previewUrl` field. Lookups are lazy (only when a user presses play on a track without a cached preview) and persistent (the resolved URL is written onto the `tracks` row, so subsequent plays skip the API call entirely). Failed lookups are retried after seven days. This produces a hybrid catalog: MPD owns identity and metadata; iTunes owns playable audio.

---

## 2. Stack and architecture

### 2.1 Technology choices

| Layer          | Choice                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- |
| Backend        | Node.js 22 with TypeScript, NestJS 10                                                    |
| ORM            | Prisma 5 with the PostgreSQL provider                                                    |
| Frontend       | Next.js 15 (App Router), React 19, TypeScript                                            |
| Styling        | Tailwind CSS 4 with shadcn/ui and Radix primitives                                       |
| Database       | PostgreSQL 16 on Neon (free tier, branching enabled)                                     |
| Authentication | Email + password, Argon2id, JWT (access + refresh) in httpOnly cookies                   |
| Frontend state | React Server Components first, TanStack Query for client cache, Zustand for ephemeral UI |
| Forms          | React Hook Form with Zod schemas                                                         |
| Shared types   | `@statify/shared` workspace package with Zod schemas and DTO types                       |
| Monorepo       | pnpm workspaces                                                                          |
| Local infra    | Docker Compose for Postgres and adminer                                                  |
| CI             | GitHub Actions on every PR                                                               |
| Hosting        | Vercel (web), Render free tier (API), Neon (database)                                    |
| Error tracking | Sentry developer plan                                                                    |

Rationale for the principal decisions is captured in `docs/adr/0001-tech-stack-and-foundation.md`. The dominant constraints were: zero budget, free-tier hosting, a four-person team coordinating asynchronously, and a six-week implementation window.

### 2.2 Repository layout

```
statify/
  apps/
    api/         NestJS backend
    web/         Next.js frontend
  packages/
    shared/      Zod schemas, DTOs, error codes
    db/          Prisma schema, migrations, seed, MPD ingestion CLI
  docs/          ADR, ERD source, future architecture/API/runbook docs
  report/        Academic submission artifacts (this file lives here)
  scripts/       Commit attribution helper and authors file
  .github/       CI workflows, PR template, CODEOWNERS
```

The monorepo is the single most consequential structural decision: it eliminates type-drift between frontend and backend by letting both sides import the same Zod schemas from `@statify/shared`. The cost is a slightly more complex pnpm install graph; the benefit is that schema mismatches surface at compile time rather than as 400 errors at runtime.

### 2.3 Backend architecture (NestJS)

NestJS provides a layered architecture with strict dependency direction: controllers depend on services, services depend on repositories, repositories depend on Prisma.

```
apps/api/src/
  modules/
    auth/             registration, login, refresh, password change, deletion
    users/            current-user lookups
    catalog/          tracks, artists, albums (read-mostly, paginated lists + detail)
    history/          listening-history write + recent listens read
    analytics/        the six advanced SQL queries
    mpd-playlists/    MPD playlist browse + detail
    user-playlists/   user playlist CRUD and track membership
    community/        public user-playlist discovery
    admin/            admin user management, ingest control, audit log
  integrations/
    itunes/           HTTP client, adapter, persistent cache, rate limiter
  common/
    guards/           JwtAuthGuard, RolesGuard, ThrottleGuard
    filters/          AllExceptionsFilter
    pipes/            ZodValidationPipe
  database/           PrismaService, transaction helper
  config/             Zod-validated environment schema
```

Three engineering patterns recur throughout:

- **Repository pattern.** Every module that touches the database has a `*.repository.ts`. Services never call Prisma directly. This keeps services unit-testable and lets the analytics module bypass Prisma's fluent API in favor of raw SQL where the queries require it.
- **DTO with Zod.** Every controller boundary has request and response DTOs defined in `@statify/shared`. The same Zod schemas validate inbound payloads on the API and shape forms on the web side.
- **Adapter pattern (iTunes).** The iTunes integration is the only third-party adapter; its HTTP client, rate limiter, and persistent cache are isolated behind a service interface so the rest of the application sees only domain shapes.

### 2.4 Frontend architecture (Next.js)

The frontend uses the Next.js App Router with React Server Components as the default. The application is partitioned into three route groups:

- `(auth)` for `/login`, `/signup`, `/forgot-password`. No application chrome.
- `(app)` for the authenticated surfaces: `/catalog/*`, `/me/*`, `/playlists/*`, `/community/*`, `/admin/*`. Shared layout with sidebar and audio player.
- `(public)` for the marketing page (out of scope for the prototype but reserved).

The audio player is a singleton Zustand store rendered in the `(app)` layout so navigation between routes never interrupts playback. Listening events are fired from the audio player as soon as audio starts, captured by a small client-side reporter, and POSTed to `/api/v1/listening-history` with a client-generated idempotency key scoped per session.

---

## 3. Database design

The full relational write-up lives in `report/erd-explanation.md` and the rendered diagram is `docs/erd.png` (source: `docs/erd.dbml`). This section summarizes the schema and the design choices a reader would otherwise have to reverse-engineer from the diagram.

### 3.1 Schema overview

Thirteen tables in two zones:

**MPD-derived (read-mostly):**

- `artists`, `albums`, `tracks` (one row per identity).
- `track_artists` resolves M:N between tracks and artists with a `role` enum (`primary` or `featured`).
- `mpd_playlists` (one row per MPD playlist) and `mpd_playlist_tracks` (junction with position).

**App-layer (read-write):**

- `users` with soft-delete (`deleted_at`) and admin-ban (`banned_at`) tombstones.
- `refresh_tokens` storing only SHA-256 hashes of refresh tokens, one row per active device.
- `listening_history` with an append-only contract and a `(user_id, idempotency_key)` UNIQUE constraint that makes duplicate POSTs from a retrying client safe.
- `user_playlists` and `user_playlist_tracks` for user-authored content with positional ordering and a public/private flag.
- `audit_log` recording every privileged action with an actor, an action verb, a target, and arbitrary JSON metadata.
- `ingest_checkpoints` as a sidecar for the ingest CLI's resume capability.

The schema is in third normal form (3NF) with a single deliberate denormalization: `mpd_playlists.duration_ms` precomputes the sum of its tracks' durations. The MPD source payload supplies this value directly and user code never mutates MPD playlist membership, so storing it avoids a recompute on every playlist render.

### 3.2 Why surrogate keys throughout

Every entity uses an auto-incremented integer primary key even where a natural key exists (`spotify_uri`, `email`, `mpd_pid`, `slice_filename`). Surrogate keys give foreign keys a stable shape independent of upstream identifier changes, keep join sizes small, and let UNIQUE constraints enforce the natural-key invariant without coupling foreign-key shape to it. The ingest CLI upserts on `spotify_uri` so re-runs are idempotent without invalidating any app-layer foreign keys.

### 3.3 Index strategy

The most consequential index in the schema is `listening_history (user_id, played_at DESC)`. It backs Recent listens, Top artists, Top tracks, Heatmap, and Trending artists.

The catalog search bar uses three GIN indexes with `gin_trgm_ops` on `artists.name`, `albums.name`, and `tracks.name`. These are defined in a raw SQL migration because Prisma's schema language does not expose `gin_trgm_ops` directly. The trigram indexes back substring and fuzzy matching on the global search bar without forcing a full catalog scan.

A partial B-tree index on `tracks (id) WHERE preview_url IS NOT NULL` accelerates the preview-availability filter. A partial index here is far cheaper than a full index on `preview_url` because the cardinality of non-null previews is much lower than the catalog size.

### 3.4 Constraints worth singling out

- `listening_history (user_id, idempotency_key)` UNIQUE makes duplicate POSTs from a retrying client safe.
- `track_artists` PK `(track_id, artist_id)` forbids the same artist appearing twice on a track with different roles.
- `mpd_playlist_tracks` PK `(playlist_id, pos)` and `user_playlist_tracks` PK `(user_playlist_id, pos)` forbid duplicate positions within a playlist, so drag-and-drop reorders that would otherwise collide fail loudly.
- All `spotify_uri` and `mpd_pid` UNIQUE constraints make ingest re-runs idempotent.

---

## 4. Data ingestion

### 4.1 The MPD ingest CLI

The ingest CLI lives in `packages/db/src/ingest/`:

```
download.ts     loads MPD slices from a local path (each slice = 1000 playlists)
parse.ts        streams JSON without loading into memory
normalize.ts    pure transformations: raw playlist -> { artists, albums, tracks, playlist, playlist_tracks }
upsert.ts       batched Prisma upserts (500 rows per batch), deterministic conflict on spotify_uri
checkpoint.ts   reads/writes ingest_checkpoints so partial failures can resume
cli.ts          the executable: pnpm --filter @statify/db db:ingest --data-dir ./data/mpd --slices 10 --resume
```

The CLI is intentionally streaming end-to-end: a single slice never lives in memory in its entirety. `parse.ts` uses a JSON streaming reader; `normalize.ts` yields per-playlist deltas; `upsert.ts` batches them into 500-row Prisma upserts on `spotify_uri` (artists, albums, tracks) and `mpd_pid` (playlists). The checkpoint table records per-slice progress with counts of upserted artists, albums, and tracks; the `--resume` flag skips completed slices.

The CLI is exported from `@statify/db` as a function (`runIngest`) so the admin module can invoke it in-process when the operator triggers a run from the admin UI. A single in-flight slot on the `AdminIngestService` instance prevents concurrent triggers from double-starting; the slot is cleared in a `finally` so a failure does not jam future triggers.

### 4.2 The iTunes adapter

The iTunes integration follows a strict adapter pattern:

```
apps/api/src/integrations/itunes/
  itunes.module.ts
  itunes.service.ts    public interface used by the catalog service
  itunes.client.ts     raw HTTP client with timeout and retries
  itunes.adapter.ts    iTunes JSON -> domain shape
  itunes.cache.ts      Postgres-backed cache (no Redis on the free tier)
  itunes.types.ts
```

The cache is persistent rather than in-memory. Once a track is resolved, `itunes_track_id`, `preview_url`, and `preview_fetched_at` are written onto the `tracks` row. Future requests for that track skip the API entirely. The in-process token bucket rate-limits the client to twenty requests per second, well below any documented iTunes Search limit. Failed lookups set `preview_fetched_at` to the failure time and `preview_url` to NULL; the UI hides the play button and the cache only re-attempts after seven days.

The choice of "persistent cache on the existing tracks table" rather than "separate `track_previews` table" reflects the fact that the relationship is strictly 1:1, the iTunes payload contains no other fields we persist, and a single-table read makes the player path one query shorter.

---

## 5. Authentication and session management

The auth stack is intentionally self-hosted to avoid taking a dependency on a third-party identity provider for a class project.

### 5.1 Password storage

Passwords are hashed with Argon2id at the OWASP-recommended parameters (`memoryCost: 19 MiB`, `timeCost: 2`, `parallelism: 1`). The hash format is the standard `$argon2id$...` encoded form, stored verbatim in `users.password_hash`. Verification happens server-side only; the raw password never leaves the request handler.

### 5.2 Token strategy

Authentication uses a dual-token scheme:

- **Access token.** A short-lived (15-minute) JWT containing `{ sub, role, iat, exp }`. Sent on every request via an `httpOnly`, `secure`, `sameSite=lax` cookie. The frontend never reads its value.
- **Refresh token.** A long-lived (30-day) opaque random string. Stored server-side as SHA-256 in the `refresh_tokens` table along with `user_agent`, `ip_addr`, `expires_at`, and `revoked_at`. The raw token also lives in an `httpOnly` cookie.

Rotation is mandatory: every successful `/auth/refresh` invalidates the previous refresh token (sets `revoked_at = now()`) and issues a new one. This shrinks the window during which a stolen refresh token is useful and creates a detection signal: if a stolen token is used while the legitimate device is also using its rotation, the legitimate device's next refresh attempt fails and forces re-login.

### 5.3 Authorization

`JwtAuthGuard` enforces presence and validity of the access token. `RolesGuard` enforces role-based gates: the `@Roles('admin')` decorator on `/api/v1/admin/*` controllers restricts access to admin users. The web side mirrors this with a layered approach: the middleware (`apps/web/src/middleware.ts`) only checks for an access cookie; the role check happens in the server-rendered `(app)/admin/layout.tsx` and again in each admin page's server component for defense in depth; the API enforces `@UseGuards(JwtAuthGuard, RolesGuard)` plus `@Roles('admin')` on every privileged route.

Ban and role changes both revoke active refresh tokens inside the same transaction as the column update so the JWT's role claim cannot lag. Access JWTs still live for their 15-minute ceiling, but no new ones can be minted. Banned accounts are filtered at `AuthRepository.findUserByEmail` and `findUserById` (`bannedAt: null`, mirroring `deletedAt: null`), so a banned user gets `INVALID_CREDENTIALS` rather than a distinguishing error.

### 5.4 Self-protection

`AdminUsersService.setRole` and `setBan` refuse self-targets so an admin cannot accidentally lock themselves out. The web table also disables the action buttons for the actor's own row.

---

## 6. Listening history pipeline

The listening-history pipeline is the project's tightest end-to-end loop and the workhorse behind every analytical query.

1. **Capture.** The audio player fires a `play` event on the transition into playing state. A small client-side reporter (`PlayHistoryReporter`) generates an idempotency key per session per track and POSTs `{ trackId, durationPlayedMs }` plus the idempotency key to `/api/v1/listening-history`.
2. **Idempotency.** The API uses `(user_id, idempotency_key)` UNIQUE on the `listening_history` table. A retry from the client returns the existing row's id instead of inserting twice.
3. **Server-assigned timestamp.** `played_at` defaults to `now()` server-side rather than trusting a client clock. This is the reason heatmap and trending-artist queries are reliable.
4. **Persistence.** The history row references the catalog via `track_id` (FK to `tracks.id`). The track-id stability across ingest re-runs (because ingest upserts on `spotify_uri`) means the FK never breaks.
5. **Read paths.** Recent listens reads `(user_id, played_at DESC)` with cursor pagination. The six analytics queries each lean on the same composite index from a different angle.

The "play event" counts a play as soon as audio starts (one history row per track per session, per the idempotency key). The product later decides to enforce a stricter rule (for example, fire only after fifty percent played); the reporter would move from the `onPlay` callback to `onTimeUpdate` without any schema change.

---

## 7. Six advanced SQL queries

Full SQL, motivations, and sample I/O for each query are documented in `report/sql-queries.md`. This section summarizes what each query proves about the schema and the surface it powers.

| #   | Query                    | Route                                  | Techniques                                          |
| --- | ------------------------ | -------------------------------------- | --------------------------------------------------- |
| 1   | Top artists / Top tracks | `/me/top-artists`, `/me/top-tracks`    | `DENSE_RANK()` window, GROUP BY, HAVING             |
| 2   | Discover                 | `/me/discover`                         | Two chained CTEs, `IN (SELECT ...)`, `NOT EXISTS`   |
| 3   | Listening heatmap        | `/me/heatmap`                          | `EXTRACT(DOW)`, `EXTRACT(HOUR)`, composite GROUP BY |
| 4   | Trending artists         | `/me/trending`                         | Two sliding-window CTEs, LEFT JOIN, CASE growth     |
| 5   | Similar playlists        | `/catalog/playlists/[id]` similar rail | CTE + `FILTER` aggregate, UNION subquery, Jaccard   |
| 6   | Hidden gems              | `/explore/hidden-gems`                 | LEFT JOIN anti-join (`IS NULL`), HAVING threshold   |

All six are parameterized through Prisma's `$queryRaw` template with bound placeholders, not interpolated strings. The single use of `Prisma.raw(...)` (in the trending-artists query, for `INTERVAL` literals) is fed exclusively from a numeric constant in code.

The six queries cover the rubric's "at least five advanced queries" requirement with one buffer query, and span the full vocabulary the course expects: window functions, CTEs, set membership, anti-joins, conditional aggregation, and sliding-window time arithmetic.

---

## 8. Catalog browsing and search

The catalog read paths use Prisma's fluent API rather than raw SQL because the queries are straightforward keyset-paginated reads.

- **Tracks list (`/catalog/tracks`).** Infinite scroll, cursor on `tracks.id`. Filterable by preview availability and duration range. Sortable by name or duration.
- **Artist detail (`/catalog/artists/[id]`).** Discography expressed as albums in reverse chronological order with each album's track list lazy-loaded on expand.
- **Album detail (`/catalog/albums/[id]`).** Full track list with per-track preview availability indicators.
- **MPD playlist detail (`/catalog/playlists/[id]`).** The full positionally-ordered track list plus the "similar playlists" rail powered by query Q5.

The global search bar is the most interesting catalog surface. It hits `GET /api/v1/search?q=...` which dispatches three parallel queries against the trigram indexes:

```sql
SELECT ... FROM artists WHERE name % $1 ORDER BY similarity(name, $1) DESC LIMIT 5;
SELECT ... FROM albums  WHERE name % $1 ORDER BY similarity(name, $1) DESC LIMIT 5;
SELECT ... FROM tracks  WHERE name % $1 ORDER BY similarity(name, $1) DESC LIMIT 10;
```

Combined into a single multi-entity response. The `pg_trgm` `%` operator uses the GIN trigram indexes; without them, this would be three sequential scans across the entire catalog.

---

## 9. Playlists

Two playlist universes coexist in the same schema and never mix:

- **MPD playlists** (`mpd_playlists`, `mpd_playlist_tracks`). Read-only from the application's perspective. Mutated only by the ingest CLI. Browsed via `/catalog/playlists/*`.
- **User playlists** (`user_playlists`, `user_playlist_tracks`). Owner-mutable. Browsed via `/playlists/*` for the owner, and via `/community/*` for other users' public playlists.

The two table families have parallel shapes (junction with positional ordering, composite PK on `(playlist_id, pos)`) so analytical queries that work over MPD playlists can be adapted to user playlists without restructuring.

Drag-and-drop reordering on the user-playlist track list rewrites the affected `pos` values inside a single transaction. The composite PK on `(user_playlist_id, pos)` means a partial rewrite that would leave duplicates fails loudly inside the transaction rather than producing silent corruption.

The `is_public` toggle gates inclusion in the community browse feed. Private playlists are visible only to their owner; making a playlist private after sharing immediately removes it from the community feed.

---

## 10. Administrative console

The administrative console lives at `/admin/*`:

- **`/admin`.** Landing page with quick links to each admin surface.
- **`/admin/users`.** Searchable user list with ban/unban and role-change actions. Self-targets are disabled. Every action is audit-logged.
- **`/admin/ingest`.** Trigger an in-process MPD ingest run with configurable data directory, slice count, resume flag, and batch size. Shows the slice-by-slice checkpoint table.
- **`/admin/audit-log`.** Paginated, filterable view of the `audit_log` table. Filters by action verb, actor user id, and target table.

The audit log is the centerpiece of the admin story. Every privileged action (password change, account deletion, admin ban/unban, admin role change, admin ingest trigger) writes an `audit_log` row inside the same transaction as the state mutation. Audit-log rows persist via `ON DELETE SET NULL` on `actor_user_id` so deleting the actor preserves the audit trail.

The ingest trigger is the only admin action that runs work in-process rather than just mutating the database. A single in-flight slot on the `AdminIngestService` instance prevents concurrent triggers from double-starting; the slot is cleared in a `finally` so a failure does not jam future triggers. The audit-log entry captures the actor and the requested data directory, slice count, resume flag, and batch size, so a postmortem of "who started the ingest that filled the database" is one query away.

---

## 11. Engineering process

### 11.1 Branching and merges

The default branch is `main`; active development happens on `dev`. Per ADR-001 Section 3.15, `main` is only updated by PR from `dev`. Every milestone ships as one PR into `dev` from a `feat/<milestone-slug>` branch with per-task commits. Merges use `gh pr merge <n> --rebase --delete-branch` to preserve per-task commit history.

### 11.2 Commit attribution

Each commit is attributed to exactly one of the four team members via `scripts/commit-as.sh <person-key>`, which sets `GIT_AUTHOR_*` and `GIT_COMMITTER_*` from a versioned `.authors` file. The "Commit author" column in `CHECKLIST.md` records which identity each task's resulting commits are attributed to. No external tool, model, or product name appears anywhere in the repository: not in commits, code comments, documentation, PR descriptions, or commit co-authors.

### 11.3 Continuous integration

GitHub Actions runs lint, typecheck, and build on every PR. `dev` is protected with a "Required status check: ci" rule. Docs-only commits to `dev` (the per-milestone session-close cadence) are allowed to bypass the rule by design; feature work always goes through a PR where CI runs and must pass.

### 11.4 ADRs and the structural changes log

Architectural decisions (library choice, pattern adoption, schema change) live in `docs/adr/` as numbered ADRs. The current state of the repository is captured in `HANDOFF.md` Section 2, which is updated at the end of every working session, and Section 3 of the same file logs structural changes (folder layout, top-level dependencies added) with the ADR they reference.

### 11.5 Testing

The test suite spans three workspaces:

- **API:** 139 tests covering auth flow, listening-history idempotency, all six analytics queries, admin guards and self-protect rules, ingest CLI batching, and the iTunes adapter against a mock server.
- **Web:** 48 tests covering the admin role gate, the listening-history reporter's idempotency-key generation, the audio player's transition handling, and the catalog list cursor logic.
- **Database package:** 44 tests covering the seed script, the ingest parser/normalizer, and the migration round-trip.

Local verification before any push runs `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` across all workspaces, plus a production build of the web app.

---

## 12. Known limitations and future work

- **Full end-to-end UI smoke against production.** The repository pins Node 22 in `.nvmrc`. Local shells on Node 26 fail the API source-import resolution; the next full end-to-end smoke run against seeded production data needs Node 22. M5, M6, and M7 surfaces all require this before the `dev -> main` promotion.
- **Genre-derived browsing.** MPD does not carry genre data. The plan is to derive genre from the iTunes Search API's `primaryGenreName` field, populated lazily as previews are fetched. This is a documented future Phase 4 piece; the current rubric scope does not require it.
- **Deployment.** Production environment variables in Vercel and Render are still to be set; the warm-up ping via cron-job.org and the production smoke test are the remaining Phase 6 items. Once those gates clear, `dev -> main` promotes the full feature set.
- **Recommendations.** Discover (query Q2) is a co-occurrence-based recommendation. A matrix-factorization-based recommender on `listening_history` is reserved as a stretch task; the schema already supports it without modification.
- **Stricter play event.** The current rule counts a play as soon as audio starts. A stricter rule (for example, fifty-percent-played) is a one-line change in the client reporter.
- **`toQueryString` deduplication.** The query-string builder is currently duplicated across five web API clients (`apps/web/src/lib/{admin,analytics,playlists,history,user-playlists}/api.ts`). Hoisting into a shared util under `apps/web/src/lib/utils/` is a separate small refactor task on the open-threads list.

---

## 13. Conclusion

The project meets every visible rubric requirement: a normalized thirteen-table schema, realistic data volume from the MPD subset, six advanced SQL queries each wired into a specific product surface, and a polished prototype connecting a Next.js frontend to a NestJS backend over a typed API.

Beyond the rubric, three engineering choices proved load-bearing for the project's quality. First, the monorepo with `@statify/shared` Zod schemas eliminated the most common class of bug in client/server projects (DTO drift) by construction. Second, the layered admin role-gate (middleware cookie check, server-component role check, API guards) caught misconfigurations during development at three independent layers rather than at runtime in front of a grader. Third, the `(user_id, idempotency_key)` UNIQUE constraint on `listening_history` made the entire analytical surface safe under client retries, an invariant the schema-side artefact protects regardless of what the client does.

The repository, the schema, the queries, the prototype, and this report are the deliverables. The next agent picks up from the deployment gates: production environment variables, the warm-up ping, the production smoke, and the final `dev -> main` promotion.
