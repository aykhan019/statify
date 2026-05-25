# P6-M13 Accessibility Audit

Date: 2026-05-25

Scope: redesigned authenticated app routes, logged-out auth routes, global search, track preview playback, playlist creation, and admin user management.

## Automated Checks

- JSX accessibility rules pass with zero warnings after enabling the root accessibility lint rules.
- Semantic route sweep confirmed a single `main` landmark on every checked route. Auth pages expose one centered `main`; authenticated routes expose the app shell navigation plus one `main` region and, where present, the sidebar `aside`.
- Table semantics were checked on admin users, audit log, and ingest checkpoints. Each table now has a caption, column headers use `scope="col"`, and data rows expose row headers with `scope="row"`.
- DESIGN.md now records the semantic foreground/background contrast table. Required text pairs meet WCAG 2.2 AA; `--fg-faint` is documented as disabled / placeholder-only.

## Manual Smoke

- Signup: `h1` is `Create your account`; Display name, Email, and Password labels are associated with their inputs; submit control is named `Create account`.
- Login: `h1` is `Welcome back`; Email and Password labels are associated with their inputs; submit control is named `Sign in`; seeded admin login redirects to `/me`.
- Global search: typing `day` opens a `Search results` region, links it through `aria-controls`, sets `aria-expanded="true"`, and returns four results.
- Track detail with preview: `/catalog/tracks/9` exposes `Library` as the section `h1`, `Even Tide` as the detail `h2`, an `Audio preview player` region, labeled seek / volume ranges with value text, and a named mute button.
- Playlist create: `/me/playlists/new` accepts keyboard-entered text and creates a playlist, redirecting to the new detail route.
- Admin users: the user table exposes the `Admin user search results` caption, scoped headers, row headers, and target-specific action names such as `Make Alex admin` and `Ban Alex`.
- Keyboard route walk covered Overview, Account, History, Playlists, Playlist create, Stats overview, Top artists, Top tracks, Heatmap, Trending, Catalog list/detail routes, Community playlists, Discover, Hidden gems, and Admin routes. No app-owned focus target missed the visible focus indicator. One development-only portal outside the app root was ignored.

## Fixes Landed

- Section block and accent aliases now use contrast-safe hue steps for direct text-on-fill usage while cover frames and chart series keep the 500 step.
- Repeated admin action buttons now include the target user's display name in their accessible names.
- Global search now links the input and result panel, announces status/error messages, and preserves visible focus on result links.
- Audio preview range controls now expose value text and token-backed focus rings.
- The heatmap has an image role with a summary of the peak cell or empty state.
- Browser mutation smoke required the API CORS allowlist to include the shared CSRF request header; this unblocks playlist creation and other CSRF-protected browser mutations during local smoke.
