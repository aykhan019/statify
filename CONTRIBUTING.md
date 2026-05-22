# Contributing to Statify

This document is the operating manual for the four team members working on Statify.

## Read first

- `HANDOFF.md`, ground rules and current state.
- `CHECKLIST.md`, the master task list. Pick from here; do not invent tasks.
- `docs/adr/`, architectural decisions and rationale.

## Branching

- `main`, protected. Only merged from `dev` via PR. CI must be green.
- `dev`, integration branch. Protected. CI must be green.
- Feature branches: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`, `docs/<short-desc>`, `refactor/<short-desc>`, `test/<short-desc>`. Branched from `dev`, merged back via PR.
- Hotfixes: branched from `main`, merged into `main` and back-merged into `dev`.

## Commits

All commits must be authored using `scripts/commit-as.sh`. Do not run `git commit` directly.

```bash
# Stage your changes first
git add <files>

# Then commit through the wrapper
scripts/commit-as.sh aykhan -m "feat(auth): add Argon2id password hashing"
scripts/commit-as.sh elshad -m "chore(ci): bump action versions"
scripts/commit-as.sh rahila -m "feat(web): add empty Track list page"
scripts/commit-as.sh eljan  -m "feat(api): add /healthz endpoint"
```

The wrapper reads `scripts/.authors` and sets the commit author and committer environment variables for that single `git commit` call. It does not modify your global git config.

### Commit message format

Conventional Commits, enforced by commitlint in the `commit-msg` hook.

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`.

Scope examples: `auth`, `api`, `web`, `db`, `shared`, `ci`, `docs`.

Subject: imperative mood, lower case, no trailing period, under 72 chars.

### Forbidden

- No mention of external tools, models, or AI products in commit messages, code comments, PR bodies, or any artifact in this repository. (See `HANDOFF.md` Rule 1.)
- No `Co-Authored-By:` trailers.
- No raw `git commit`; use the wrapper.

## Pull Requests

- Open against `dev` for features and fixes.
- Use the PR template (`.github/pull_request_template.md`).
- Include a screenshot or short clip for any UI change.
- Note DB migrations explicitly: a PR that adds a Prisma migration must list it.
- CI must pass.
- Aykhan reviews and merges to `dev`. Merges to `main` are batched on release boundaries.

## Code standards

- TypeScript strict mode everywhere.
- ESLint and Prettier are enforced; CI fails on lint errors.
- File size soft cap: 300 lines. Hard cap: 500.
- Cyclomatic complexity per function: max 10.
- Naming: PascalCase for types and React components, camelCase for variables and functions, SCREAMING_SNAKE_CASE for constants, kebab-case for files except React components (PascalCase.tsx).
- No `process.env.X` access outside the config module.

## Testing

- Unit tests: Vitest. Pure functions and services with mocked repositories.
- Integration tests: Vitest + Testcontainers, real Postgres.
- API end-to-end: Vitest + Supertest, full Nest app, real DB.
- Frontend end-to-end: Playwright, smoke suite on `main` and on `dev` PRs labelled `e2e`.

## Security

- Never commit secrets. Use `.env.local` for personal overrides; it is gitignored.
- Validate every controller input through Zod.
- Use Prisma's parameterized queries. Raw queries use the `$queryRaw` tag, never `$queryRawUnsafe`.

## Updating the handoff

Before ending a working session:

1. Update `HANDOFF.md` Section 2 (Current State).
2. Tick completed items in `CHECKLIST.md`.
3. If anything was left mid-flight, write it under "Open threads" in `HANDOFF.md`.
4. Commit those updates.
