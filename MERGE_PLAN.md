# Statify P2 merged replacement package

This zip contains **Next.js-safe merged files**. It is not a raw Claude Design copy.

## Files that should be updated

### Shared/new files

- `apps/web/src/components/p2/P2Design.tsx` — new reusable P2 visual primitives.
- `apps/web/src/components/p2/index.ts` — barrel export.

### Navigation/shell

- `apps/web/src/components/navigation/AppShell.tsx` — update shell background/chrome, preserve `SectionProvider`, `AudioPlayer`, `PlayHistoryReporter`.
- `apps/web/src/components/navigation/TopNavigation.tsx` — visual update only, preserve `GlobalSearch`, `ThemeToggle`, `UserMenu`.
- `apps/web/src/components/navigation/SideNavigation.tsx` — visual update only, preserve existing nav item logic.

### Route files

- `apps/web/src/app/(app)/me/page.tsx`
- `apps/web/src/app/(app)/me/stats/page.tsx`
- `apps/web/src/app/(app)/me/stats/top-artists/page.tsx`
- `apps/web/src/app/(app)/me/stats/top-tracks/page.tsx`
- `apps/web/src/app/(app)/me/stats/heatmap/page.tsx`
- `apps/web/src/app/(app)/me/stats/trending/page.tsx`
- `apps/web/src/app/(app)/me/history/page.tsx`
- `apps/web/src/app/(app)/discover/page.tsx`
- `apps/web/src/app/(app)/explore/hidden-gems/page.tsx`
- `apps/web/src/app/(app)/me/playlists/page.tsx`
- `apps/web/src/app/(app)/community/playlists/page.tsx`
- `apps/web/src/app/(app)/catalog/page.tsx`
- `apps/web/src/app/(app)/catalog/tracks/page.tsx`

## Files intentionally NOT included

- `apps/web/src/app/globals.css` — the current app already has a large token system; replacing it would risk losing existing Tailwind tokens, motion utilities, state colors, and theme support. The package uses the existing token names instead.
- `apps/web/src/components/navigation/items.ts` — route data already matches the prototype closely; no functional change required.
- Login/signup/auth/middleware/API files — not touched.
- `apps/api/**` — not touched.

## Why raw zip files cannot replace real files

The Claude Design export contains prototype-only code: `window`, hash routing, `ReactDOM.createRoot`, direct demo data, and screen-local arrays. Existing Statify route files contain server components, `cookies()`, API clients, pagination, auth/session behavior, and metadata. Therefore, the correct strategy is merge visual structure into existing files, not direct replacement.

## Install/integrate later

From repo root:

```bash
unzip -o statify-p2-merged-replacement.zip -d .
pnpm --filter @statify/shared run build
pnpm --filter @statify/web run typecheck
git diff --stat
```

Then commit only if typecheck passes.
