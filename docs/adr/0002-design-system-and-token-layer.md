# ADR-002: Design System and Token Layer

**Project:** Statify, Music Streaming Analytics App
**Date:** 2026-05-24
**Status:** Accepted
**Authors:** Aykhan Ahmadzada (decision owner)
**Supersedes (in part):** ADR-001 §3.8 (frontend styling token sourcing), ADR-001 §3.20 (the "Custom design tokens system; Tailwind config is enough" non-goal).

## 1. Context

ADR-001 §3.8 placed design tokens "once in `tailwind.config.ts`" and §3.20 explicitly listed "Custom design tokens system" under not-doing. Phase 5 shipped the full feature surface under that posture and ended with a single-hue indigo accent on a grayscale neutral ladder, no semantic token layer, no shared icon vocabulary, and no real entity imagery: the existing `apps/web/src/app/globals.css` carries one accent (`oklch(0.55 0.22 264)`) and a four-step gray neutral set, nothing else. The Prisma schema for `Artist`, `Album`, and `Track` has zero image fields; the iTunes adapter resolves `previewUrl` but does not persist any artwork URL.

In Phase 6 (frontend redesign) the project commits to a visually energetic, multi-hue, color-confident system with real album art as a first-class visual element and Lucide React as the single icon vocabulary. P6-M1 picked the **Vivid Workshop** direction (section-as-color: each top-level area of the app owns a hue from a 12-hue palette; the hue propagates to block header, chart series, cover frame, and row hover). The single-hue-on-grayscale posture from §3.8 / §3.20 cannot deliver that intent, and the missing schema fields cannot be fixed without a migration.

## 2. Decision

1. **Establish a fully tokenized design system** in `DESIGN.md` at repo root and encode every token as a CSS variable inside the Tailwind 4 `@theme` block in `apps/web/src/app/globals.css` (landed in P6-M3). Components consume only semantic / aliased tokens; raw palette tokens are reserved for the section / entity / state / chart mappings. No hard-coded hex, font family, px outside the spacing scale, stroke weight, or duration anywhere in `apps/web/src/**`.

2. **Adopt the Vivid Workshop direction.** The full token surface (12-hue raw palette, surface / fg / border / ring semantic layer, 11 section identity hues, 6 entity-type hues, 5 state colors, 8-hue data-viz palette plus sequential and divergent scales, type / spacing / radius / shadow / motion / image / icon scales) is specified in `DESIGN.md` §§1-8.

3. **Lucide React is the single icon library.** Stroke weight locked at 2; enforced via a `<Icon>` wrapper at `apps/web/src/components/ui/icon.tsx` (P6-M3). One exception is allowed: a custom 3-bar equalizer SVG for the currently-playing affordance (Lucide ships no animated equalizer). Any future non-Lucide icon requires an ADR.

4. **`tailwindcss-animate` is the motion engine.** All transitions, dropdown / popover / dialog enter-exit, and the named keyframes in `DESIGN.md` §6.3 are driven by `tailwindcss-animate` utilities. `framer-motion` is opt-in only at P6-M12 if a specific surface needs layout / exit animation that CSS cannot deliver.

5. **Webfonts self-hosted via `next/font/google`.** Bricolage Grotesque (variable) for all UI text. JetBrains Mono (variable) for tabular numerics and identifier-like strings. No remote font CDN. Loaded in `apps/web/src/lib/fonts.ts` (P6-M3) and applied via the `<html>` `className`.

