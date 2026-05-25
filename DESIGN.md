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

| Token                | Light mode (oklch)     | Dark mode (oklch) | Role                                 |
| -------------------- | ---------------------- | ----------------- | ------------------------------------ |
| `--surface-page`     | `0.985 0 0`            | `0.16 0.004 265`  | Page background outside blocks       |
| `--surface-work`     | `1 0 0`                | `0.20 0.006 265`  | Inner work area inside cards         |
| `--surface-raised`   | `0.99 0 0`             | `0.24 0.008 265`  | Cards, dropdowns, popovers           |
| `--surface-sunken`   | `0.96 0.004 265`       | `0.13 0.004 265`  | Tinted recesses, code blocks         |
| `--surface-overlay`  | `0.10 0 0 / 0.55`      | `0 0 0 / 0.70`    | Modal scrim                          |
| `--fg-strong`        | `0.18 0.006 265`       | `0.985 0 0`       | Display headlines, primary numerals  |
| `--fg-default`       | `0.26 0.006 265`       | `0.94 0 0`        | Body text                            |
| `--fg-muted`         | `0.48 0.008 265`       | `0.70 0.006 265`  | Secondary text, captions             |
| `--fg-faint`         | `0.66 0.008 265`       | `0.55 0.006 265`  | Placeholder, disabled                |
| `--fg-on-block`      | `0.99 0 0`             | `0.99 0 0`        | Text on a section-hue block fill     |
| `--border-default`   | `0.90 0.004 265`       | `0.30 0.006 265`  | Card borders, dividers               |
| `--border-strong`    | `0.78 0.006 265`       | `0.42 0.008 265`  | Input borders, table rules           |
| `--ring-focus`       | active hue at step 700 | step 400          | Focus ring (2px + 2px offset)        |
| `--ring-focus-paper` | `0.99 0 0`             | `0.99 0 0`        | Inner ring when ring sits on a block |

Cards do **not** use shadows by default; the block-driven language carries depth. Shadows appear only on hovered cards, popovers, and modals (see §5).

### 1.3 Section identity hues

Each top-level section owns one hue. The block at the top of a route renders the hue through contrast-safe semantic aliases: `--color-{hue}-700` with `--fg-on-block` text in light mode, and `--color-{hue}-400` with `--surface-page` text in dark mode. Section hue propagates to: active nav indicator, row hover tint (`--color-{hue}-50` light / `--color-{hue}-900` at 40% dark), chart series default, and cover frame in that section. Cover frames and chart series keep the hue's 500 step because they do not carry body text.

| Section     | Route prefix                                    | Hue token             | Reason                   |
| ----------- | ----------------------------------------------- | --------------------- | ------------------------ |
| Library     | `/catalog/*`                                    | `--hue-indigo`        | Foundational, broad      |
| Discover    | `/discover`                                     | `--hue-green`         | Exploration              |
| Top Artists | `/me/stats/top-artists`                         | `--hue-coral`         | Warm headline            |
| Top Tracks  | `/me/stats/top-tracks`                          | `--hue-magenta`       | Rhythm                   |
| Heatmap     | `/me/stats/heatmap`                             | `--hue-azure`         | Time of day              |
| Trending    | `/me/stats/trending`                            | `--hue-amber`         | Movement, momentum       |
| Hidden Gems | `/explore/hidden-gems`, `/me/stats/hidden-gems` | `--hue-teal`          | Depth, undiscovered      |
| History     | `/me/history`                                   | `--hue-vermilion`     | Recency                  |
| Playlists   | `/me/playlists`, `/playlists/*`                 | `--hue-violet`        | Curation                 |
| Community   | `/community`                                    | `--hue-cyan`          | People                   |
| Admin       | `/admin`                                        | `--hue-pink`          | Operator, distinct       |
| Account     | `/me/account`                                   | none (neutral chrome) | Settings shouldn't shout |

