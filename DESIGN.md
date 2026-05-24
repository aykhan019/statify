# Statify Design System

> Source of truth for every visual decision in `apps/web`. P6-M3 encodes every token in this file as a CSS variable inside the Tailwind 4 `@theme` block in `apps/web/src/app/globals.css`. No screen may hard-code a hex, a font family, a px outside the scale, a stroke weight, or a duration: every value lives here first.
>
> Locked direction (P6-M1): **Vivid Workshop**. Section-as-color drives the visual identity. Each top-level section of the app owns a hue from the 12-hue palette below; that hue carries through the section's block header, active-tab indicator, chart series, row-hover tint, and the frame around every cover inside the section. The block does the talking; the surface stays out of the way; album art is the loudest variable visual element in each row.

---

## 1. Color

Colors are authored in oklch so luminance, chroma, and hue are independently controllable and dark-mode swaps stay perceptually balanced.

### 1.1 Raw hue ladder

Twelve identity hues, each at eight luminance steps. Hues are spaced ~30° apart with high chroma at the mid-luminance steps so they hold against the work surface and against album art.

| Hue token         | h°  | Name      | Notes                                         |
| ----------------- | --- | --------- | --------------------------------------------- |
| `--hue-coral`     | 25  | coral     | Warm headline; Top Artists section            |
| `--hue-amber`     | 60  | amber     | Movement; Trending section; warning state     |
| `--hue-lime`      | 95  | lime      | Charts only; spare identity                   |
| `--hue-green`     | 140 | green     | Exploration; Discover section; success state  |
| `--hue-teal`      | 165 | teal      | Depth; Hidden Gems section                    |
| `--hue-cyan`      | 200 | cyan      | People; Community section; info state         |
| `--hue-azure`     | 230 | azure     | Time; Heatmap section                         |
| `--hue-indigo`    | 265 | indigo    | Foundational; Library section                 |
| `--hue-violet`    | 295 | violet    | Curation; Playlists section                   |
| `--hue-magenta`   | 325 | magenta   | Rhythm; Top Tracks section; currently-playing |
| `--hue-pink`      | 355 | pink      | Operator; Admin section                       |
| `--hue-vermilion` | 12  | vermilion | Recency; History section; error state         |

Each hue has eight luminance steps. The chroma value is tuned per hue so the perceived saturation stays even (yellows need lower chroma than blues at the same L to avoid burning out).

| Step  | L    | Suggested C (mid-spectrum hue) | Role                                                |
| ----- | ---- | ------------------------------ | --------------------------------------------------- |
| `50`  | 0.97 | 0.020                          | Paper-tint chip / ghost surface                     |
| `100` | 0.92 | 0.035                          | Soft fill / hover tint on light surface             |
| `200` | 0.84 | 0.060                          | Border on tinted surface                            |
| `400` | 0.72 | 0.130                          | On-block text in dark mode / chart series highlight |
| `500` | 0.62 | 0.180                          | **Default identity hue** (block fill, chart series) |
| `600` | 0.52 | 0.180                          | Pressed state, deepened accent                      |
| `700` | 0.42 | 0.150                          | Text on paper (link, deepened accent on light)      |
| `900` | 0.22 | 0.080                          | Deepest text-on-surface                             |

The full raw set is therefore `--color-{hue}-{step}` for each combination, e.g. `--color-coral-500`, `--color-azure-700`. P6-M3 emits all 96 raw color tokens.

### 1.2 Surface tokens (semantic)

Surface, foreground, border, ring, and overlay variables that every component reads. These are the only color tokens components are allowed to reference directly; raw `--hue-*` and `--color-{hue}-{step}` tokens are only for the section / entity / state / chart mappings below.

