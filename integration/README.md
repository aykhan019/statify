# Statify · Visual integration package

Two complete visual upgrades in this drop, sharing a logo + visual language:

1. **Auth route** (`(auth)/login`, `(auth)/signup`) — split shell with brand
   panel + animated background, your existing forms untouched.
2. **Marketing landing page** (`(marketing)/page.tsx`) — full redesign with
   hero, stats strip, features, live-SQL stack panel, demo path, about, CTA.

Both routes share the same `StatifyLogo` mark and the same merged
spectrum + mosaic background flavour, so the brand reads continuously
from the landing page through sign-up.

---

## Files

### Shared

| File                                            | Action  |
| ----------------------------------------------- | ------- |
| `apps/web/public/brand/statify-logo.svg`        | **new** |
| `apps/web/src/components/brand/StatifyLogo.tsx` | **new** |

### Auth (`(auth)` route)

| File                                                            | Action                            |
| --------------------------------------------------------------- | --------------------------------- |
| `apps/web/src/components/auth/AuthBackground.tsx`               | **new** — constellation (default) |
| `apps/web/src/components/auth/AuthBackgroundSpectrumMosaic.tsx` | **new** — merged variant          |
| `apps/web/src/components/auth/AuthBrandPanel.tsx`               | **new**                           |
| `apps/web/src/app/(auth)/layout.tsx`                            | **replace**                       |
| `apps/web/src/app/(auth)/login/page.tsx`                        | leave alone                       |
| `apps/web/src/app/(auth)/signup/page.tsx`                       | leave alone                       |
| `apps/web/src/components/auth/LoginForm.tsx`, `SignupForm.tsx`  | leave alone                       |

### Marketing (`/` landing page)

| File                                                   | Action                                              |
| ------------------------------------------------------ | --------------------------------------------------- |
| `apps/web/src/components/marketing/HeroBackground.tsx` | **new**                                             |
| `apps/web/src/components/marketing/HeroPreview.tsx`    | **new**                                             |
| `apps/web/src/components/marketing/Hero.tsx`           | **new**                                             |
| `apps/web/src/components/marketing/StatsStrip.tsx`     | **new**                                             |
| `apps/web/src/components/marketing/Features.tsx`       | **new**                                             |
| `apps/web/src/components/marketing/Stack.tsx`          | **new**                                             |
| `apps/web/src/components/marketing/Demo.tsx`           | **new**                                             |
| `apps/web/src/components/marketing/About.tsx`          | **new**                                             |
| `apps/web/src/components/marketing/CTA.tsx`            | **new**                                             |
| `apps/web/src/app/(marketing)/page.tsx`                | **replace**                                         |
| `apps/web/src/app/(marketing)/layout.tsx`              | leave alone — your `<Header>` still sits at the top |

The two routes are connected by:

- The same `StatifyLogo` component (anywhere a brand mark appears).
- Hero buttons `Start listening` → `/signup` and `Log in` → `/login` (the existing route paths).
- The CTA section's `Create your account` + `Log in` buttons (same routes).
- `data-section-hue="indigo"` on both root containers so focus rings,
  hover tints, and accent text colors render the same identity.

---

## Integration steps

```bash
# From repo root
unzip integration.zip                       # if downloaded as zip
# (or: drag the integration/ folder into the repo root)

# Copy shared brand assets
mkdir -p apps/web/public/brand
cp integration/apps/web/public/brand/statify-logo.svg \
   apps/web/public/brand/

mkdir -p apps/web/src/components/brand
cp integration/apps/web/src/components/brand/StatifyLogo.tsx \
   apps/web/src/components/brand/

# Auth route
cp integration/apps/web/src/components/auth/AuthBackground.tsx \
   integration/apps/web/src/components/auth/AuthBackgroundSpectrumMosaic.tsx \
   integration/apps/web/src/components/auth/AuthBrandPanel.tsx \
   apps/web/src/components/auth/
cp integration/apps/web/src/app/\(auth\)/layout.tsx \
   apps/web/src/app/\(auth\)/layout.tsx

# Marketing landing
mkdir -p apps/web/src/components/marketing
cp integration/apps/web/src/components/marketing/*.tsx \
   apps/web/src/components/marketing/
cp integration/apps/web/src/app/\(marketing\)/page.tsx \
   apps/web/src/app/\(marketing\)/page.tsx

# Verify
pnpm --filter @statify/web lint
pnpm --filter @statify/web typecheck
pnpm --filter @statify/web dev
# Visit:
#   http://localhost:3000/         → new landing page
#   http://localhost:3000/login    → new auth shell
#   http://localhost:3000/signup   → new auth shell
```

Open one PR per route or one combined PR — both are fully self-contained.

---

## Swapping the auth background

```ts
// apps/web/src/app/(auth)/layout.tsx

// Constellation (default — calm, technical):
import { AuthBackground } from '@/components/auth/AuthBackground';

// Merged spectrum + album mosaic (matches the landing page hero):
import { AuthBackgroundSpectrumMosaic as AuthBackground } from '@/components/auth/AuthBackgroundSpectrumMosaic';
```

Recommended: ship the **merged variant** on the auth route so the brand reads
continuously from the landing page hero through to sign-up.

---

## Design decisions worth knowing

1. **No hex anywhere.** Everything routes through your existing tokens
   (`--color-indigo-500`, `--surface-page`, `--fg-on-block`, …). Light/dark
   modes and any future per-route `data-section-hue` overrides keep working.

2. **No new dependencies.** Pure React + Tailwind + token vars + lucide
   (already in your `package.json`). No framer-motion, no canvas libs.

3. **SSR-safe.** Constellation and tile-mosaic generators are deterministic
   so server and client render identical markup. No hydration warnings.

4. **`prefers-reduced-motion` respected.** Animated tiles, bars, and glow
   blobs are gated behind `motion-reduce:hidden` / `motion-reduce:!animate-none`.

5. **Card stays where it is.** Your auth `<Card>` from `Card.tsx` already
   uses `bg-surface-raised` — on the dark backdrop it reads as a floating
   panel without any rework. The `LoginForm` / `SignupForm` components,
   their zod resolvers, and `loginUser` / `registerUser` are untouched.

6. **Marketing nav anchors preserved.** The new landing keeps `#home`,
   `#features`, `#stack`, `#demo`, `#about` so the layout's existing nav
   keeps working unchanged.

7. **No marketing layout changes needed.** Your `Header` component still
   sits at the top of the marketing layout. The new hero starts immediately
   below it on a dark surface — works fine with a light `Header`. If you'd
   prefer the header to float transparently over the hero, that's a small
   `Header.tsx` change, ping me.

---

## What I did NOT touch

- `apps/web/src/components/forms/*` — your Field/Input/SubmitButton system.
- `apps/web/src/components/auth/LoginForm.tsx`, `SignupForm.tsx` — react-hook-form, zod, API client.
- `apps/web/src/app/(auth)/login/page.tsx`, `signup/page.tsx` — Card chrome + cross-mode links.
- `apps/web/src/app/(marketing)/layout.tsx` — your existing `Header` is reused.
- `apps/web/src/app/globals.css` — no new tokens needed.

If anything trips your strict ESLint config (`--max-warnings=0`), share the
rule names and I'll adjust. Likely candidates:

- `import/order` — alphabetise the imports in each file if your config
  enforces a particular order.
- `@typescript-eslint/no-misused-promises` — none expected; everything is
  synchronous JSX.
- `jsx-a11y/*` — all interactive elements have proper roles + `aria-label`s.
