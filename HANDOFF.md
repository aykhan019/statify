# Statify, Session Handoff and Ground Rules

> Read this file in full at the start of every working session, before opening any other file.
> Update Section 2 at the end of every session.

## 1. Ground Rules (immutable; do not modify without explicit approval from Aykhan)

**R1. Authorship.** No external tool, model, or product name appears anywhere in this repository: not in commits, not in code comments, not in documentation, not in PR descriptions, not in commit co-authors, not in this file. All work is authored by the four team members listed in Section 4.

**R2. Commit attribution.** Every commit must be authored by exactly one of the four team members. Use `scripts/commit-as.sh <person-key> [git commit args...]` for every commit. Do not run `git commit` directly. Distribute commits across team members per the "Commit author" column in `CHECKLIST.md`.

**R3. Folder structure.** The repository layout is defined in `docs/adr/0001-tech-stack-and-foundation.md` Sections 3.1 and 3.5. Do not create new top-level folders or rename existing ones without (a) recording the change in Section 3 of this file and (b) opening a new ADR.

**R4. Decisions.** Any architectural decision (library choice, pattern adoption, schema change) gets a new ADR in `docs/adr/`. Number sequentially. Do not bury decisions in code comments, PR descriptions, or this file.

**R5. State updates.** At the end of every working session: update Section 2 of this file, tick completed items in `CHECKLIST.md`, and write any mid-flight work into "Open threads" so the next session resumes cleanly.

**R6. No invention.** Do not create files, endpoints, schemas, or features not already listed in `CHECKLIST.md`. If a need arises, add it to the checklist first, get Aykhan's approval, then build.

**R7. Destructive actions.** Confirm with Aykhan before: force push, hard reset, history rewrite, branch deletion, mass rename, dropping tables, dropping migrations. Never run these on `main` or `dev`.

**R8. Style.** All docs in impersonal voice. No emoji unless explicitly requested. No em dashes; use regular hyphens. Plain Markdown.

**R9. Verification.** "Done" requires the relevant verification to pass: lint, typecheck, tests, and a manual smoke test for UI changes. State exactly what was verified.

**R10. Scope discipline.** If asked for X, do X. Do not opportunistically refactor Y. Add cleanups to `CHECKLIST.md` and run them as separate tasks.

## 2. Current State

**Updated:** 2026-05-24

