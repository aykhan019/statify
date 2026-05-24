# Phase 6, M1: Design Direction Exploration

> Output of Phase 6 milestone 1. Step A captures reference notes for five product surfaces. Step B proposes three Statify directions for Aykhan to choose between. Step C is the decision row at the bottom.
>
> The hard constraints from the design intent apply to every direction in Step B: visually energetic, multi-hue, color-confident, with real album art as a first-class visual element and Lucide React as the single icon library at a locked stroke weight. No direction below is monochrome or single-accent-on-grayscale.

## Step A. Reference notes

Working from product knowledge, no screenshots.

### Linear

- **Typography:** Inter variable, tight tracking, body sits at 13-14px with tabular numerals for issue counts; small-caps section labels.
- **Color:** dominant near-black workspace with an intentional indigo accent for priority and state pills; per-team hue tags carry color weight elsewhere. Status colors (in-progress amber, done green, blocked red) are saturated, not pastel.
- **Spacing:** dense; row height around 32px, generous gutter only at panel edges, no marketing breathing room inside the workspace.
- **Separation:** hairline 1px borders, no shadows on inline surfaces; depth comes from background tint deltas rather than elevation.
- **Vibe:** keyboard-first command surface that treats every pixel as a hotkey target.

### Vercel dashboard

- **Typography:** Geist sans + Geist mono with the mono used as identity rather than just for code, strong weight contrast (400 body, 600 headers), generous line height on body copy.
- **Color:** near-monochrome base with one tonal step between page and card; accents enter via per-project badges and deployment status pills (green / yellow / red / blue). Gradient accents reserved for marketing pages.
- **Spacing:** medium density; cards have visible 16-24px padding, comfortable but not airy.
- **Separation:** card surfaces sit on a darker page with hairline border and a soft hover glow; depth through one or two elevation steps.
- **Vibe:** deploy-aware control panel that treats geometry as identity.

### Stripe dashboard

- **Typography:** SF Pro / system stack with custom-tuned weights, large headline numerics, micro-labels in small-caps; numerals always tabular.
- **Color:** confident multi-hue palette across navigation (each product owns a hue: payments purple, billing teal, connect orange); surface itself stays near-white. Charts use a sequential palette that earns the data-viz weight.
- **Spacing:** medium density; dashboards stack stat cards 3-up at desktop with consistent ~24px gutters, breathing room at section breaks.
- **Separation:** cards float on near-white with a soft drop shadow plus 1px border tint, hover lifts a step; chart areas separated by tints rather than rules.
- **Vibe:** financial control panel that earns trust with hue discipline and numeric craft.

### PostHog

- **Typography:** Matter Sans body with selectively serif display accents, monospace cluster for event / property names; moderate weight contrast, slightly playful tracking at display sizes.
- **Color:** bright primary yellow as identity, often as solid block surfaces rather than just accent; secondary palette of red / blue / green / purple across feature flags / experiments / dashboards. Dark mode swaps to near-black with the same yellow.
- **Spacing:** medium density; willing to spend a full block of color on an empty or onboarding state.
- **Separation:** solid color blocks and bordered cards in equal measure; mixes flat fills with hairline rules without one winning.
- **Vibe:** builder tool with personality, willing to be loud about its identity.

### Resend

- **Typography:** type-forward; large editorial display sizes for hero / docs / empty states, body sits at ~15-16px, mix of sans body and selectively serif display.
- **Color:** two-tone base (deep black + paper white) with one saturated accent (electric blue) used decisively for CTAs, links, and chart highlights; per-status surfaces gain low-saturation tints.
- **Spacing:** airy; large vertical rhythm, willing to give one primary action the full width of a card.
- **Separation:** depth through tint and typography; very few visible borders, no glow effects.
- **Vibe:** editorial product page applied to a control panel.

## Step B. Three Statify direction proposals

All three are energetic, multi-hue, color-confident. All three commit to real album art rendered from `tracks.image_url` / `albums.image_url` (and the agreed null-fallback for artists). All three use Lucide React as the single icon vocabulary at a single locked stroke weight.

---

### Direction 1: Editorial Dense

**Feel.** A type-led control panel built around tabular numbers and confident section identity. The body surface stays near-white in light mode and near-paper-black in dark mode so album art is the loudest color on the page. Hue arrives through _role_ not decoration: each entity type (track / artist / album / playlist / genre) owns a color in a 6-hue identity palette and that hue carries through the entity's badge, the row hover tint, the chart series, and the detail-page header rule. Headlines lean into a display-weight sans with tight tracking; stats are always tabular monospace at 1.5-2x display size so the page reads like a results board. Density is high (track row ~36px), but breathing rooms open up around feature stat blocks and detail-page heroes.

**Closest reference.** Resend's type confidence × Stripe's per-section hue discipline, applied to album-driven content.

**Sharpest tradeoff.** Heaviest typographic commitment of the three. Needs a strong display font and a tabular mono with a real weight axis (e.g. Inter + JetBrains Mono, or Geist + Geist Mono), self-hosted via `next/font`. If we underspec the type scale, the direction collapses into a generic dashboard. Also: hue-by-entity means six identity colors must hold up next to album art, which is itself unpredictably colored.

**Imagery treatment.**

- Aspect ratios: 1:1 album art at sizes `cover-xs 40` / `cover-sm 56` / `cover-md 96` / `cover-lg 160` / `cover-xl 320` / `cover-hero 480`. Artist hero 21:9 with bottom-up gradient holding title contrast. Playlist hero 16:9 with a four-cell collage of member-track covers when the playlist itself has no single image.
- Frame treatment: zero-radius square covers in detail heroes (editorial posture). Rounded `radius-md` covers in list rows and cards.
- Overlays: only on heroes, only as a darkening gradient under the title block; never a color tint on top of album art elsewhere.
- Null fallback: deterministic colored tile generated from a hash of the entity's `id`, drawing from the same 6-hue identity palette; the entity's first letter renders centered in display weight on top of the tile.

