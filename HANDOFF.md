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

**Updated:** 2026-05-23

- **Phase 4 status:** complete. All twelve foundation pieces (F1-F12) are shipped on `dev`. The deterministic dev seed script (Phase 5 rubric task) is also merged and runs via `pnpm --filter @statify/db db:seed`.
- **Last shipped:** M4 Indexes + search/filter 3/3. Catalog pg_trgm indexes and the partial preview index are added, grouped global search is exposed through `GET /api/v1/search`, the authenticated header has debounced catalog search, track lists support duration and preview filters, and sort controls are wired on tracks, artists, and albums. Genre/year filtering is deferred to later iTunes-derived data work and is not part of the completed M4 scope.
- **Phase 5 roadmap:** M1 ✓ → M2 (4/5) → M3 ✓ → M4 ✓ → **M5 Personal stats and analytics views (next)** → M6 Playlists → M7 Admin UI → M8 Rubric / quality demands. See `CHECKLIST.md` Phase 5 for the per-task breakdown and the milestone checkboxes.
- **Milestone cadence:** each milestone ships as one PR into `dev` (`feat/<milestone-slug>` branch, per-task commits with the correct author from `CHECKLIST.md`). Merge with `gh pr merge <n> --rebase --delete-branch` so the per-task commits are preserved on `dev`. Do not start the next milestone until the previous one is merged.
- **Current milestone:** M5 Personal stats and analytics views. Wait for explicit green light before starting.
- **Currently in progress:** none.
- **Open files/components:** none.
- **Open decisions:** none for the current milestone.
- **Open threads:**
  - M4 shipped with three implementation commits: `aykhan` for catalog search indexes, `eljan` for global search, and `rahila` for catalog filters/sort controls.
  - Global search ships as `GET /api/v1/search` with grouped track, artist, and album results. The authenticated app header has a debounced catalog search box.
  - Track list filters support duration range and preview availability. Genre and year controls are intentionally disabled because those fields do not exist in the approved schema; later iTunes-derived genre/year work must be added as a separate approved task.
  - Sort controls are wired on tracks, artists, and albums.
  - Local verification passed for format check, lint, typecheck, tests, production build, Prisma schema validation, and built web routes `/healthz`, `/login`, and `/catalog/tracks` unauthenticated redirect.
  - Full authenticated search/filter UI smoke was not completed locally because the API cannot start under local Node v26 due workspace package source-import resolution. The repo pins Node 22 in `.nvmrc`; use Node 22 for the next full local end-to-end smoke.
- **Blockers (gate further milestone work):** none.
- **Deployment gates:**
  1. **`dev` is ahead of `main`.** Per ADR-001 Section 3.15, `main` is only updated by PR from `dev`. Hold the dev → main promotion until Phase 6 deployment items (Render env vars, Vercel env vars, warm-up ping, smoke test) are unblocked.
- **Next concrete action:** Start M5 only after explicit green light. Branch from `dev` with `feat/personal-stats-analytics`, then implement the M5 rows in checklist order with the listed commit authors.
- **Follow-ups:**
  - Wire `AuditLogService.record(...)` into the login flow once additional privileged actions land. Password change and account deletion already audit-log via `AuthService`.
  - Genre/year filters and the M2 genres list/detail row are blocked on later iTunes-derived data from `primaryGenreName`. That derivation has no current task row; if either row needs to fully tick, add a Phase 5 row for it first.
  - The "play event" counts a play as soon as audio starts (one history row per track per session). If we later want a stricter rule (e.g., 50% played), update `PlayHistoryReporter` to fire from `onTimeUpdate` instead of on the playing transition.
- **Dry-run procedure (F11), once migrations exist:** download MPD slices to `data/mpd/` (gitignored), run `pnpm --filter @statify/db db:ingest -- --data-dir data/mpd --slices 10 --resume`. Inspect `ingest_checkpoints` for per-slice progress and any `error_message`. The 10k-playlist dry-run itself requires the dataset and is a manual verification step outside CI.
- **Watch list:**
  1. Verify commit attribution on GitHub for all four identities after the first push; if Elshad's or Rahila's `@ku.edu.tr`-authored commits do not link to their profiles, the email must be added at https://github.com/settings/emails on each account.
  2. Neon free tier is 0.5 GB; re-verify headroom after the first MPD ingest dry run.
  3. Render free service spins down after 15 min idle; set up cron-job.org warm ping after the first deploy.
  4. F8 (PR #9) was squash-merged by mistake instead of rebase-merged; all subsequent PRs (#10, #11, #12, #13, #14) used `--rebase --delete-branch` to preserve per-type commit history. Continue using `--rebase` for future merges to `dev`.

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

**Operational:**

- `README.md`, project overview and quickstart.
- `docs/onboarding.md`, clone-to-running in under 15 minutes. (TBD in Phase 4.)
- `docs/architecture.md`, narrative architecture summary with links to ADRs. (TBD in Phase 4.)
- `docs/api.md`, REST surface. (Generated from Swagger in Phase 4.)
- `docs/runbook.md`, recovery procedures. (TBD in Phase 4.)
- `docs/erd.dbml` and `docs/erd.png`, schema diagram. (TBD in Phase 4.)

**Decisions (append only):**

- `docs/adr/0001-tech-stack-and-foundation.md`
- `docs/adr/000N-...` future ADRs.

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