| Token                | Light mode (oklch)                             | Dark mode (oklch) | Role                                 |
| -------------------- | ---------------------------------------------- | ----------------- | ------------------------------------ |
| `--surface-page`     | `0.985 0 0`                                    | `0.16 0.004 265`  | Page background outside blocks       |
| `--surface-work`     | `1 0 0`                                        | `0.20 0.006 265`  | Inner work area inside cards         |
| `--surface-raised`   | `0.99 0 0`                                     | `0.24 0.008 265`  | Cards, dropdowns, popovers           |
| `--surface-sunken`   | `0.96 0.004 265`                               | `0.13 0.004 265`  | Tinted recesses, code blocks         |
| `--surface-overlay`  | `0.10 0 0 / 0.55`                              | `0 0 0 / 0.70`    | Modal scrim                          |
| `--fg-strong`        | `0.18 0.006 265`                               | `0.985 0 0`       | Display headlines, primary numerals  |
| `--fg-default`       | `0.26 0.006 265`                               | `0.94 0 0`        | Body text                            |
| `--fg-muted`         | `0.48 0.008 265`                               | `0.70 0.006 265`  | Secondary text, captions             |
| `--fg-faint`         | `0.66 0.008 265`                               | `0.55 0.006 265`  | Placeholder, disabled                |
| `--fg-on-block`      | `0.99 0 0`                                     | `0.99 0 0`        | Text on a section-hue block fill     |
| `--border-default`   | `0.90 0.004 265`                               | `0.30 0.006 265`  | Card borders, dividers               |
| `--border-strong`    | `0.78 0.006 265`                               | `0.42 0.008 265`  | Input borders, table rules           |
| `--ring-focus`       | uses active section hue at `--color-{hue}-500` | same              | Focus ring (2px + 2px offset)        |
| `--ring-focus-paper` | `0.99 0 0`                                     | `0.99 0 0`        | Inner ring when ring sits on a block |

Cards do **not** use shadows by default; the block-driven language carries depth. Shadows appear only on hovered cards, popovers, and modals (see §5).

### 1.3 Section identity hues

Each top-level section owns one hue. The block at the top of a route renders in `--color-{hue}-500` with `--fg-on-block` text. Section hue propagates to: active nav indicator, row hover tint (`--color-{hue}-50` light / `--color-{hue}-900` at 40% dark), chart series default, and cover frame in that section.

| Section     | Route prefix                    | Hue token             | Reason                   |
| ----------- | ------------------------------- | --------------------- | ------------------------ |
| Library     | `/catalog/*`                    | `--hue-indigo`        | Foundational, broad      |
| Discover    | `/discover`                     | `--hue-green`         | Exploration              |
| Top Artists | `/me/stats/top-artists`         | `--hue-coral`         | Warm headline            |
| Top Tracks  | `/me/stats/top-tracks`          | `--hue-magenta`       | Rhythm                   |
| Heatmap     | `/me/stats/heatmap`             | `--hue-azure`         | Time of day              |
| Trending    | `/me/stats/trending`            | `--hue-amber`         | Movement, momentum       |
| Hidden Gems | `/me/stats/hidden-gems`         | `--hue-teal`          | Depth, undiscovered      |
| History     | `/me/history`                   | `--hue-vermilion`     | Recency                  |
| Playlists   | `/me/playlists`, `/playlists/*` | `--hue-violet`        | Curation                 |
| Community   | `/community`                    | `--hue-cyan`          | People                   |
| Admin       | `/admin`                        | `--hue-pink`          | Operator, distinct       |
| Account     | `/me/account`                   | none (neutral chrome) | Settings shouldn't shout |