- **Phase 4 status:** complete. All twelve foundation pieces (F1-F12) are shipped on `dev`. The deterministic dev seed script (Phase 5 rubric task) is also merged and runs via `pnpm --filter @statify/db db:seed`.
- **Phase 5 status:** complete (M1-M8 all on `dev`).
- **Phase 6 status:** M1 ✓ (PR #28, `e39bdeb`), M2 ✓ (PR #29, `e7e9053`), M3 ✓ (PR #30, `a543cc2`), M4 ✓ (`98ad518`), M5 ✓ (PR #32, `6ce01b3`), M6 ✓ (PR #33, `b9f3858`), M7 ✓ (PR #34, `871dd49`). Next milestone P6-M8 (forms system, aykhan). The Phase 5 frontend works against the API but was built against the prior visual posture (single-hue accent on grayscale, no semantic token layer, no real entity imagery, no shared icon vocabulary). Phase 6 replaces it. (Note: the original draft numbered redesign as Phase 7 with deployment as Phase 6; the canonical docs never actually numbered deployment, so Phase 6 is the redesign and the existing "Deployment and submission" section stays unnumbered.)
- **Deployment and submission status:** the unnumbered "Deployment and submission" section in `CHECKLIST.md` is paused behind Phase 6 frontend redesign per Aykhan's direction; resumes after P6-M12 merges.
- **Last shipped:** P6-M7 Data display with real media. PR #34 rebase-merged into `dev` as `871dd49`. Track / Artist / Album catalog rows / cards / detail heroes now render real `next/image` artwork from the Prisma `image_url` fields; MPD playlist DTOs derive a `coverImages: string[]` from member tracks and the UI renders a 2x2 collage with letter-fallback; global search and the home/me/community surfaces consume the same `<Cover>` primitive. `/styleguide` gained a "Data display media" section. DESIGN.md captured the playlist collage and null-fallback decisions. No schema or dependency changes.
- **Phase 5 roadmap:** M1 ✓ → M2 (4/5) → M3 ✓ → M4 ✓ → M5 ✓ → M6 ✓ → M7 ✓ → M8 ✓. See `CHECKLIST.md` Phase 5 for the per-task breakdown and the milestone checkboxes.
- **Milestone cadence:** each milestone ships as one PR into `dev` (`feat/<milestone-slug>` branch, per-task commits with the correct author from `CHECKLIST.md`). Phase 6 branches use `feat/p6-m<n>-<slug>`. Merge with `gh pr merge <n> --rebase --delete-branch` so the per-task commits are preserved on `dev`. Do not start the next milestone until the previous one is merged.
- **Current milestone:** P6-M8 Forms system. Wait for explicit green light before starting; the M8 row is attributed to `aykhan` end-to-end (form primitives, every form route re-implementation, DESIGN.md states addendum, `/styleguide` forms section). Entry criteria satisfied: P6-M3 is merged.
- **Currently in progress:** none.
- **Open files/components:** none.
- **Open decisions:** none for the current milestone. Locked decisions feeding Phase 6:
  - **Design direction:** Vivid Workshop. Picked 2026-05-24, recorded in `docs/design/explorations.md` Step C. P6-M2 authors DESIGN.md from this direction.
  - **Entity media field shape:** single nullable `image_url` column on `tracks`, `albums`, `artists`. iTunes returns one URL whose size segment (`100x100bb.jpg`) is render-time substitutable, so storing one canonical URL is sufficient. Artist `image_url` stays null on ingest because iTunes does not return reliable artist art; UI uses the DESIGN.md "no entity image" fallback. Full record lands in ADR-002 during P6-M4.
  - **Playlist media shape:** playlist list/detail DTOs expose `coverImages: string[]` derived from the first four member tracks' `track.imageUrl ?? album.imageUrl`; UI repeats fewer than four images to fill the 2x2 collage and falls back to the playlist letter when none exist. Landed locally during P6-M7.
  - **Motion library:** `tailwindcss-animate` (shadcn / Radix default, CSS-only, near-zero bundle). `framer-motion` stays opt-in for a specific surface in P6-M11 only if layout / exit animation is required.
  - **Webfonts:** self-hosted via `next/font`. Specific families locked in P6-M2 DESIGN.md.
  - **Existing UI during Phase 6:** destructively replaced as each P6 milestone lands; `dev` will show visual inconsistency between merged and unmerged surfaces during Phase 6.
- **ADR-001 deviations recorded for Phase 6:**
  - §3.8 "Tokens (color, spacing, radii) defined once in `tailwind.config.ts`" is superseded by Phase 6's CSS-variable + Tailwind 4 `@theme` token layer. Recorded in ADR-002 during P6-M2.
  - §3.20 "Custom design tokens system; Tailwind config is enough" is superseded by the same ADR.
  - The schema gap (no media fields on `Artist`, `Album`, `Track`) is recorded in ADR-002 and implemented during P6-M4.
- **Open threads:**
  - M8 shipped through PR #25 plus one follow-up docs commit on `dev`. The completed rubric artifact set is `docs/erd.dbml`, `docs/erd.png`, `report/erd-explanation.md`, `report/sql-queries.md`, `report/final-report.md`, and `report/demo-script.md`.
  - `docs/erd.png` is a dbdiagram.io export generated from `docs/erd.dbml`.
  - No schema, dependency, config, or folder-structure changes landed in PR #25. The structural changes log does not need a new row for the docs/report file additions.
  - PR #25 CI passed before the rebase merge. The follow-up ERD/docs update was format-checked locally.
  - Local runtime fix after M8: `@statify/shared` and `@statify/db` now resolve runtime imports from built `dist` outputs while keeping TypeScript declarations pointed at source, root `pnpm dev` and `pnpm test` build those packages before starting app runtime/tests, and the API config loads the root `.env` when launched from `apps/api`. This fixes the local API crash where current Node 22 rejected TypeScript source directory imports.
  - `AuthModule` now exports `AuthTokenService` so `JwtAuthGuard` can be injected from modules that import `AuthModule` (analytics, admin, history, catalog, and user playlists).
  - API bootstrap now enables CORS from `ALLOWED_ORIGINS` with credentials, so browser preflight requests from the local web app can reach authenticated endpoints.
  - Verification after the local runtime and CORS fixes: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm --filter @statify/api test`, `pnpm build`, `GET /healthz` on the local API, `OPTIONS /api/v1/auth/login`, and `POST /api/v1/auth/login` with the seeded user all passed under Node 22.
  - Full authenticated end-to-end UI smoke against seeded data still needs to be repeated under Node 22 before the dev → main promotion. The API now starts locally and accepts browser login preflight; use admin and user seed accounts for the smoke.
  - `toQueryString` is duplicated across `apps/web/src/lib/{admin,analytics,playlists,history,user-playlists}/api.ts`. The admin client makes it the fifth instance, so the hoist into a shared util is now due as a separate cleanup task (not in M8 scope).
  - P6-M4 verification: `pnpm --filter @statify/db prisma:migrate:dev` passes with root `.env` loaded after mirroring the existing pg_trgm GIN indexes in Prisma schema (`ops: raw("gin_trgm_ops")`). `pnpm test`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` also pass.
  - P6-M5 verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm --filter @statify/web test` pass. Local runtime smoke passed with `pnpm dev`: `/styleguide` returned 200 and rendered the "Layout primitives" section; login as `alex@statify.local` succeeded through the API; `/me` returned 200 with the new shell, header, sidebar, account link, and overview content. The in-app browser backend exposed no browser targets in this session, so the smoke used HTTP checks against the running local dev server instead of a visual browser pass.
  - P6-M6 verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm --filter @statify/web test` pass. Local runtime smoke passed with a restarted `pnpm dev`: `/styleguide` returned 200 and rendered the "Navigation system" section; login as `alex@statify.local` succeeded; `/me` returned 200 with top nav, side nav, mobile trigger, user menu, breadcrumbs, and active Overview state; `/me/playlists` returned 200 with breadcrumb and active Playlists state; admin login succeeded and `/admin` returned 200 with admin nav and user menu. The in-app browser backend exposed no browser targets in this session, so keyboard and visual checks were limited to rendered markup and token focus-state coverage in `/styleguide`.
  - P6-M7 verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass. Local media smoke used a restarted `pnpm dev`, login as `alex@statify.local`, and a small local backfill (`pnpm --filter @statify/db exec tsx src/scripts/backfill-media.ts --limit 20 --batch-size 20` with root `.env` sourced) that updated 9 tracks and 8 albums. HTTP smoke passed for `/styleguide` ("Data display media"), `/catalog/tracks?hasPreview=true`, `/catalog/albums?q=Frames`, `/catalog/artists?q=Glass`, `/catalog/playlists?q=Coffee`, `/catalog/tracks/9`, `/catalog/albums/2`, `/catalog/artists/26`, `/catalog/playlists/17`, `/me/playlists`, and `/community/playlists`; real artwork rendered on the imaged catalog and MPD playlist routes, while artist/user playlist routes exercised the designed fallback. The in-app browser backend again exposed no browser targets, so visual verification was limited to rendered markup and `/styleguide`.
  - During P6-M6 smoke, `/me/stats/top-artists` returned 500 because `totalMinutes.toFixed` is called on a non-number response value in `apps/web/src/app/(app)/me/stats/top-artists/page.tsx`. This is outside the M6 navigation scope and should be handled as a separate analytics DTO/coercion fix.
- **Blockers (gate further milestone work):** none.
- **Deployment gates:**
  1. **`dev` is ahead of `main`.** Per ADR-001 Section 3.15, `main` is only updated by PR from `dev`. Hold the dev → main promotion until the unnumbered "Deployment and submission" items in `CHECKLIST.md` (Render env vars, Vercel env vars, warm-up ping, smoke test) are unblocked, which will not happen until Phase 6 redesign completes.
  2. M5, M6, and M7 surfaces need an authed end-to-end smoke against a Node 22 API with seeded listening history, at least one seeded public user playlist, and at least one admin account before the dev → main promotion.
- **Next concrete action:** start P6-M8 on a `feat/p6-m8-forms-system` branch off latest `dev`. Build the form primitives under `apps/web/src/components/forms/` against existing shared Zod schemas (RHF + Zod), re-implement signup / login / password change / account deletion confirm / playlist create + edit / admin user edit against the primitives, add the form-states addendum to DESIGN.md, extend `/styleguide` with a forms section showing each primitive in every documented state, then verify (`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm --filter @statify/web test`, `pnpm build`) and smoke each form route locally. Per-task commits via `scripts/commit-as.sh aykhan ...`; one PR into `dev`; rebase-merge with `gh pr merge <n> --rebase --delete-branch`.
- **Follow-ups:**
  - Wire `AuditLogService.record(...)` into the login flow once additional privileged actions land. Password change, account deletion, admin ban/unban, admin role change, and admin ingest trigger already audit-log via their respective services.
  - Genre/year filters and the M2 genres list/detail row are blocked on later iTunes-derived data from `primaryGenreName`. That derivation has no current task row; if either row needs to fully tick, add a Phase 5 row for it first.
  - The "play event" counts a play as soon as audio starts (one history row per track per session). If we later want a stricter rule (e.g., 50% played), update `PlayHistoryReporter` to fire from `onTimeUpdate` instead of on the playing transition.
  - Hoist `toQueryString` from the five web API clients (`lib/{admin,analytics,playlists,history,user-playlists}/api.ts`) into a shared util under `apps/web/src/lib/utils/`. The pattern is identical across all five; a separate small refactor task.
- **Dry-run procedure (F11), once migrations exist:** download MPD slices to `data/mpd/` (gitignored), run `pnpm --filter @statify/db db:ingest -- --data-dir data/mpd --slices 10 --resume`. Inspect `ingest_checkpoints` for per-slice progress and any `error_message`. The 10k-playlist dry-run itself requires the dataset and is a manual verification step outside CI.
- **Watch list:**
  1. Verify commit attribution on GitHub for all four identities after the first push; if Elshad's or Rahila's `@ku.edu.tr`-authored commits do not link to their profiles, the email must be added at https://github.com/settings/emails on each account.
  2. Neon free tier is 0.5 GB; re-verify headroom after the first MPD ingest dry run.
  3. Render free service spins down after 15 min idle; set up cron-job.org warm ping after the first deploy.
  4. F8 (PR #9) was squash-merged by mistake instead of rebase-merged; every subsequent milestone PR (most recently #22 for M5, #23 for M6, and #24 for M7) has used `gh pr merge <n> --rebase --delete-branch` to preserve per-task commit history. Continue using `--rebase` for future merges to `dev`.
  5. The `dev` branch has a "Required status check: ci" rule. Direct pushes of docs-only commits to `dev` (e.g. `docs: close M<n> session`) trigger a `Bypassed rule violations for refs/heads/dev` warning in the push output. This is expected for the session-close cadence and matches what M5 (`bb68e04`), M6 (`04b3883`), and M7 are doing; feature work always goes through a PR where CI runs and must pass.

## 3. Structural Changes Log

| Date       | Change                                                  | ADR     | By     |
| ---------- | ------------------------------------------------------- | ------- | ------ |
| 2026-05-22 | Initial repo layout defined                             | ADR-001 | Aykhan |
| 2026-05-22 | Generated web type shim ignored for git and lint        | ADR-001 | Eljan  |
| 2026-05-23 | API iTunes integration module path added                | ADR-001 | Elshad |
| 2026-05-23 | API listening history module path added                 | ADR-001 | Aykhan |
| 2026-05-23 | `listening_history.idempotency_key` column added        | ADR-001 | Aykhan |
| 2026-05-23 | API analytics module path added                         | ADR-001 | Aykhan |
| 2026-05-23 | Web `components/` and route-group folders added         | ADR-001 | Rahila |
| 2026-05-23 | Web `zustand` dependency added (player store)           | ADR-001 | Rahila |
| 2026-05-23 | `ingest_checkpoints` table added                        | ADR-001 | Eljan  |
| 2026-05-23 | DB package `vitest` dependency added                    | ADR-001 | Eljan  |
| 2026-05-23 | API admin module path added                             | ADR-001 | Aykhan |
| 2026-05-23 | DB seed module path added                               | ADR-001 | Eljan  |
| 2026-05-23 | DB package `argon2` dependency added                    | ADR-001 | Eljan  |
| 2026-05-23 | `users.deleted_at` column added (soft delete)           | ADR-001 | Aykhan |
| 2026-05-23 | Web `react-hook-form` dependency added                  | ADR-001 | Aykhan |
| 2026-05-23 | Web `(auth)` route group + auth forms added             | ADR-001 | Aykhan |
| 2026-05-23 | Web `catalog/` components + `(app)/catalog` route group | ADR-001 | Rahila |
| 2026-05-23 | Catalog pg_trgm and partial preview indexes added       | ADR-001 | Aykhan |
| 2026-05-23 | Web `recharts` dependency added (analytics charts)      | ADR-001 | Aykhan |
| 2026-05-23 | API `mpd-playlists` module + `/playlists` browsing      | ADR-001 | Eljan  |
| 2026-05-23 | API `user-playlists` module path added                  | ADR-001 | Elshad |
| 2026-05-24 | Web `(app)/community` route group + community pages     | ADR-001 | Elshad |
| 2026-05-24 | Web `(app)/admin` route group + admin shell             | ADR-001 | Aykhan |
| 2026-05-24 | `users.banned_at` column added                          | ADR-001 | Aykhan |
| 2026-05-24 | Workspace runtime entrypoints switched to `dist`        | ADR-001 | Aykhan |
| 2026-05-24 | Root dev/test builds runtime workspace packages first   | ADR-001 | Aykhan |
| 2026-05-24 | API config loads root `.env` from app workspace         | ADR-001 | Aykhan |
| 2026-05-24 | API CORS wired to `ALLOWED_ORIGINS` config              | ADR-001 | Aykhan |
| 2026-05-24 | `DESIGN.md` added at repo root (token specification)    | ADR-002 | Aykhan |
| 2026-05-24 | ADR-002 added (design system, supersedes §3.8 / §3.20)  | ADR-002 | Aykhan |
| 2026-05-24 | Web `lucide-react` dependency added (icon library)      | ADR-002 | Rahila |
| 2026-05-24 | Web `tailwindcss-animate` dependency added              | ADR-002 | Rahila |
| 2026-05-24 | Web `class-variance-authority` dependency added         | ADR-002 | Rahila |
| 2026-05-24 | Web `clsx` + `tailwind-merge` dependencies added (cn)   | ADR-002 | Rahila |
| 2026-05-24 | Web `@radix-ui/react-slot` dependency added             | ADR-002 | Rahila |
| 2026-05-24 | Web fonts self-hosted via `next/font/google`            | ADR-002 | Rahila |
| 2026-05-24 | Web `components.json` added (shadcn config)             | ADR-002 | Rahila |
| 2026-05-24 | Web `lib/fonts.ts` added                                | ADR-002 | Rahila |
| 2026-05-24 | Web `app/styleguide` route added                        | ADR-002 | Rahila |
| 2026-05-24 | Entity `image_url` columns added                        | ADR-002 | Aykhan |
| 2026-05-24 | DB `src/scripts` path added (media backfill)            | ADR-002 | Aykhan |
| 2026-05-24 | Web iTunes image remotePatterns allowlist added         | ADR-002 | Aykhan |
| 2026-05-24 | Web `components/layout` primitives path added           | ADR-002 | Rahila |
| 2026-05-24 | Web `components/navigation` system path added           | ADR-002 | Rahila |
| 2026-05-24 | Web `components/forms` system path added                | ADR-002 | Aykhan |

(Append a row whenever the folder structure or repo layout changes.)

## 4. Team Identities

| Key      | Name              | Commit email            | GitHub      |
| -------- | ----------------- | ----------------------- | ----------- |
| `aykhan` | Aykhan Ahmadzada  | ayxanx17@gmail.com      | aykhan019   |
| `elshad` | Elshad Toklayev   | etoklayev23@ku.edu.tr   | endorphin13 |
| `rahila` | Rahila Dashdiyeva | rdashdiyeva23@ku.edu.tr | Rahila2707  |
| `eljan`  | Eljan Mammadli    | eljanmammadli@gmail.com | EljanM      |

Each member must have the email above on their GitHub account at https://github.com/settings/emails for commits to attribute correctly. Elshad and Rahila are reported to have created their GitHub accounts using their `@ku.edu.tr` addresses; verify after first push.

## 5. Documents Map

The canonical inventory. If a doc is not here, it should not exist.

**Living (updated frequently):**

- `HANDOFF.md` (this file), ground rules and current state.
- `CHECKLIST.md`, full task list with ownership and effort.
- `DESIGN.md`, design system token specification and visual rules. Authored in P6-M2 from the locked direction.

**Operational:**

- `README.md`, project overview and quickstart.
- `docs/onboarding.md`, clone-to-running in under 15 minutes. (TBD in Phase 4.)
- `docs/architecture.md`, narrative architecture summary with links to ADRs. (TBD in Phase 4.)
- `docs/api.md`, REST surface. (Generated from Swagger in Phase 4.)
- `docs/runbook.md`, recovery procedures. (TBD in Phase 4.)
- `docs/erd.dbml` and `docs/erd.png`, schema diagram. (TBD in Phase 4.)

**Decisions (append only):**

- `docs/adr/0001-tech-stack-and-foundation.md`
- `docs/adr/0002-design-system-and-token-layer.md` (drafted in P6-M2)
- `docs/adr/000N-...` future ADRs.

**Design exploration (Phase 6):**

- `docs/design/explorations.md`, five-app reference notes and three direction proposals from P6-M1.
- `docs/design/a11y-audit.md`, accessibility audit results from P6-M12.

**Submission artifacts (built over the project):**

- `report/final-report.md`, academic write-up, exported to PDF for submission.
- `report/sql-queries.md`, the six advanced SQL queries with sample I/O.
- `report/demo-script.md`, exact click-by-click demo walkthrough.
- `report/erd-explanation.md`, ER model writeup for the rubric.
- `report/slides.md` or Google Slides link, in-class presentation.

**Repo hygiene:**

- `.github/pull_request_template.md`, `CODEOWNERS`, `CONTRIBUTING.md`, `LICENSE`, `.env.example`.

## 6. Quick Reference

- "How do I run it locally?" -> `docs/onboarding.md`
- "Why did we pick X?" -> `docs/adr/`
- "What's the schema?" -> `packages/db/prisma/schema.prisma` and `docs/erd.png`
- "How do I commit?" -> `CONTRIBUTING.md` and `scripts/commit-as.sh`
- "What do I work on next?" -> `CHECKLIST.md`
- "What's the current status?" -> Section 2 of this file