6. **Entity media schema.** A single nullable `image_url` column (`text`) is added to `tracks`, `albums`, and `artists` in P6-M4. Source ranking: iTunes Search API artwork URL stored at one canonical size (`...600x600bb.jpg` after substituting the segment iTunes returns). Render-time helper substitutes `600x600bb.jpg` for `1000x1000bb.jpg` (hero) or `300x300bb.jpg` (list) per the cover size scale in `DESIGN.md` §7.2. Album `image_url` is inherited from the first ingested track of that album. Artist `image_url` stays NULL on ingest because iTunes does not return reliable artist artwork; the UI uses the null-fallback from `DESIGN.md` §7.5 (solid block in the entity-type hue with the artist's first letter at display weight).

7. **Destructive replacement of Phase 5 frontend.** Existing `apps/web/src/app/(app)/**` components are replaced in place as each Phase 6 milestone lands. `dev` will show visual inconsistency between merged and unmerged surfaces during Phase 6. This is accepted (Open Question 2 in the P6-M1 session, answered "(a)").

## 3. Consequences

**Positive**

- The design intent (energetic, multi-hue, identity-bearing) becomes buildable; every screen draws from one source.
- Token changes propagate from `DESIGN.md` → `globals.css` → every component automatically.
- Real album art replaces a missing-imagery story across the app, with a designed fallback rather than a placeholder for the cases where artwork legitimately does not exist (artists, gaps in iTunes coverage).
- Lucide + locked stroke weight removes per-page icon drift that would otherwise creep in across four contributors.
- `tailwindcss-animate` keeps the motion bundle near-zero; `framer-motion` deferral means we do not pay for it until a surface actually needs it.

**Negative**

- Self-hosted variable webfonts add ~80-120 KB to first paint. Subset to Latin only and prefer `display: swap` in `next/font` config to absorb the cost.
- The 12-hue × 8-step raw palette plus the semantic alias layer is more surface than `tailwind.config.ts` carried before; updates that change a hue propagate visibly across every section that uses it.
- §3.8 and §3.20 of ADR-001 are partially superseded; future readers of ADR-001 must read this ADR alongside to get the current posture.
- One iTunes lookup per existing track is required at backfill time (P6-M4) to populate `image_url`. With the existing 20 req/s rate-limit and current row count (~150K tracks at the 10K-playlist subset), the backfill is on the order of ~2 hours of wall time and burns ~140K Neon compute-seconds. Acceptable within the free-tier monthly allowance.
- Per-section hue identity means adding a future top-level section requires either spending the one spare hue (`--hue-lime`) or extending the palette in a new ADR.

## 4. Alternatives Considered

- **Stay with Tailwind defaults / shadcn zinc-slate baseline.** Rejected: single-accent on grayscale is exactly what Phase 6 supersedes; the design intent is unbuildable on this base.
- **Single-accent system with editorial typography (Editorial Dense, P6-M1 Direction 1).** Rejected at the P6-M1 pick: pleasant but the type-led identity competes with album art for the loudest visual element on every list row.
- **Dark-first glow language (Neon Console, P6-M1 Direction 3).** Rejected at the P6-M1 pick: demos well but adds light-mode debt and per-card hue conflict with album art's own hue.
- **Per-entity dominant-color sampling for cover frames.** Rejected for v1: requires storing a derived `dominant_hue` column and an offline sampler at ingest time. Section-as-color delivers most of the energy without the extra ingestion step. Recorded as a stretch consideration only.
- **`framer-motion` as the motion engine from day one.** Rejected: adds ~35 KB gzipped to every page that ships any animation. `tailwindcss-animate` covers the named animations in `DESIGN.md` §6.3 with zero JS.
- **Geist Sans + Geist Mono.** Considered for typography; rejected because Geist's posture overlaps too closely with the Vercel dashboard reference in `docs/design/explorations.md` and Vivid Workshop wants more characterful display behavior. Bricolage Grotesque's variable axis delivers blockier display character at hero sizes while still working as body.
- **Inter + JetBrains Mono.** Rejected: Inter is the safe default and would leave the system feeling generic at the very moment the design intent is asking for identity.
- **Storing iTunes artwork URLs at multiple sizes per row.** Rejected: iTunes encodes size in the URL segment, so storing one canonical URL plus a render-time substitution helper is sufficient and cheaper.
- **Adding a separate artist artwork source (Wikipedia / Last.fm / MusicBrainz).** Deferred. The null-fallback for artists is part of the system and reads as designed, not as broken. If artist art becomes a felt gap during Phase 6 review, a follow-up ADR adds a source.

## 5. Migration

- `apps/web/src/app/globals.css` is rewritten in P6-M3 against the token surface summary in `DESIGN.md` §10. The existing 4-color + 5-radius + 2-font + 3-shadow set is replaced wholesale.
- New deps in `apps/web/package.json` (P6-M3): `lucide-react`, `tailwindcss-animate`, `@radix-ui/*` (set determined by which shadcn primitives the milestone needs), `next/font` is built in. Each addition gets a row in `HANDOFF.md` §3 Structural Changes Log.
- Existing components under `apps/web/src/components/{catalog,playlists,stats,player,admin,history,auth,ui}/` are destructively replaced milestone by milestone (P6-M5 through P6-M11). No backwards-compatibility shim.
- `packages/db/prisma/schema.prisma` gains `image_url String?` on `Artist`, `Album`, `Track` in P6-M4. Migration name: `entity_media`. Backfill script at `packages/db/src/scripts/backfill-media.ts` populates existing rows.
- `apps/web/next.config.js` `images.remotePatterns` allowlists `is*-ssl.mzstatic.com` (iTunes/Apple artwork hosts) in P6-M4. Recorded in the Structural Changes Log.