**Iconography treatment.**

- Lucide React, stroke `1.5`, sizes `icon-sm 14` (inline-text), `icon-md 18` (controls), `icon-lg 24` (feature / nav).
- Icons sit _beside_ text labels in navigation and section headers; they do not stand alone except on icon-only controls (play, pause, next).
- No filled variants; the type-forward language carries the weight.

---

### Direction 2: Vivid Workshop

**Feel.** Block-driven and loud. Every major section of the app (Top Artists, Discover, Heatmap, Trending, Hidden Gems, Library) lives inside a flat-filled color block whose hue _is_ that section's identity. Section blocks span full-bleed at the top of a route, then surrender to a near-white (light) or deep-charcoal (dark) work area below for the actual data. The same hue then reappears as the chart series color, the active-tab indicator, and the row-hover tint inside that section. Density is mid; cards have visible padding and rounded `radius-lg` corners; chart axes are deemphasized so the hue does the talking. The result feels like a workshop where each room is painted a different color and you always know which room you are in.

**Closest reference.** PostHog's willingness to commit blocks of color × Linear's section-as-identity discipline.

**Sharpest tradeoff.** The section-hue mapping is a system, not a one-off, so adding a new top-level feature later means either committing to a new identity hue (palette grows) or breaking the rule. Also: hue discipline requires that we never let two adjacent sections share a hue, which constrains navigation reorders. Dark mode needs careful luminance work so the block colors stay legible at full saturation against deep charcoal.

**Imagery treatment.**

- Aspect ratios: 1:1 album art at the same six-step cover scale as Direction 1. Artist hero 3:2 with the section block color tinted on top at 18-22% so the album art reads as "section content". Playlist hero 16:9 with the four-cell collage fallback identical to D1.
- Frame treatment: every cover sits inside a 4-6px frame in the active section hue (the frame is the tie-back to the room you're in). Frame radius matches `radius-md`.
- Overlays: section-hue tint on artist heroes only; cards do not tint over album art.
- Null fallback: solid block in the active section hue with the entity's first letter at display weight; if the entity is shown in a list spanning multiple sections (e.g. global search), fall back to the entity-type hue from a six-hue entity palette instead of a section hue.

**Iconography treatment.**

- Lucide React, stroke `2`, sizes `icon-sm 16` (inline), `icon-md 20` (nav), `icon-lg 24` (feature).
- Heavier stroke matches the blocky language. Section header icons render at `icon-lg` inside the section block in white-on-hue.
- Selectively filled: nav active state uses a filled variant; everything else stays stroke.

---

### Direction 3: Neon Console

**Feel.** Dark-first by default. Surface is a deep near-black, the work area is a half-step lighter charcoal, and color arrives as charged saturated _outline_ energy across the whole UI. Every state pill, every chart series, every entity-type tag, every active control pulls from a six-hue data-viz palette that is loud at full saturation against the charcoal floor. Depth language is not shadow and not tint; it is _glow_. Active items get a 1-2px outline in their hue with a soft same-hue blur underneath at 12-20% opacity. The audio player and currently-playing affordance get a thin animated equalizer mark that pulses in the active track's entity hue. Light mode exists but is the demo afterthought, not the default.

**Closest reference.** Linear's dark workspace × the visual charge of Spotify Wrapped end cards, with state-as-glow as the load-bearing depth idiom.

**Sharpest tradeoff.** Dark-first reads great in the demo, but light mode has to hold up too (some graders may have system light mode forced on, and a11y contrast requires both); glow effects amplify the cost of any hue choice that does not hold against the charcoal; album art will sometimes clash with the glow hue around its frame, which is a feature (energy) but can also feel busy on a page with many cards. Per-entity dominant-color sampling (which would let each card's glow match its art) is out of scope for v1; we use a fixed hue per entity type instead.

**Imagery treatment.**

- Aspect ratios: 1:1 album art at the six-step cover scale. Artist hero 2:1 with a bottom-up darkening gradient holding title contrast. Playlist hero 16:9 with the four-cell collage fallback identical to D1 / D2.
- Frame treatment: every cover sits inside a 1px glow frame in the entity-type hue (track / artist / album / playlist / genre each own a hue from the six-hue palette). Hover lifts the glow opacity from ~20% to ~45%. Currently-playing track gets the glow at full intensity with the equalizer overlay in the bottom-right of the cover.
- Overlays: heroes use a darkening gradient only; no color tint over album art.
- Null fallback: a two-stop gradient block in two adjacent hues from the six-hue palette, with the entity's first letter centered in display weight; the same glow frame as a real cover.

**Iconography treatment.**

- Lucide React, stroke `1.75` (between Linear's lightness and Direction 2's weight), sizes `icon-sm 16` (inline), `icon-md 20` (nav), `icon-lg 24` (feature).
- Active states swap to a glow-stroke variant (same stroke weight, plus a same-hue 4px blur at low opacity), driven by a single CSS utility, not a different icon set.
- Currently-playing icon (the equalizer mark) is a custom SVG, not Lucide, because Lucide has no animated equalizer; treated as the single allowed exception and documented in DESIGN.md.

## Step C. Decision

**Picked direction:** Vivid Workshop
**Rationale (one line):** Section-as-color makes hue a structural element rather than decoration, which commits hardest to the multi-hue, color-confident posture, while leaving album art as the loudest variable visual element inside each section's room.
**Decided by:** Aykhan, 2026-05-24.

Recorded in HANDOFF.md Section 2. Next session opens P6-M2 (Author DESIGN.md from this direction).