Semantic alias tokens (P6-M3 emits these alongside the raw set, so a route layout can do `bg-section-block text-section-on-block` and React reads `--color-section-*` from the route's section provider):

```
--color-section-block      → var(--color-{active hue}-500)
--color-section-block-fg   → var(--fg-on-block)
--color-section-tint       → var(--color-{active hue}-50)  /* dark: --color-{active hue}-900 at 40% */
--color-section-accent     → var(--color-{active hue}-500)
--color-section-accent-fg  → var(--fg-on-block)
--color-section-row-hover  → var(--color-section-tint)
--color-section-frame      → var(--color-section-accent)
```

When a route has no section (global search, sign-in, error pages), the active section resolves to `--hue-indigo` (Library default).

### 1.4 Entity type hues

Used in entity badges, the entity-type fallback color when an entity is rendered outside its section (e.g. in a global search result list), and the null-fallback tile background.

| Entity   | Hue token       |
| -------- | --------------- |
| Track    | `--hue-magenta` |
| Artist   | `--hue-coral`   |
| Album    | `--hue-indigo`  |
| Playlist | `--hue-violet`  |
| Genre    | `--hue-green`   |
| User     | `--hue-cyan`    |

Overlap with section hues is intentional: on a "Top Artists" page (coral), an artist row badged coral feels coherent; on global search, the badge tells you what type each result is regardless of the page hue.

### 1.5 State colors

State colors are anchored to specific hue tokens so they stay consistent regardless of which section the user is on.

| State token       | Hue               | Role                                       |
| ----------------- | ----------------- | ------------------------------------------ |
| `--state-success` | `--hue-green`     | Successful save, valid form, online status |
| `--state-warning` | `--hue-amber`     | Soft warning, rate-limit hint              |
| `--state-error`   | `--hue-vermilion` | Validation error, failed request           |
| `--state-info`    | `--hue-cyan`      | Informational banner, neutral toast        |
| `--state-active`  | `--hue-magenta`   | Currently-playing track, active selection  |

Each emits a triple at P6-M3: `--state-{name}-bg` (step 100 / 900-tinted in dark), `--state-{name}-border` (step 400 / 700), `--state-{name}-fg` (step 700 / 200).

### 1.6 Data-viz palette

Chart series cycle through these eight hues in order, picked for distinctness at typical chart series counts (line, bar, area) without adjacent-hue confusion.

| Series index | Hue token         |
| ------------ | ----------------- |
| 0            | `--hue-indigo`    |
| 1            | `--hue-coral`     |
| 2            | `--hue-green`     |
| 3            | `--hue-magenta`   |
| 4            | `--hue-amber`     |
| 5            | `--hue-cyan`      |
| 6            | `--hue-violet`    |
| 7            | `--hue-vermilion` |

When a chart is rendered inside a section block, the section's identity hue is moved to index 0 and the remaining series shift down to preserve spread.

For sequential / divergent scales (heatmap, choropleth):

- **Sequential single-hue (Heatmap):** 5 stops from `--color-azure-100` (low) to `--color-azure-700` (high) in light mode; `--color-azure-900` → `--color-azure-400` in dark.
- **Divergent (positive vs negative deltas in Trending):** 5 stops from `--color-vermilion-500` through neutral `--surface-work` to `--color-green-500`.

Chart axes, grids, and tooltips read from semantic tokens, never raw colors: `--chart-axis: var(--fg-muted)`, `--chart-grid: var(--border-default)`, `--chart-tooltip-bg: var(--surface-raised)`, `--chart-tooltip-fg: var(--fg-default)`, `--chart-tooltip-border: var(--border-default)`.

---

## 2. Typography

### 2.1 Families

Both families are free, on Google Fonts, and loaded self-hosted via `next/font/google` in `apps/web/src/lib/fonts.ts` (created in P6-M3). No remote font CDN. Variable-axis variants where available.

| Token         | Family                         | Weights loaded          | Role                                    |
| ------------- | ------------------------------ | ----------------------- | --------------------------------------- |
| `--font-sans` | Bricolage Grotesque (variable) | 400, 500, 600, 700, 800 | All UI text: body, labels, headings     |
| `--font-mono` | JetBrains Mono (variable)      | 400, 500, 700           | Tabular numerals, code, raw identifiers |

Bricolage Grotesque carries the Vivid Workshop identity: characterful at display sizes (block headers, hero stats), readable at body sizes. JetBrains Mono is reserved for numerics that need tabular alignment (every stat on the analytics pages) and for code-like strings (spotify URI in admin / debug).

`font-feature-settings`:

- All sans text: `"ss01" on, "cv11" on` (Bricolage stylistic alternates that match the blockier posture)
- All mono text: `"calt" on, "tnum" on, "zero" on` (tabular numerals, slashed zero)

### 2.2 Size + role scale

Each token specifies size / line-height / letter-spacing / suggested weight / role. Line-height pair is given as `<lh>/<lh-tight>` for prose vs display contexts.

| Token        | Size             | LH (prose/tight) | Tracking | Weight | Role                                          |
| ------------ | ---------------- | ---------------- | -------- | ------ | --------------------------------------------- |
| `text-micro` | 0.6875rem (11px) | 1.4 / 1.2        | +0.04em  | 600    | Chip text, micro-labels, table column headers |
| `text-xs`    | 0.75rem (12px)   | 1.45 / 1.25      | +0.02em  | 500    | Form hints, captions                          |
| `text-sm`    | 0.875rem (14px)  | 1.5 / 1.3        | 0        | 400    | Secondary body, list rows, table cells        |
| `text-base`  | 1rem (16px)      | 1.55 / 1.35      | 0        | 400    | Default body                                  |
| `text-md`    | 1.125rem (18px)  | 1.5 / 1.3        | 0        | 500    | Prominent body, callouts                      |
| `text-lg`    | 1.25rem (20px)   | 1.4 / 1.2        | -0.01em  | 600    | h4 / card title                               |
| `text-xl`    | 1.5rem (24px)    | 1.35 / 1.15      | -0.015em | 600    | h3 / panel title                              |
| `text-2xl`   | 1.875rem (30px)  | 1.3 / 1.1        | -0.02em  | 700    | h2 / page subtitle                            |
| `text-3xl`   | 2.25rem (36px)   | 1.25 / 1.05      | -0.02em  | 700    | h1 / detail page hero title                   |
| `text-4xl`   | 3rem (48px)      | 1.15 / 1.0       | -0.025em | 800    | Page hero on artist / album / playlist        |
| `text-5xl`   | 4rem (64px)      | 1.1 / 0.95       | -0.03em  | 800    | Section block header                          |
| `text-6xl`   | 5.5rem (88px)    | 1.05 / 0.9       | -0.035em | 800    | Feature stat display (Top Tracks #1 minutes)  |
| `text-7xl`   | 7.5rem (120px)   | 1.0 / 0.85       | -0.04em  | 800    | Heatmap legend, marquee number                |

Numeric-only rendering for stat displays uses `--font-mono` with `font-variant-numeric: tabular-nums` regardless of the size token chosen.

### 2.3 Letter-spacing rules

- Display sizes (`text-3xl` and above): negative tracking per table above; never set positive.
- Body sizes (`text-base`, `text-md`): zero tracking.
- Small-caps (`text-micro`, `text-xs` when used as a label): positive tracking per table, `text-transform: uppercase`, `font-weight: 600`.

---

## 3. Spacing scale

Base unit 4px. Half-steps allowed only where called out below for hairline cases. The Tailwind utility name matches the token suffix.

| Token         | Value | Common use                            |
| ------------- | ----- | ------------------------------------- |
| `--space-0`   | 0     | Reset                                 |
| `--space-px`  | 1px   | Hairline rule                         |
| `--space-0.5` | 2px   | Icon-to-text gap when both are small  |
| `--space-1`   | 4px   | Tight inline gap                      |
| `--space-1.5` | 6px   | Form helper-text offset               |
| `--space-2`   | 8px   | Default inline gap                    |
| `--space-3`   | 12px  | Tight stack gap                       |
| `--space-4`   | 16px  | Default card / row padding-inline     |
| `--space-5`   | 20px  | Card padding-block, list-row vertical |
| `--space-6`   | 24px  | Section-internal gap, card gutter     |
| `--space-8`   | 32px  | Block-to-block vertical rhythm        |
| `--space-10`  | 40px  | Page-section vertical rhythm          |
| `--space-12`  | 48px  | Hero block padding                    |
| `--space-16`  | 64px  | Section block vertical inset          |
| `--space-20`  | 80px  | Detail-page hero top inset            |
| `--space-24`  | 96px  | Reserved for hero-only spacing        |
| `--space-32`  | 128px | Empty-state vertical breathing        |
| `--space-40`  | 160px | Full-bleed feature blocks             |
| `--space-48`  | 192px | Reserved                              |

Container widths (max-inline) used by the layout primitive `Container` in P6-M5:

| Variant  | Max width | Use                                    |
| -------- | --------- | -------------------------------------- |
| `narrow` | 720px     | Forms, single-column reads, settings   |
| `prose`  | 880px     | Detail pages with long text            |
| `wide`   | 1280px    | Default authed app shell               |
| `full`   | 1600px    | Dashboards, analytics with wide charts |
| `bleed`  | 100%      | Section blocks (no max)                |

Gutters (inline padding) per breakpoint:

| Breakpoint | Width  | Gutter (`px`) |
| ---------- | ------ | ------------- |
| `xs`       | < 480  | 16            |
| `sm`       | ≥ 480  | 20            |
| `md`       | ≥ 768  | 24            |
| `lg`       | ≥ 1024 | 32            |
| `xl`       | ≥ 1280 | 40            |

---

## 4. Radius scale

| Token           | Value  | Use                                        |
| --------------- | ------ | ------------------------------------------ |
| `--radius-none` | 0      | Section blocks (full bleed, no rounding)   |
| `--radius-xs`   | 4px    | Tags, chips, small badges                  |
| `--radius-sm`   | 8px    | Inputs, buttons, small cards               |
| `--radius-md`   | 12px   | **Album cover frame**, list-row containers |
| `--radius-lg`   | 16px   | Cards, panels, dropdowns                   |
| `--radius-xl`   | 24px   | Heroes, dialogs, large surfaces            |
| `--radius-2xl`  | 32px   | Reserved for marketing only                |
| `--radius-full` | 9999px | Pills, avatars, audio-player buttons       |

Cover radius is locked at `--radius-md` everywhere except detail-page heroes where it stays `--radius-md` too (the frame, not corner geometry, carries the Vivid Workshop identity).

---

## 5. Shadow scale

Shadows are sparingly used; block fills do the depth work. Reserved for floating surfaces (popover, modal) and hovered cards.

| Token           | Value                                                             | Use                        |
| --------------- | ----------------------------------------------------------------- | -------------------------- |
| `--shadow-none` | none                                                              | Default for cards          |
| `--shadow-xs`   | `0 1px 2px oklch(0 0 0 / 0.05)`                                   | Hairline-elevation chips   |
| `--shadow-sm`   | `0 2px 4px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)`    | Hovered cards (light mode) |
| `--shadow-md`   | `0 4px 8px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.04)`    | Popover, dropdown          |
| `--shadow-lg`   | `0 8px 16px oklch(0 0 0 / 0.10), 0 4px 8px oklch(0 0 0 / 0.06)`   | Modal dialog               |
| `--shadow-xl`   | `0 16px 32px oklch(0 0 0 / 0.12), 0 8px 16px oklch(0 0 0 / 0.06)` | Reserved (drag overlay)    |

In dark mode the y-offsets stay the same but opacities double (background is darker; shadows need more weight to read).

---

## 6. Motion

Driven through `tailwindcss-animate` utilities (P6-M3 install). All custom keyframes live in `globals.css` `@theme` so they appear as `animate-*` utilities. `framer-motion` is opt-in only at P6-M11 if a specific surface needs layout / exit animation that CSS cannot deliver.

### 6.1 Duration tokens

| Token                | Value | Use                                       |
| -------------------- | ----- | ----------------------------------------- |
| `--duration-instant` | 0ms   | `prefers-reduced-motion: reduce` fallback |
| `--duration-fast`    | 120ms | Hover, tap, focus ring, color transitions |
| `--duration-base`    | 200ms | Default transitions, tooltips, popovers   |
| `--duration-slow`    | 320ms | Modals, dialogs, sheet panels             |
| `--duration-slower`  | 500ms | Page transitions (if used), block reveals |

### 6.2 Easing tokens

| Token             | Value                               | Use                                       |
| ----------------- | ----------------------------------- | ----------------------------------------- |
| `--ease-linear`   | `linear`                            | Progress bars, indeterminate loaders      |
| `--ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)`     | Default enter / appear (emphasized decel) |
| `--ease-in`       | `cubic-bezier(0.7, 0, 0.84, 0)`     | Exit / dismiss                            |
| `--ease-standard` | `cubic-bezier(0.65, 0, 0.35, 1)`    | Reorder, two-way transitions              |
| `--ease-spring`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Play-state toggle, overshoot accents      |

### 6.3 Named animations

| Token / utility           | Definition                                               | Use                                      |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| `animate-fade-in`         | opacity 0→1, `base`, `ease-out`                          | Default mount                            |
| `animate-fade-out`        | opacity 1→0, `base`, `ease-in`                           | Default unmount                          |
| `animate-slide-in-top`    | `translateY(-8px) → 0` + fade, `base`                    | Toast, notification                      |
| `animate-slide-in-bottom` | `translateY(8px) → 0` + fade, `base`                     | Sheet from bottom (mobile)               |
| `animate-slide-in-left`   | `translateX(-8px) → 0` + fade, `base`                    | Drawer, sidebar                          |
| `animate-slide-in-right`  | `translateX(8px) → 0` + fade, `base`                     | Mirror                                   |
| `animate-scale-in`        | `scale(0.96) → 1` + fade, `fast`, `ease-out`             | Dropdown, popover                        |
| `animate-scale-out`       | `scale(1) → 0.96` + fade, `fast`, `ease-in`              | Dropdown close                           |
| `animate-block-reveal`    | `clip-path` reveal top→bottom, `slower`, `ease-standard` | Section block first mount on route enter |
| `animate-row-stagger`     | child fade-up with `45ms` stagger, `base`                | List mount (catalog, history, playlists) |
| `animate-pulse-eq`        | 3-bar equalizer height pulse, `1.2s`, `linear` infinite  | Currently-playing indicator              |

### 6.4 Reduce-motion behavior

Single global rule, encoded in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: var(--duration-instant) !important;
    transition-duration: var(--duration-instant) !important;
    animation-iteration-count: 1 !important;
  }
}
```

The `animate-pulse-eq` (currently-playing equalizer) collapses to a solid filled bar with no animation under reduce-motion. Other animations simply skip to their end state.

---

## 7. Image system

### 7.1 Aspect ratios

| Token             | Ratio  | Use                                           |
| ----------------- | ------ | --------------------------------------------- |
| `--aspect-square` | 1 / 1  | Album, track, playlist covers (default)       |
| `--aspect-wide`   | 16 / 9 | Playlist hero, four-cell collage container    |
| `--aspect-cinema` | 21 / 9 | Reserved for marketing hero                   |
| `--aspect-artist` | 3 / 2  | Artist hero header                            |
| `--aspect-thumb`  | 4 / 3  | Article thumbnail (community posts, reserved) |

### 7.2 Cover size scale

| Token             | Size  | Use                                       |
| ----------------- | ----- | ----------------------------------------- |
| `--cover-xs`      | 40px  | Inline list row (history, search results) |
| `--cover-sm`      | 56px  | Standard list row (catalog tracks)        |
| `--cover-md`      | 80px  | Compact card                              |
| `--cover-lg`      | 128px | Default card                              |
| `--cover-xl`      | 200px | Hero card, top of stat tile               |
| `--cover-hero`    | 320px | Detail page hero (mobile)                 |
| `--cover-display` | 480px | Detail page hero (desktop)                |

iTunes returns one URL string per resolved track (`...100x100bb.jpg`). The render-time helper `coverSrc(url, size)` substitutes the size segment (`600x600bb.jpg`, `1000x1000bb.jpg`) to fetch the right resolution per cover size token. P6-M4 documents the helper alongside the schema change.

### 7.3 Frame treatment

Every cover wears a frame in the active section hue (`--color-section-frame`). Frame thickness varies by context:

| Context                         | Thickness                                                    | Note                                 |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| Dense list row                  | 1px                                                          | Hairline tie-back                    |
| Standard card                   | 4px                                                          | Default Vivid Workshop frame         |
| Hovered card                    | 6px                                                          | Lift via thickness, not shadow       |
| Detail page hero                | 8px                                                          | Top + sides; bottom rests on overlay |
| Currently-playing (any context) | 6px + 12px outer glow at `--color-section-frame` 25% opacity | The only allowed glow effect         |

Frame corner radius matches the cover: `--radius-md` outside the frame, frame inside the radius.

### 7.4 Overlay treatment

- **Artist hero (`--aspect-artist`):** section-hue tint at 18-22% opacity painted across the full image so the artist photo reads as section content.
- **Playlist hero (`--aspect-wide`):** no color tint. Title block sits in a bottom-aligned dark gradient (linear from `oklch(0 0 0 / 0)` to `oklch(0 0 0 / 0.65)` over the bottom 40% of the image).
- **All other covers:** no overlay. Album art is allowed to clash with the section frame; the energy is the point.

### 7.5 Null fallback (when `image_url` is NULL)

| Context                              | Treatment                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cover in section context             | Solid block in `--color-section-frame` with the entity's first letter in `text-4xl` weight 800, `--fg-on-block` text.                                |
| Cover in global / search context     | Solid block in the entity-type hue (`--hue-magenta` for Track, `--hue-coral` for Artist, etc.) with the entity's first letter in the same treatment. |
| Artist cover (always null on ingest) | Same as global; uses `--hue-coral` (entity hue for Artist).                                                                                          |
| Playlist hero with no single image   | 2 × 2 grid collage of the first four member-track covers. If fewer than four are available, repeat to fill.                                          |

Letter selection: first character of the entity's `name` after stripping leading articles ("The", "A", "An") and casing to uppercase.

No gradient backgrounds, no placeholder line-art, no stock SVG, no generic music notes. The fallback is part of the system; it is not a placeholder.

---

## 8. Icon system

### 8.1 Library

`lucide-react`. Single icon library across the entire app. Installed in P6-M3.

### 8.2 Locked stroke weight

**Stroke 2.** No exceptions. P6-M3 ships a `<Icon>` wrapper at `apps/web/src/components/ui/icon.tsx` that injects `strokeWidth={2}` on every Lucide component to enforce this.

### 8.3 Size scale

| Token     | Size | Role                                                                 |
| --------- | ---- | -------------------------------------------------------------------- |
| `icon-xs` | 14px | Inline within `text-micro` / `text-xs` only                          |
| `icon-sm` | 16px | Default inline with body text, form field decoration, button leading |
| `icon-md` | 20px | **Navigation items**, primary action buttons, section row indicators |
| `icon-lg` | 24px | **Feature** — section block header, hero CTA, card affordance        |
| `icon-xl` | 32px | Empty state hero, error state hero                                   |

### 8.4 Role mapping

| Role                   | Token                                             | Notes                                                              |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Inline text decoration | `icon-sm`                                         | Stays beside text; never centered alone                            |
| Form field affordance  | `icon-sm`                                         | Search magnifier, dropdown caret, password toggle                  |
| Button leading icon    | `icon-sm` (sm/md buttons) / `icon-md` (lg button) | Always paired with a label                                         |
| Icon-only control      | `icon-md`                                         | Audio player play/pause/next, table-row kebab, dismiss             |
| Navigation tab / link  | `icon-md`                                         | Active state: filled variant (`icon-{name}-filled`)                |
| Section block header   | `icon-lg`                                         | Renders in `--fg-on-block` over the section block                  |
| Empty / error hero     | `icon-xl`                                         | In `--color-section-frame` for empty; `--state-error-fg` for error |

### 8.5 Filled variants

The only filled-variant usage is active nav state. Each nav-bound Lucide icon has a paired filled glyph (Lucide ships filled variants for most nav-relevant icons; where it does not, fall back to the same stroked icon with `fill="currentColor"`).

### 8.6 Single allowed exception

The currently-playing equalizer is **not** a Lucide icon (Lucide ships no animated equalizer). A custom 3-bar SVG lives at `apps/web/src/components/ui/equalizer.tsx`. It is the only non-Lucide icon allowed in the system. Any future request to add a non-Lucide icon requires an ADR.

No emoji as UI icons. Anywhere.

---

## 9. Do / Do not

**Do**

- Commit to one section hue per top-level area. Let the block do the talking.
- Pull every color, font, radius, spacing step, shadow, motion value, aspect ratio, cover size, and icon size from a token defined in this file.
- Use `--font-mono` with `tabular-nums` for every numeric stat. Stats are aligned vertically; that only works with tabular numerics.
- Let album art clash with the section frame when it does. The energy is the point.
- Null-fallback to a colored tile drawn from this system, with the entity's first letter in display weight on top.
- Render the same Lucide icon at the same size in the same role across every route. Variance signals semantics, not decoration.

**Do not**

- Hard-code a hex, a font family, a px outside the spacing scale, a stroke weight, or a duration anywhere.
- Tint album art with the section hue outside artist heroes (§7.4).
- Add drop shadows to section blocks. Depth is the flat block fill, not elevation.
- Replace Lucide with another icon set for any single icon. Use the custom equalizer (§8.6) as the only exception.
- Use stroke widths other than 2 for Lucide icons.
- Introduce a "quieter" single-accent variant as a fallback. The system is multi-hue or it is not Statify.
- Use emoji as UI icons.
- Render a placeholder image, stock photo, generic gradient, or third-party-sourced sample anywhere. Real media or the null-fallback.
- Add a new dependency, family, hue, or scale step without an ADR. The token surface is the contract.

---

## 10. Token surface summary (for P6-M3)

P6-M3 emits the following families inside `apps/web/src/app/globals.css` `@theme`:

```
/* §1.1 raw palette: 12 hues × 8 steps = 96 tokens */
--color-{coral|amber|lime|green|teal|cyan|azure|indigo|violet|magenta|pink|vermilion}-{50|100|200|400|500|600|700|900}