Semantic alias tokens (P6-M3 emits these alongside the raw set, so a route layout can do `bg-section-block text-section-on-block` and React reads `--color-section-*` from the route's section provider):

```
--color-section-block      → light: var(--color-{active hue}-700) / dark: var(--color-{active hue}-400)
--color-section-block-fg   → light: var(--fg-on-block) / dark: var(--surface-page)
--color-section-tint       → var(--color-{active hue}-50)  /* dark: --color-{active hue}-900 at 40% */
--color-section-accent     → light: var(--color-{active hue}-700) / dark: var(--color-{active hue}-400)
--color-section-accent-fg  → light: var(--fg-on-block) / dark: var(--surface-page)
--color-section-row-hover  → var(--color-section-tint)
--color-section-frame      → var(--color-{active hue}-500)
```

When a route has no section (global search, sign-in, error pages, stats overview, app overview), the active section resolves to `--hue-indigo` (Library default).

### 1.3.1 Section block headers

Every routed section except Account renders a full-width block header as the first section-owned surface beneath breadcrumbs. The block has no radius, no shadow, no card wrapper, and fills the main content width with `--color-section-block` and `--color-section-block-fg`. Those aliases use contrast-safe hue steps rather than the raw 500 step when text sits directly on the fill. The inner content is constrained to the normal wide container with page gutters.

Block vertical padding is `--space-12` on compact viewports and `--space-16` on large viewports. The title uses `text-5xl`, weight `800`, tight line-height, and normal letter spacing. Optional route labels use the mono micro-label treatment; optional icons render at `--icon-lg` inside a simple on-block border chip.

The section provider resolves the active section from the current route prefix and sets these runtime aliases on the app subtree: `--color-section-block`, `--color-section-block-fg`, `--color-section-tint`, `--color-section-accent`, `--color-section-accent-fg`, `--color-section-row-hover`, and `--color-section-frame`. It also moves the active section hue to `--color-chart-series-0`, so default chart marks match the route. Active nav and tabs use `--color-section-accent`; row and breadcrumb hover fills use `--color-section-row-hover`; cover frames use `--color-section-frame`.

Account remains neutral chrome: it resolves the indigo defaults for focus and nav consistency, but does not render a block header.

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

Chart axes, grids, and tooltips read from semantic tokens, never raw colors: `--color-chart-axis: var(--fg-muted)`, `--color-chart-grid: var(--border-default)`, `--color-chart-tooltip-bg: var(--surface-raised)`, `--color-chart-tooltip-fg: var(--fg-default)`, `--color-chart-tooltip-border: var(--border-default)`.

#### 1.6.1 Chart surface treatment

All analytics chart surfaces use the shared chart module at `apps/web/src/components/charts/`. Components read series, axis, grid, cursor, tooltip, and heatmap colors from CSS variables through that module. Chart components must not inline raw palette values.

Tooltip treatment: `--color-chart-tooltip-bg` on `--color-chart-tooltip-fg`, 1px `--color-chart-tooltip-border`, `--radius-sm`, 0.875rem text, and compact 0.5rem / 0.75rem padding. Hover cursors use `--color-section-row-hover` so chart interaction follows the active section hue.

Legend treatment: inline swatches use the series token cycle, 0.625rem circular swatches, `text-fg-muted` labels, and wrap onto additional rows without changing chart dimensions.

Heatmap treatment: zero-count cells use `--surface-sunken`; nonzero cells map normalized intensity into the five `--color-chart-heatmap-{0..4}` stops. The scale stays azure in every section so the hour/day heatmap remains comparable across routes.

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

### 3.1 Layout primitives

P6-M5 ships token-bound primitives in `apps/web/src/components/layout/`. These are the only layout building blocks for redesigned route shells and major sections. They may compose each other, but they must not encode raw pixel values, hex colors, or font-family declarations.

`Container` controls max-inline width and responsive gutters:

| Prop value | Token / behavior                                    | Use                                    |
| ---------- | --------------------------------------------------- | -------------------------------------- |
| `narrow`   | `--container-narrow`                                | Forms, settings, single-column reads   |
| `prose`    | `--container-prose`                                 | Detail pages with long text            |
| `wide`     | `--container-wide`                                  | Default authed app shell               |
| `full`     | `--container-full`                                  | Dashboards, analytics with wide charts |
| `bleed`    | no max width                                        | Full-width section blocks              |
| `page`     | 16 / 20 / 24 / 32 / 40px responsive gutter sequence | Default route gutter                   |
| `compact`  | 12 / 16 / 20px responsive gutter sequence           | Dense nested surfaces                  |
| `none`     | no inline gutter                                    | Flush compositions                     |

`Stack` sets flex direction and token gap:

| Prop value   | Behavior                             |
| ------------ | ------------------------------------ |
| `vertical`   | column flow                          |
| `horizontal` | row flow                             |
| `responsive` | column at `xs`, row from `sm` upward |
| `none`       | `--space-0` gap                      |
| `xs`         | `--space-2` gap                      |
| `sm`         | `--space-3` gap                      |
| `md`         | `--space-4` gap                      |
| `lg`         | `--space-6` gap                      |
| `xl`         | `--space-8` gap                      |
| `section`    | `--space-10` gap                     |

`Grid` defines responsive column steps:

| Prop value | Columns                                                           |
| ---------- | ----------------------------------------------------------------- |
| `one`      | 1 column at every breakpoint                                      |
| `two`      | 1 column at `xs`; 2 columns from `md` upward                      |
| `three`    | 1 column at `xs`; 2 columns from `md`; 3 columns from `xl` upward |
| `four`     | 1 column at `xs`; 2 columns from `sm`; 4 columns from `lg` upward |

`Section` sets full-width route bands:

| Prop value | Behavior                                 |
| ---------- | ---------------------------------------- |
| `plain`    | transparent band                         |
| `tint`     | `--section-tint` band                    |
| `block`    | `--section-block` / `--section-block-fg` |
| `sunken`   | `--surface-sunken` band                  |
| `none`     | no block-axis padding                    |
| `sm`       | `--space-6` block-axis padding           |
| `md`       | `--space-8` block-axis padding           |
| `lg`       | `--space-10`, then `--space-12` at `lg`  |
| `xl`       | `--space-12`, then `--space-16` at `lg`  |

`Surface` frames local work areas:

| Prop      | Values                                                     |
| --------- | ---------------------------------------------------------- |
| `tone`    | `page`, `work`, `raised`, `sunken`, `overlay`, `section`   |
| `border`  | `none`, `default`, `strong`, `section`                     |
| `radius`  | `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`        |
| `shadow`  | `none`, `xs`, `sm`, `md`, `lg`, `xl`                       |
| `padding` | `none`, `sm`, `md`, `lg`, `xl` mapped to the spacing scale |

`Divider` uses horizontal or vertical orientation with `default`, `strong`, or `section` border tone. `Spacer` uses every spacing token from `0` through `48` on either the vertical or horizontal axis.

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

Driven through `tailwindcss-animate` utilities (P6-M3 install). All custom keyframes live in `globals.css` `@theme` so they appear as `animate-*` utilities. `framer-motion` is opt-in only at P6-M12 if a specific surface needs layout / exit animation that CSS cannot deliver.

### 6.1 Duration tokens

| Token                  | Value | Use                                       |
| ---------------------- | ----- | ----------------------------------------- |
| `--duration-instant`   | 0ms   | `prefers-reduced-motion: reduce` fallback |
| `--duration-fast`      | 120ms | Hover, tap, focus ring, color transitions |
| `--duration-base`      | 200ms | Default transitions, tooltips, popovers   |
| `--duration-slow`      | 320ms | Modals, dialogs, sheet panels             |
| `--duration-slower`    | 500ms | Page transitions (if used), block reveals |
| `--duration-stagger`   | 45ms  | Row / card list stagger offset            |
| `--duration-equalizer` | 1.2s  | Currently-playing equalizer pulse         |

### 6.2 Easing tokens

| Token             | Value                               | Use                                       |
| ----------------- | ----------------------------------- | ----------------------------------------- |
| `--ease-linear`   | `linear`                            | Progress bars, indeterminate loaders      |
| `--ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)`     | Default enter / appear (emphasized decel) |
| `--ease-in`       | `cubic-bezier(0.7, 0, 0.84, 0)`     | Exit / dismiss                            |
| `--ease-standard` | `cubic-bezier(0.65, 0, 0.35, 1)`    | Reorder, two-way transitions              |
| `--ease-spring`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Play-state toggle, overshoot accents      |

### 6.3 Named animations

| Token / utility           | Definition                                                   | Use                                      |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `animate-fade-in`         | opacity 0→1, `base`, `ease-out`                              | Default mount                            |
| `animate-fade-out`        | opacity 1→0, `base`, `ease-in`                               | Default unmount                          |
| `animate-slide-in-top`    | `translateY(-8px) → 0` + fade, `base`                        | Toast, notification                      |
| `animate-slide-in-bottom` | `translateY(8px) → 0` + fade, `base`                         | Sheet from bottom (mobile)               |
| `animate-slide-in-left`   | `translateX(-8px) → 0` + fade, `base`                        | Drawer, sidebar                          |
| `animate-slide-in-right`  | `translateX(8px) → 0` + fade, `base`                         | Mirror                                   |
| `animate-scale-in`        | `scale(0.96) → 1` + fade, `fast`, `ease-out`                 | Dropdown, popover                        |
| `animate-scale-out`       | `scale(1) → 0.96` + fade, `fast`, `ease-in`                  | Dropdown close                           |
| `animate-block-reveal`    | `clip-path` reveal top→bottom, `slower`, `ease-standard`     | Section block first mount on route enter |
| `animate-row-stagger`     | child fade-up with `45ms` stagger, `base`                    | List mount (catalog, history, playlists) |
| `animate-pulse-eq`        | 3-bar equalizer height pulse, `equalizer`, `linear` infinite | Currently-playing indicator              |
| `animate-skeleton-pulse`  | opacity pulse, `slower`, `ease-standard`, infinite           | Skeleton shimmer                         |
| `animate-spinner`         | rotate, `slower`, `linear`, infinite                         | Inflight submit glyph                    |

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

Playlist DTOs do not store a playlist-level image. P6-M7 exposes `coverImages` from API list/detail responses, derived from the first four member tracks with `track.imageUrl ?? album.imageUrl`, so playlist cards and heroes can render the same 2 × 2 collage treatment without adding another schema column.

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

### 8.6 Navigation states and breakpoints

P6-M6 navigation components live in `apps/web/src/components/navigation/`. They consume the layout primitives and semantic tokens only. Every navigation link uses `icon-md`; no navigation surface may downshift icons to `icon-sm` to solve density.

| State      | Treatment                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| Default    | `--fg-muted` text and icon on transparent surface.                                        |
| Hover      | `--section-row-hover` fill with `--fg-strong` text and icon.                              |
| Active     | `--section-accent` fill with `--section-accent-fg` text; icon uses `fill="currentColor"`. |
| Focus      | 2px `--ring-focus` ring with 2px offset on `--surface-page`; do not remove the outline.   |
| Disabled   | `--fg-faint` at 50% opacity; pointer and keyboard activation disabled.                    |
| User menu  | Raised `--surface-raised` popover with `--border-default`, `--radius-md`, `--shadow-md`.  |
| Breadcrumb | Links use `--fg-muted`; current page uses `--fg-strong`; separators use `--fg-faint`.     |

Breakpoint behavior:

| Range       | Behavior                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `< md`      | Side navigation is hidden. A top-left icon button opens a fixed mobile panel below the top bar. Escape closes it. |
| `md`-`lg`   | Side navigation is visible. Mobile trigger is hidden. Top primary links remain hidden to avoid crowding search.   |
| `lg` and up | Side navigation remains visible; top primary links also render for high-frequency route jumps.                    |
| `sm` and up | Global search appears in the top bar. Below `sm`, search appears inside the mobile panel.                         |

Keyboard order is mobile trigger (when present), brand, top links, search, user menu, side navigation, breadcrumbs, then page content. All interactive navigation controls use visible token focus rings and remain reachable by Tab.

### 8.7 Single allowed exception

The currently-playing equalizer is **not** a Lucide icon (Lucide ships no animated equalizer). A custom 3-bar SVG lives at `apps/web/src/components/ui/equalizer.tsx`. It is the only non-Lucide icon allowed in the system. Any future request to add a non-Lucide icon requires an ADR.

No emoji as UI icons. Anywhere.

---

## 9. Forms

Form primitives live at `apps/web/src/components/forms/`. The primitives in this section are the only allowed building blocks for form routes (signup, login, password change, account deletion confirmation, playlist create / edit, admin trigger / filters / search). The Phase 5 `ui/Input` and `ui/Label` were token-thin shims; they are kept only for non-form catalog and search bars and are slated for removal once the catalog surfaces are themselves rebuilt.

Validation is owned by Zod schemas in `@statify/shared`. The primitives stay schema-agnostic; the wiring layer is React Hook Form's `register`.

### 9.1 Field anatomy

A field is composed of: label → control → either error or hint, in that order, on a vertical stack at `--space-1.5`. The wrapper `<Field>` generates a stable `id`, manages `aria-describedby` between the control, hint, and error, and sets `aria-invalid` when an error is present.

| Slot     | Token / treatment                                                |
| -------- | ---------------------------------------------------------------- |
| Wrapper  | `flex flex-col gap-1.5`                                          |
| Label    | `text-sm font-medium`, color `--fg-strong`                       |
| Required | Trailing `*` glyph in `--state-error-fg`, `aria-hidden`          |
| Optional | Trailing `optional` mono micro-label in `--fg-faint`             |
| Hint     | `text-xs` in `--fg-muted` (hidden when an error is present)      |
| Error    | `text-xs` in `--state-error-fg`, `role="alert"` for live updates |

Hint and error are mutually exclusive: when both are provided, the error wins and the hint is suppressed. Both are exposed as `aria-describedby` ids on the control so screen readers announce them as the control's description.

### 9.2 Control sizes

Controls share one size axis. The default is `md`.

| Token | Height | Padding-x | Type token  | Use                                                 |
| ----- | ------ | --------- | ----------- | --------------------------------------------------- |
| `sm`  | 32px   | 10px      | `text-xs`   | Dense filter rows, inline search bars               |
| `md`  | 40px   | 12px      | `text-sm`   | Default body forms (login, signup, playlist create) |
| `lg`  | 48px   | 16px      | `text-base` | Hero CTAs, account creation step 1 (when reserved)  |

`<Textarea>` is unsized in height (caller-controlled via `rows`) but reuses the same padding scale via the `paddingSize` prop. `<Select>` mirrors `<Input>` exactly with a chevron sentinel in `--icon-sm` (or `--icon-xs` at `size="sm"`).

### 9.3 Control states

All text controls (`<Input>`, `<Textarea>`, `<Select>`) share one state table. Tokens are pulled live from CSS variables; nothing is hard-coded.

| State    | Background         | Border                 | Foreground         | Notes                                                                                   |
| -------- | ------------------ | ---------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| Default  | `--surface-work`   | `--border-strong`      | `--fg-default`     | Placeholder is `--fg-faint`.                                                            |
| Hover    | `--surface-work`   | `--fg-faint`           | `--fg-default`     | Border deepens; no fill change.                                                         |
| Focus    | `--surface-work`   | `--border-strong`      | `--fg-default`     | 2px `--ring-focus` ring + 2px offset on `--surface-page`. Global rule in `globals.css`. |
| Invalid  | `--state-error-bg` | `--state-error-border` | `--state-error-fg` | `aria-invalid="true"`. Focus ring switches to `--state-error-border`. Placeholder dims. |
| Disabled | `--surface-sunken` | `--border-strong`      | `--fg-faint`       | `cursor-not-allowed`, opacity 70.                                                       |
| Loading  | `--surface-work`   | `--border-strong`      | `--fg-default`     | `aria-busy="true"`, `cursor-progress`, opacity 70. Caller usually disables alongside.   |

Transitions on background, border, and box-shadow use `--duration-fast` with the default browser easing (semantic transitions are intentionally subtle on inputs to avoid lag).

### 9.4 Checkbox and switch

Both render selection state in the active section accent. They consume the same `Field` context so they inherit `aria-describedby` and `aria-invalid` without manual wiring.

| Token                   | Unchecked                                           | Checked                                                                            |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Checkbox box            | 16px, `--radius-xs`, border `--border-strong`       | Fill `--section-accent`, border `--section-accent`, glyph in `--section-accent-fg` |
| Checkbox glyph          | Hidden                                              | Lucide `Check`, stroke width 3, size `12px`                                        |
| Switch track            | 40 × 24, `--radius-full`, bg `--surface-sunken`     | Bg `--section-accent`                                                              |
| Switch thumb            | 16px circle, bg `--surface-work`, `--shadow-xs`     | Translated `20px` along the track                                                  |
| Invalid border (either) | `--state-error-border` instead of `--border-strong` | same                                                                               |
| Focus ring              | 2px `--ring-focus` with offset on `--surface-page`  | same                                                                               |

Side label and description (when provided) sit to the right of the control in a small vertical stack: label `text-sm font-medium`, description `text-xs --fg-muted`.

### 9.5 Submit button

`<SubmitButton>` is a thin wrapper over the base `Button`. It defaults `type="submit"`, forwards `loading` to `disabled` + `aria-busy`, and renders a leading `Loader2` glyph with the tokenized `motion-spinner` utility while inflight. Label can be swapped via `loadingLabel`; if omitted it shows the same children (so callers can pass `Sign in` as children and `Signing in...` as `loadingLabel`).

Reduce-motion: the spinner inherits the global reduce-motion guard from `globals.css §6.4`, so under `prefers-reduced-motion: reduce` the glyph stops rotating.

### 9.6 Form-level error summary

Server-side and submit-level errors that don't belong to a single field render through `<FormError variant="summary">`. The summary surface is a 1px state-error bordered card on `--state-error-bg` with a leading `AlertCircle` glyph at `--icon-sm`, the message in `text-sm` `--state-error-fg`, and `role="alert"` for live announcement.

Field-level errors continue to render through `<FormError variant="field">` (the default), which is what `<Field error={...}>` uses internally.

### 9.7 Layout

Single-column forms use `Container size="narrow"` (720px) with a `Stack gap="md"` between fields and `gap="lg"` between fieldset groups. Inline filter forms (audit log filters, admin user search) use `Grid` for the inputs and a trailing button row.

Buttons in a form footer use `gap="sm"` with the primary submit first; destructive flows (account deletion confirmation) put the destructive submit first and the cancel `variant="ghost"` second.

---

## 10. Empty, loading, and error states

Every list and detail route resolves to one of four states when it is not showing data. The primitives live at `apps/web/src/components/states/` and consume only tokens from this file. Empty and not-found use the neutral tone; error uses the error tone. The skeleton mirrors the shape of the route it stands in for.

### 10.1 Primitives

| Primitive              | File                       | Role                                          | Tone                                                    |
| ---------------------- | -------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `Skeleton` + templates | `states/Skeleton.tsx`      | Loading placeholder while a server fetch runs | Neutral shimmer (`--surface-sunken`, `motion-skeleton`) |
| `EmptyState`           | `states/EmptyState.tsx`    | Fetch succeeded, zero rows                    | Neutral, dashed `--border-default` recess               |
| `ErrorState`           | `states/ErrorState.tsx`    | Fetch threw                                   | Error, `--state-error-*` border and chip                |
| `NotFoundState`        | `states/NotFoundState.tsx` | Entity missing (`notFound()`)                 | Neutral, with a link back to a known-good route         |

All four share `states/StatePanel.tsx`: a centered column of icon chip, title (`text-lg`, `--fg-strong`), optional description (`text-sm`, `--fg-muted`), and optional action. The chip is a `--radius-full` circle at `size-12`; the icon is a Lucide glyph at `--icon-lg` (stroke 2 per §8.2).

### 10.2 Tone tokens

| Slot             | Neutral (empty / not-found)                   | Error                                         |
| ---------------- | --------------------------------------------- | --------------------------------------------- |
| Container border | `--border-default`, dashed                    | `--state-error-border`, solid                 |
| Container fill   | `--surface-sunken`                            | `--state-error-bg`                            |
| Icon chip        | `--section-tint` bg, `--section-accent` glyph | `--surface-work` bg, `--state-error-fg` glyph |
| Title            | `--fg-strong`                                 | `--state-error-fg`                            |
| ARIA role        | `status`                                      | `alert`                                       |

The empty / not-found chip uses the active section hue, so the state reads as part of the section rather than a generic system surface. Section-less routes resolve to the indigo Library default.

### 10.3 Skeleton templates

`loading.tsx` at each route segment renders the template that matches the route's shape. Every template carries a header bar (title plus subtitle) over a body:

| Template           | Body                                        | Routes                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------------- |
| `ListSkeleton`     | Cover-square rows                           | tracks, history, admin tables                     |
| `CardGridSkeleton` | Square-cover card grid                      | artists, albums, playlists, discover, hidden gems |
| `DetailSkeleton`   | Hero cover and meta, then a two-column band | every `[id]` detail route                         |
| `ChartSkeleton`    | Chart canvas band and summary tiles         | every `me/stats/*` route                          |

Skeletons are decorative: the shimmer blocks are `aria-hidden`, and the App Router `loading.tsx` boundary owns the busy semantics. Under `prefers-reduced-motion: reduce` the pulse stops (global guard, §6.4).

### 10.4 Route wiring

| State     | Mechanism                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Loading   | `loading.tsx` per route segment (list, detail, stats) renders the matching skeleton template                |
| Empty     | `EmptyState` when a fetch returns zero rows; the shared `InfiniteScroll` falls back to it via `emptyText`   |
| Error     | `(app)/error.tsx` (client boundary) renders `ErrorState` with the App Router `reset` as the retry handler   |
| Not found | `(app)/not-found.tsx` renders `NotFoundState`; detail routes call `notFound()` on a missing or malformed id |

Nested sub-section empties (a track list inside a playlist detail card, the admin checkpoint table) use a plain `text-sm` `--fg-muted` line rather than the full panel, so the panel stays reserved for a route's primary empty.

### 10.5 Copy

- Title: a short noun phrase naming what is absent (`No playlists yet`, `Not enough listens yet`). Sentence case, no trailing period.
- Description: one sentence on why it is empty or what to do next. Ends with a period.
- Action: present only when there is a clear next step (open the catalog, create a playlist). Rendered through `buttonVariants` so a `Link` matches the secondary button.
- Error copy stays generic (`Something went wrong`) and never leaks the thrown message.
- Not-found copy avoids blame and offers a route back.

---

## 11. Do / Do not

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
- Replace Lucide with another icon set for any single icon. Use the custom equalizer (§8.7) as the only exception.
- Use stroke widths other than 2 for Lucide icons.
- Introduce a "quieter" single-accent variant as a fallback. The system is multi-hue or it is not Statify.
- Use emoji as UI icons.
- Render a placeholder image, stock photo, generic gradient, or third-party-sourced sample anywhere. Real media or the null-fallback.
- Add a new dependency, family, hue, or scale step without an ADR. The token surface is the contract.

---

## 12. Token surface summary (for P6-M3)

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
--color-chart-series-{0..7}, --color-chart-axis, --color-chart-grid, --color-chart-tooltip-{bg|fg|border}, --color-chart-heatmap-{0..4}, --color-chart-divergent-{neg-2|neg-1|zero|pos-1|pos-2}

/* §2 typography */
--font-{sans|mono}, plus the size/lh/tracking/weight values embedded in @utility text-{micro|xs|sm|base|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl}

/* §3 spacing */
--space-{0|px|0.5|1|1.5|2|3|4|5|6|8|10|12|16|20|24|32|40|48}, --container-{narrow|prose|wide|full|bleed}

/* §4 radius */
--radius-{none|xs|sm|md|lg|xl|2xl|full}

/* §5 shadow */
--shadow-{none|xs|sm|md|lg|xl}

/* §6 motion */
--duration-{instant|fast|base|slow|slower|stagger|equalizer}, --ease-{linear|out|in|standard|spring}, plus @keyframes for animate-{fade-in|fade-out|slide-in-*|scale-in|scale-out|block-reveal|row-stagger|pulse-eq|skeleton-pulse|spinner}

/* §7 image */
--aspect-{square|wide|cinema|artist|thumb}, --cover-{xs|sm|md|lg|xl|hero|display}

/* §8 icon */
--icon-{xs|sm|md|lg|xl}
```

Every token in this file appears as exactly one CSS variable. Any drift between this file and `globals.css` is a bug.

---

## 13. Contrast Table

Checked 2026-05-25 against `apps/web/src/app/globals.css` using the WCAG relative-luminance contrast formula. Ratios below are text-to-background unless noted. Section rows report the lowest ratio across all routed section hues.

| Pair / role                                 | Light ratio | Dark ratio | Result                                                      |
| ------------------------------------------- | ----------- | ---------- | ----------------------------------------------------------- |
| `--fg-default` on `--surface-page`          | 14.88:1     | 16.28:1    | AA                                                          |
| `--fg-default` on `--surface-raised`        | 15.10:1     | 13.80:1    | AA                                                          |
| `--fg-muted` on `--surface-work`            | 6.54:1      | 6.78:1     | AA                                                          |
| `--fg-muted` on `--surface-sunken`          | 5.82:1      | 7.53:1     | AA                                                          |
| `--fg-strong` on `--surface-work`           | 18.81:1     | 17.34:1    | AA                                                          |
| `--color-chart-tooltip-fg` on tooltip bg    | 15.10:1     | 13.80:1    | AA                                                          |
| `--color-state-success-fg` on success bg    | 5.86:1      | 5.86:1     | AA                                                          |
| `--color-state-warning-fg` on warning bg    | 5.07:1      | 5.07:1     | AA                                                          |
| `--color-state-error-fg` on error bg        | 6.83:1      | 6.83:1     | AA                                                          |
| `--color-state-info-fg` on info bg          | 5.50:1      | 5.50:1     | AA                                                          |
| `--color-state-active-fg` on active bg      | 6.27:1      | 6.27:1     | AA                                                          |
| `--color-section-block-fg` on section block | 6.10:1      | 6.70:1     | AA                                                          |
| `--color-section-accent-fg` on accent bg    | 6.10:1      | 6.70:1     | AA                                                          |
| `--color-section-accent` as text on work    | 6.27:1      | 6.25:1     | AA                                                          |
| `--fg-default` on section row hover         | 14.05:1     | 13.97:1    | AA                                                          |
| `--fg-muted` on section row hover           | 5.91:1      | 6.23:1     | AA                                                          |
| `--ring-focus` against page surface         | 6.01:1      | 6.70:1     | visible focus indicator                                     |
| `--fg-faint` on `--surface-work`            | 3.11:1      | 3.73:1     | Disabled / placeholder only; not used as required body text |
