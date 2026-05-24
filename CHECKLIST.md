# Statify, Master Checklist

> **Convention:** Aykhan drives every task. The "Commit author" column records which team member's identity the resulting commits are attributed to, not who does the work. Effort tags (S/M/L/XL) reflect approximate session time, not external workload distribution.

## Current State (updated every session)

- **Phase 4 status:** complete. Seed script and initial Prisma migration merged to `dev`.
- **Phase 5 status:** complete (M1-M8 all on `dev`).
- **Phase 6 status:** M1 ✓ (PR #28), M2 ✓ (PR #29), M3 ✓ (PR #30), M4 ✓ (`98ad518`), M5 ✓ (PR #32, `6ce01b3`), M6 ✓ (PR #33, `b9f3858`), M7 ✓ (PR #34, `871dd49`). Next milestone P6-M8 (forms system, aykhan). (Note: redesign is Phase 6; the existing "Deployment and submission" section stays unnumbered and is paused behind Phase 6.)
- **Current milestone:** P6-M8 Forms system. Wait for explicit green light before starting.
- **Last shipped:** P6-M7 Data display with real media. PR #34 rebase-merged into `dev` as `871dd49`. Catalog cards / rows / detail heroes render real `next/image` artwork from `image_url`; MPD playlist DTOs expose `coverImages` and the UI renders a 2x2 collage with letter-fallback; `<Cover>` primitive shared across catalog, search, home, me, and community surfaces; `/styleguide` gained the "Data display media" section.
- **Last maintenance fix:** Local API browser login now accepts CORS preflight from `http://localhost:3000` through the existing `ALLOWED_ORIGINS` config.
- **Open file/component:** none.
- **Locked decisions feeding Phase 6:**
  - Design direction: Vivid Workshop (picked 2026-05-24).
  - Entity media field shape: single nullable `image_url` on `tracks`, `albums`, `artists`. Recorded in ADR-002 during P6-M4.
  - Playlist media shape: list/detail DTOs expose `coverImages: string[]` derived from the first four member tracks' `track.imageUrl ?? album.imageUrl`; UI repeats fewer than four to fill the 2x2 collage and falls back to the playlist letter when none exist. Landed in P6-M7.
  - Motion library: `tailwindcss-animate`; `framer-motion` opt-in at P6-M11 only if required.
  - Webfonts: self-hosted via `next/font`; families locked in P6-M2 DESIGN.md.
  - Existing UI during Phase 6: destructively replaced as each P6 milestone lands.
- **Blocker:** none.
- **Next concrete action:** start P6-M8 (forms system, aykhan) on `feat/p6-m8-forms-system` off latest `dev` once green-lit; one PR into `dev`; rebase-merge.

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

## Phase 6, Frontend redesign (one PR per milestone into `dev`; sized for one focused session each)

The Phase 5 frontend works against the API but was built against the prior visual posture: single-hue accent on grayscale, no semantic token layer, no real entity imagery, no shared icon vocabulary. Phase 6 replaces that posture wholesale against a fully tokenized, multi-hue, identity-bearing system. Component-level work does not begin until M3 has shipped the token layer.

Milestones must ship in order. Each milestone is a single PR into `dev` on a `feat/p6-m<n>-<slug>` branch, per-task commits attributed via the "Commit author" column, merged with `gh pr merge <n> --rebase --delete-branch`.

Existing `(app)/**` components are destructively replaced as each Phase 6 milestone lands; the `dev` branch will show visual inconsistency between merged and unmerged surfaces during Phase 6. This is accepted.

- [x] **P6-M1: Design Direction Exploration** - S - aykhan
  - Goal: produce reference notes for five apps and three Statify direction proposals; surface a single pick.
  - Entry criteria: HANDOFF + CHECKLIST + ADR-001 read; design intent confirmed; roadmap approved.
  - Exit criteria: `docs/design/explorations.md` committed containing Step A (Linear, Vercel dashboard, Stripe dashboard, PostHog, Resend reference notes, 2-3 lines each covering typography character, color treatment, spacing density, separation strategy, vibe phrase) and Step B (three distinct named directions, each with feel paragraph, closest reference, sharpest tradeoff, imagery treatment, iconography treatment); Aykhan has picked one direction and the pick is recorded in HANDOFF.md Section 2.
  - Files and folders touched: `docs/design/explorations.md` (new), `HANDOFF.md` (decision recorded), `CHECKLIST.md` (this row ticked).
  - Depends on: none.

- [x] **P6-M2: Author DESIGN.md from locked direction** - M - aykhan
  - Goal: turn the locked direction into a complete token specification document at repo root.
  - Entry criteria: P6-M1 merged; direction picked.
  - Exit criteria: `DESIGN.md` committed at repo root specifying full color token set in oklch (semantic naming layer over raw palette, including data-viz palette of at least eight hues), type scale (font families with weight axis, size scale, line-height pairs, letter-spacing per role), spacing scale, radius scale, shadow scale, motion tokens (durations, easings, named transitions, all driven through `tailwindcss-animate` utilities), image aspect ratio scale with frame and overlay treatments and explicit fallback strategy when media fields are NULL, icon size scale with locked stroke weight and role mapping (inline / navigation / feature), and a one-screen "do / do not" section calling out the hard constraints from the design intent. ADR-002 drafted to record the deviation from ADR-001 §3.8 / §3.20 and the locked `image_url` schema decision.
  - Files and folders touched: `DESIGN.md` (new), `docs/adr/0002-design-system-and-token-layer.md` (new), `HANDOFF.md` (Structural Changes Log row, Documents Map updated).
  - Depends on: P6-M1.

- [x] **P6-M3: Token layer implementation + dependency install + `/styleguide` route** - L - rahila
  - Goal: encode every DESIGN.md token in CSS variables and the Tailwind 4 `@theme` block, install Lucide + shadcn/ui + Radix primitives + `tailwindcss-animate`, and ship a `/styleguide` route that renders every token visually for QA.
  - Entry criteria: P6-M2 merged; DESIGN.md tokens locked.
  - Exit criteria: `apps/web/src/app/globals.css` rewritten so every color, font, radius, spacing step, shadow, motion duration, easing, aspect ratio, and icon size exists as a CSS variable inside `@theme`; `lucide-react`, `@radix-ui/*`, shadcn/ui generator config, `tailwindcss-animate`, and the chosen self-hosted webfonts via `next/font` added to `apps/web/package.json` with the locked stroke weight enforced via a thin `<Icon>` wrapper; `/styleguide` route at `apps/web/src/app/styleguide/page.tsx` renders the color palette (raw + semantic), type scale (every role at every weight), spacing scale, radius scale, shadow scale, motion samples, image frame treatments at every aspect ratio (with a NULL-media fallback example wired to the real fallback), and the entire in-use icon set at all locked sizes; `pnpm lint`, `pnpm typecheck`, `pnpm build` pass; manual QA on `/styleguide` confirms every token is visible.
  - Files and folders touched: `apps/web/src/app/globals.css`, `apps/web/src/app/styleguide/page.tsx` (new), `apps/web/src/components/ui/` (Icon wrapper, base shadcn primitives copied in), `apps/web/src/lib/fonts.ts` (new), `apps/web/package.json`, `apps/web/components.json` (shadcn config, new), `HANDOFF.md` (Structural Changes Log rows for each dep).
  - Depends on: P6-M2.

- [x] **P6-M4: Media foundation (schema, adapter persistence, backfill)** - L - aykhan
  - Goal: make real entity imagery available from the Prisma layer so later surfaces can render `<Image>` against live URLs per the design intent.
  - Entry criteria: P6-M3 merged; DESIGN.md aspect ratio scale locked; ADR-002 records the `image_url`-column decision.
  - Exit criteria: Prisma migration adds `image_url` (text, nullable) to `tracks`, `albums`, `artists`; iTunes adapter at `apps/api/src/integrations/itunes/` persists the artwork URL on resolve alongside the existing `preview_url` write (using the `100x100bb.jpg` → `600x600bb.jpg` substitution at write time); backfill script at `packages/db/src/scripts/backfill-media.ts` populates existing rows by replaying iTunes lookups for tracks lacking `image_url`; albums inherit from the first ingested track's image; artist `image_url` stays null and the UI uses the DESIGN.md null-fallback; DTOs in `packages/shared` exposing `imageUrl` on the relevant entities; `apps/web/next.config.mjs` image domain allowlist updated for `is*-ssl.mzstatic.com`; unit tests for adapter persistence and backfill idempotency; `pnpm --filter @statify/db prisma migrate dev`, `pnpm --filter @statify/api test`, `pnpm typecheck`, `pnpm build` pass; HANDOFF Structural Changes Log row added.
  - Files and folders touched: `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/<timestamp>_entity_media/`, `packages/db/src/scripts/backfill-media.ts` (new), `apps/api/src/integrations/itunes/itunes.adapter.ts`, `apps/api/src/integrations/itunes/itunes.cache.ts`, `apps/api/src/modules/catalog/**` (DTO surface), `packages/shared/src/dto/**`, `apps/web/next.config.mjs`, `docs/adr/0002-design-system-and-token-layer.md` (schema decision section).
  - Depends on: P6-M3.

- [x] **P6-M5: Layout primitives + app shell rewrite** - M - rahila
  - Goal: replace ad-hoc layout JSX with token-bound primitives (Container, Stack, Grid, Section, Surface, Divider, Spacer) and rebuild the authed shell on top.
  - Entry criteria: P6-M3 merged.
  - Exit criteria: primitives under `apps/web/src/components/layout/` consume only token classes (no hard-coded px, hex, or font-family); existing `(app)/layout.tsx` re-implemented in terms of the primitives; container widths, gutters, and grid steps documented in DESIGN.md update; `/styleguide` route gains a "Primitives" section showing every primitive at every documented variant; lint / typecheck / build pass; manual smoke confirms every existing authed route still renders without layout regressions.
  - Files and folders touched: `apps/web/src/components/layout/**` (new), `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/app/styleguide/page.tsx`, `DESIGN.md` (primitives addendum).
  - Depends on: P6-M3.

- [x] **P6-M6: Navigation system** - L - rahila
  - Goal: rebuild top bar, side navigation, mobile navigation, breadcrumbs, and the user menu against the new token layer and the layout primitives.
  - Entry criteria: P6-M5 merged.
  - Exit criteria: nav components under `apps/web/src/components/navigation/` use only Lucide icons at the locked nav size and the semantic color tokens; active / hover / focus / disabled states defined in DESIGN.md and visible at `/styleguide`; mobile breakpoint behaviour documented; keyboard navigation through every nav surface verified manually; lint / typecheck / build pass.
  - Files and folders touched: `apps/web/src/components/navigation/**` (new), `apps/web/src/app/(app)/layout.tsx` (consumes nav), `DESIGN.md` (nav states addendum), `apps/web/src/app/styleguide/page.tsx`.
  - Depends on: P6-M5.

- [x] **P6-M7: Data display with real media (cards, lists, detail pages)** - L - rahila
  - Goal: rebuild Track, Artist, Album, and Playlist cards / list rows / detail headers to render `<Image>` from the Prisma `image_url` fields with the DESIGN.md aspect ratio and frame treatments.
  - Entry criteria: P6-M4 merged (media in DB) and P6-M6 merged (shell exists).
  - Exit criteria: components under `apps/web/src/components/{catalog,playlists}/` use `next/image` against live `imageUrl` fields from the API; aspect ratio, frame, and overlay match the DESIGN.md scale; explicit fallback variant renders when the field is NULL (the DESIGN.md null-fallback, no generic gradients, no placeholders); detail page hero treatments updated for Track / Artist / Album / Playlist; lint / typecheck / build pass; manual smoke on each list and detail route against seeded data confirms real artwork loads.
  - Files and folders touched: `apps/web/src/components/catalog/**`, `apps/web/src/components/playlists/**`, `apps/web/src/app/(app)/catalog/**`, `apps/web/src/app/(app)/playlists/**`, DESIGN.md (any media decisions discovered during build).
  - Depends on: P6-M4, P6-M6.

- [ ] **P6-M8: Forms system** - M - aykhan
  - Goal: rebuild every form (signup, login, password change, account deletion confirmation, playlist create / edit, admin user edit) on a token-bound RHF + Zod primitive set.
  - Entry criteria: P6-M3 merged.
  - Exit criteria: form primitives under `apps/web/src/components/forms/` (Field, Label, Input, Textarea, Select, Checkbox, Switch, FormError, FormHint, SubmitButton) wired to existing shared Zod schemas; error, focus, disabled, and loading states defined in DESIGN.md and visible at `/styleguide`; each existing form route re-implemented against the primitives; lint / typecheck / build pass; manual smoke of every form route confirms submission and validation paths still work.
  - Files and folders touched: `apps/web/src/components/forms/**` (new), `apps/web/src/components/auth/**`, `apps/web/src/components/playlists/**` (form-touching ones), `apps/web/src/components/admin/**` (form-touching ones), `DESIGN.md` (form states addendum), `apps/web/src/app/styleguide/page.tsx`.
  - Depends on: P6-M3.

- [ ] **P6-M9: Empty, loading, and error states pass** - M - rahila
  - Goal: design and ship a shared vocabulary for empty states, skeleton loaders, error surfaces, and not-found pages on top of every list, detail, and form route built so far.
  - Entry criteria: P6-M7 and P6-M8 merged.
  - Exit criteria: state primitives under `apps/web/src/components/states/` (Skeleton, EmptyState, ErrorState, NotFoundState) consume tokens only; every list and detail route in `(app)/**` wired to a skeleton during suspense, an empty state when the response is zero-length, an error state when the fetch fails, and a not-found state when the entity is missing; copy and icon choices documented in DESIGN.md; lint / typecheck / build pass; manual smoke triggers each state (throttle network for skeletons, force 404, force 500).
  - Files and folders touched: `apps/web/src/components/states/**` (new), every route file under `apps/web/src/app/(app)/**` that fetches, `DESIGN.md` (states addendum).
  - Depends on: P6-M7, P6-M8.

- [ ] **P6-M10: Analytics surfaces re-skin (Recharts against tokens)** - M - aykhan
  - Goal: re-skin every Recharts surface (top artists, top tracks, discover, heatmap, trending, hidden gems) against the locked token palette and motion tokens, including a shared chart wrapper that pulls axis / grid / tooltip / palette from CSS variables.
  - Entry criteria: P6-M3 merged; data-viz palette (at least eight hues) defined in DESIGN.md.
  - Exit criteria: a single chart theme module at `apps/web/src/components/charts/` reads axis, grid, tooltip, and series colors from CSS variables; every existing `stats/**` page wired through it with no inline hex; heatmap uses a documented multi-stop scale from the DESIGN.md data-viz palette; tooltip and legend treatments documented; lint / typecheck / build pass; manual smoke confirms charts render with the new palette and reflow on resize.
  - Files and folders touched: `apps/web/src/components/charts/**`, `apps/web/src/components/stats/**`, `apps/web/src/app/(app)/me/stats/**`, `DESIGN.md` (data-viz palette addendum).
  - Depends on: P6-M3.

- [ ] **P6-M11: Motion pass** - M - rahila
  - Goal: apply the DESIGN.md motion tokens across navigation, list mounts, modal / dialog open / close, hover and focus transitions, and player state changes; honour `prefers-reduced-motion`. `framer-motion` may be introduced here only if a specific surface needs layout / exit animation that `tailwindcss-animate` cannot deliver; recorded in HANDOFF Structural Changes Log if added.
  - Entry criteria: P6-M7, P6-M8, P6-M9, P6-M10 merged.
  - Exit criteria: every transition in the app references a named motion token (no inline durations, no inline easings); `prefers-reduced-motion: reduce` swaps to a no-motion variant globally; motion tokens visible on `/styleguide` with side-by-side reduce-motion preview; lint / typecheck / build pass; manual smoke of every authed route confirms transitions feel coherent and no surface flashes.
  - Files and folders touched: `apps/web/src/components/**` (transition wiring), `apps/web/src/app/globals.css` (reduce-motion override), `apps/web/src/app/styleguide/page.tsx`.
  - Depends on: P6-M7, P6-M8, P6-M9, P6-M10.

- [ ] **P6-M12: Accessibility pass** - M - aykhan
  - Goal: end-to-end a11y audit and fix pass against WCAG 2.2 AA on the redesigned surfaces.
  - Entry criteria: P6-M11 merged.
  - Exit criteria: `eslint-plugin-jsx-a11y` clean; semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`) verified on every layout; focus order keyboard-walked through every authed route; visible focus ring (from tokens) confirmed on every interactive element; color contrast checked for every semantic foreground / background pair documented in DESIGN.md and recorded in a contrast table at the bottom of DESIGN.md; screen-reader smoke (VoiceOver) on signup, login, search, track detail with preview play, playlist create, admin user edit; results recorded in `docs/design/a11y-audit.md`; lint / typecheck / build pass.
  - Files and folders touched: `apps/web/src/components/**` (fixes), `apps/web/src/app/**` (fixes), `DESIGN.md` (contrast table), `docs/design/a11y-audit.md` (new).
  - Depends on: P6-M11.

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