/* §1.1 hue references for downstream semantic mapping */
--hue-{coral|amber|lime|green|teal|cyan|azure|indigo|violet|magenta|pink|vermilion}

/* §1.2 surfaces, fg, borders, rings, overlay */
--surface-*, --fg-*, --border-*, --ring-*

/* §1.3 section semantic layer (resolved per route at runtime) */
--color-section-{block|block-fg|tint|accent|accent-fg|row-hover|frame}

/* §1.4 entity-type hues (alias) */
--entity-{track|artist|album|playlist|genre|user}

/* §1.5 state colors */
--state-{success|warning|error|info|active}-{bg|border|fg}

/* §1.6 data-viz palette */
--chart-series-{0..7}, --chart-axis, --chart-grid, --chart-tooltip-{bg|fg|border}, --chart-heatmap-{0..4}, --chart-divergent-{neg-2|neg-1|zero|pos-1|pos-2}

/* §2 typography */
--font-{sans|mono}, plus the size/lh/tracking/weight values embedded in @utility text-{micro|xs|sm|base|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl}

/* §3 spacing */
--space-{0|px|0.5|1|1.5|2|3|4|5|6|8|10|12|16|20|24|32|40|48}, --container-{narrow|prose|wide|full|bleed}

/* §4 radius */
--radius-{none|xs|sm|md|lg|xl|2xl|full}

/* §5 shadow */
--shadow-{none|xs|sm|md|lg|xl}

/* §6 motion */
--duration-{instant|fast|base|slow|slower}, --ease-{linear|out|in|standard|spring}, plus @keyframes for animate-{fade-in|fade-out|slide-in-*|scale-in|scale-out|block-reveal|row-stagger|pulse-eq}

/* §7 image */
--aspect-{square|wide|cinema|artist|thumb}, --cover-{xs|sm|md|lg|xl|hero|display}

/* §8 icon */
--icon-{xs|sm|md|lg|xl}
```

Every token in this file appears as exactly one CSS variable. Any drift between this file and `globals.css` is a bug.
