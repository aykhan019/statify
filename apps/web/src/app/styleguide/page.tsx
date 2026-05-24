'use client';

import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Disc3,
  Gem,
  Heart,
  History,
  Home,
  Info,
  ListMusic,
  LogOut,
  Mic2,
  Music2,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  Container as LayoutContainer,
  Divider as LayoutDivider,
  Grid as LayoutGrid,
  Section as LayoutSection,
  Spacer as LayoutSpacer,
  Stack as LayoutStack,
  Surface as LayoutSurface,
  type ContainerSize,
  type DividerTone,
  type GridColumns,
  type LayoutGap,
  type SectionSpacing,
  type SectionTone,
  type SpacerSize,
  type SurfaceRadius,
  type SurfaceShadow,
  type SurfaceTone,
} from '@/components/layout';
import {
  Breadcrumbs as NavigationBreadcrumbs,
  NavigationLink,
  SideNavigation,
  getNavigationItems,
  type NavigationLinkDemoState,
} from '@/components/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Cover } from '@/components/ui/Cover';
import { Equalizer } from '@/components/ui/Equalizer';
import { Icon, type IconSize } from '@/components/ui/Icon';

/**
 * Statify design system QA route. Renders every token in DESIGN.md so the
 * team can eyeball drift between the spec and the implementation in
 * apps/web/src/app/globals.css.
 *
 * This route is in-app only. Not linked from production navigation.
 */

const HUES = [
  'coral',
  'amber',
  'lime',
  'green',
  'teal',
  'cyan',
  'azure',
  'indigo',
  'violet',
  'magenta',
  'pink',
  'vermilion',
] as const;
const STEPS = ['50', '100', '200', '400', '500', '600', '700', '900'] as const;

const SECTIONS = [
  { id: 'library', label: 'Library', hue: 'indigo' },
  { id: 'discover', label: 'Discover', hue: 'green' },
  { id: 'top-artists', label: 'Top Artists', hue: 'coral' },
  { id: 'top-tracks', label: 'Top Tracks', hue: 'magenta' },
  { id: 'heatmap', label: 'Heatmap', hue: 'azure' },
  { id: 'trending', label: 'Trending', hue: 'amber' },
  { id: 'hidden-gems', label: 'Hidden Gems', hue: 'teal' },
  { id: 'history', label: 'History', hue: 'vermilion' },
  { id: 'playlists', label: 'Playlists', hue: 'violet' },
  { id: 'community', label: 'Community', hue: 'cyan' },
  { id: 'admin', label: 'Admin', hue: 'pink' },
] as const;

const TYPE_ROLES: Array<{ token: string; size: string; weight: number; role: string }> = [
  { token: 'text-micro', size: '0.6875rem', weight: 600, role: 'Chip text, micro-labels' },
  { token: 'text-xs', size: '0.75rem', weight: 500, role: 'Form hints, captions' },
  { token: 'text-sm', size: '0.875rem', weight: 400, role: 'Secondary body, list rows' },
  { token: 'text-base', size: '1rem', weight: 400, role: 'Default body' },
  { token: 'text-md', size: '1.125rem', weight: 500, role: 'Prominent body' },
  { token: 'text-lg', size: '1.25rem', weight: 600, role: 'h4 / card title' },
  { token: 'text-xl', size: '1.5rem', weight: 600, role: 'h3 / panel title' },
  { token: 'text-2xl', size: '1.875rem', weight: 700, role: 'h2 / page subtitle' },
  { token: 'text-3xl', size: '2.25rem', weight: 700, role: 'h1 / detail hero' },
  { token: 'text-4xl', size: '3rem', weight: 800, role: 'Page hero' },
  { token: 'text-5xl', size: '4rem', weight: 800, role: 'Section block header' },
  { token: 'text-6xl', size: '5.5rem', weight: 800, role: 'Feature stat display' },
  { token: 'text-7xl', size: '7.5rem', weight: 800, role: 'Marquee number' },
];

const SPACING_STEPS: Array<{ token: string; px: number }> = [
  { token: '0', px: 0 },
  { token: 'px', px: 1 },
  { token: '0.5', px: 2 },
  { token: '1', px: 4 },
  { token: '1.5', px: 6 },
  { token: '2', px: 8 },
  { token: '3', px: 12 },
  { token: '4', px: 16 },
  { token: '5', px: 20 },
  { token: '6', px: 24 },
  { token: '8', px: 32 },
  { token: '10', px: 40 },
  { token: '12', px: 48 },
  { token: '16', px: 64 },
  { token: '20', px: 80 },
  { token: '24', px: 96 },
];

const CONTAINER_VARIANTS: ContainerSize[] = ['narrow', 'prose', 'wide', 'full', 'bleed'];
const STACK_GAPS: LayoutGap[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'section'];
const GRID_COLUMNS: GridColumns[] = ['one', 'two', 'three', 'four'];
const SECTION_TONES: SectionTone[] = ['plain', 'tint', 'block', 'sunken'];
const SECTION_SPACING: SectionSpacing[] = ['none', 'sm', 'md', 'lg', 'xl'];
const SURFACE_TONES: SurfaceTone[] = ['page', 'work', 'raised', 'sunken', 'overlay', 'section'];
const SURFACE_RADII: SurfaceRadius[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
const SURFACE_SHADOWS: SurfaceShadow[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];
const DIVIDER_TONES: DividerTone[] = ['default', 'strong', 'section'];
const SPACER_SIZES: SpacerSize[] = [
  '0',
  'px',
  '0.5',
  '1',
  '1.5',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '16',
  '20',
  '24',
  '32',
  '40',
  '48',
];
const NAV_DEMO_ITEMS = getNavigationItems({ includeAdmin: true });
const NAV_DEMO_STATES: NavigationLinkDemoState[] = [
  'default',
  'hover',
  'focus',
  'active',
  'disabled',
];
const NAV_DEMO_PRIMARY_ITEM = NAV_DEMO_ITEMS[0]!;

const RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
const SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const ANIMATIONS = [
  'fade-in',
  'slide-in-top',
  'slide-in-bottom',
  'slide-in-left',
  'slide-in-right',
  'scale-in',
  'block-reveal',
] as const;

const ASPECTS: Array<{ token: string; ratio: string; label: string }> = [
  { token: 'square', ratio: '1 / 1', label: '1:1 album / track cover' },
  { token: 'wide', ratio: '16 / 9', label: '16:9 playlist hero' },
  { token: 'cinema', ratio: '21 / 9', label: '21:9 marketing' },
  { token: 'artist', ratio: '3 / 2', label: '3:2 artist hero' },
  { token: 'thumb', ratio: '4 / 3', label: '4:3 article' },
];

const COVER_SIZES: Array<{
  token: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'display';
  px: number;
}> = [
  { token: 'xs', px: 40 },
  { token: 'sm', px: 56 },
  { token: 'md', px: 80 },
  { token: 'lg', px: 128 },
  { token: 'xl', px: 200 },
  { token: 'hero', px: 320 },
];

const ICON_DEMO = [
  { name: 'Home', cmp: Home },
  { name: 'Search', cmp: Search },
  { name: 'Music2', cmp: Music2 },
  { name: 'Mic2', cmp: Mic2 },
  { name: 'Disc3', cmp: Disc3 },
  { name: 'ListMusic', cmp: ListMusic },
  { name: 'Heart', cmp: Heart },
  { name: 'History', cmp: History },
  { name: 'Compass', cmp: Compass },
  { name: 'TrendingUp', cmp: TrendingUp },
  { name: 'Sparkles', cmp: Sparkles },
  { name: 'Gem', cmp: Gem },
  { name: 'Calendar', cmp: Calendar },
  { name: 'Users', cmp: Users },
  { name: 'Settings', cmp: Settings },
  { name: 'User', cmp: User },
  { name: 'LogOut', cmp: LogOut },
  { name: 'Plus', cmp: Plus },
  { name: 'Trash2', cmp: Trash2 },
  { name: 'Pencil', cmp: Pencil },
  { name: 'Play', cmp: Play },
  { name: 'Pause', cmp: Pause },
  { name: 'SkipBack', cmp: SkipBack },
  { name: 'SkipForward', cmp: SkipForward },
  { name: 'Volume2', cmp: Volume2 },
  { name: 'ChevronRight', cmp: ChevronRight },
  { name: 'ChevronDown', cmp: ChevronDown },
  { name: 'X', cmp: X },
  { name: 'Check', cmp: Check },
  { name: 'AlertTriangle', cmp: AlertTriangle },
  { name: 'AlertCircle', cmp: AlertCircle },
  { name: 'Info', cmp: Info },
  { name: 'CheckCircle2', cmp: CheckCircle2 },
] as const;

const ICON_SIZES: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

// Styleguide-only sample image for the cover frame demo. Real ingest writes
// arrive in P6-M4; this URL is a single iTunes-shaped string used only here.
const SAMPLE_COVER_URL =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/52/4d/65/524d6582-d2fb-04ad-3b3c-0bd1f8b86d35/074646793725.jpg/600x600bb.jpg';

function HuesGrid() {
  return (
    <div className="grid grid-cols-9 gap-1 text-[10px]">
      <div />
      {STEPS.map((s) => (
        <div key={s} className="text-fg-muted text-center font-mono">
          {s}
        </div>
      ))}
      {HUES.map((hue) => (
        <div key={hue} className="contents">
          <div className="text-fg-muted self-center font-mono">{hue}</div>
          {STEPS.map((step) => (
            <div
              key={`${hue}-${step}`}
              className="aspect-square rounded-(--radius-xs)"
              style={{ backgroundColor: `var(--color-${hue}-${step})` }}
              title={`--color-${hue}-${step}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SectionFrameProps {
  hue: string;
  children: React.ReactNode;
}

/** Sets the section CSS variables on the wrapper so descendants pick up the active hue. */
function SectionFrame({ hue, children }: SectionFrameProps) {
  const style = {
    ['--section-block' as string]: `var(--color-${hue}-500)`,
    ['--section-block-fg' as string]: 'var(--fg-on-block)',
    ['--section-tint' as string]: `var(--color-${hue}-50)`,
    ['--section-accent' as string]: `var(--color-${hue}-500)`,
    ['--section-accent-fg' as string]: 'var(--fg-on-block)',
    ['--section-row-hover' as string]: `var(--color-${hue}-50)`,
    ['--section-frame' as string]: `var(--color-${hue}-500)`,
  } as React.CSSProperties;
  return <div style={style}>{children}</div>;
}

function H2({ children, id }: { children: string; id: string }) {
  return (
    <h2 id={id} className="text-fg-strong mt-16 mb-4 text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="text-fg-muted mt-1 mb-6 text-sm">{children}</p>;
}

export default function StyleguidePage() {
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <LayoutContainer
      as="main"
      size="wide"
      gutter="page"
      className="bg-surface-page py-16 text-fg-default"
    >
      <header className="border-border-default border-b pb-12">
        <p className="text-fg-muted font-mono text-xs uppercase tracking-[0.04em]">
          /styleguide — Phase 6 token QA
        </p>
        <h1 className="text-fg-strong mt-2 text-4xl font-extrabold tracking-tight">
          Statify Design System
        </h1>
        <p className="text-fg-muted mt-3 max-w-(--container-narrow) text-base">
          Renders every token from <code className="font-mono">DESIGN.md</code> against the
          implementation in <code className="font-mono">apps/web/src/app/globals.css</code>. Use
          this route to confirm a token change propagated everywhere before merging.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="section">Vivid Workshop</Badge>
          <Badge variant="info">P6-M3</Badge>
          <Badge variant="neutral">stroke 2 locked</Badge>
        </div>
      </header>

      <H2 id="palette">1. Raw hue palette</H2>
      <Caption>12 identity hues × 8 luminance steps = 96 tokens. Spec: DESIGN.md §1.1.</Caption>
      <HuesGrid />

      <H2 id="surfaces">2. Surfaces and foreground</H2>
      <Caption>Mode-dependent. Toggle your OS appearance to verify dark overrides.</Caption>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { token: 'surface-page', label: 'Page' },
          { token: 'surface-work', label: 'Work area' },
          { token: 'surface-raised', label: 'Raised' },
          { token: 'surface-sunken', label: 'Sunken' },
        ].map(({ token, label }) => (
          <div
            key={token}
            className="border-border-default flex h-24 flex-col justify-end rounded-(--radius-md) border p-3"
            style={{ backgroundColor: `var(--${token})` }}
          >
            <span className="text-fg-default font-mono text-xs">--{token}</span>
            <span className="text-fg-muted text-xs">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {['fg-strong', 'fg-default', 'fg-muted', 'fg-faint', 'fg-on-block'].map((token) => (
          <div
            key={token}
            className="border-border-default rounded-(--radius-md) border p-4"
            style={{
              backgroundColor:
                token === 'fg-on-block' ? 'var(--color-indigo-500)' : 'var(--surface-raised)',
            }}
          >
            <p style={{ color: `var(--${token})` }} className="text-base font-semibold">
              Aa
            </p>
            <p style={{ color: `var(--${token})` }} className="mt-1 font-mono text-xs">
              --{token}
            </p>
          </div>
        ))}
      </div>

      <H2 id="sections">3. Section identity</H2>
      <Caption>
        Each top-level route sets these CSS variables on its layout. The Cover, badges, and chart
        series pick up the section's hue.
      </Caption>
      <div className="grid gap-3">
        {SECTIONS.map((s) => (
          <SectionFrame key={s.id} hue={s.hue}>
            <div
              className="flex items-center gap-4 rounded-(--radius-md) p-4"
              style={{ backgroundColor: 'var(--color-section-block)' }}
            >
              <Cover src={null} name={s.label} entity="album" size="sm" inSection />
              <div className="flex-1" style={{ color: 'var(--color-section-block-fg)' }}>
                <p className="font-mono text-xs uppercase tracking-[0.04em] opacity-80">/{s.id}</p>
                <p className="text-xl font-bold">{s.label}</p>
              </div>
              <Badge variant="section">{s.hue}</Badge>
            </div>
          </SectionFrame>
        ))}
      </div>

      <H2 id="entities">4. Entity-type badges</H2>
      <Caption>Used outside section context (global search, mixed lists).</Caption>
      <div className="flex flex-wrap gap-2">
        <Badge variant="track">Track</Badge>
        <Badge variant="artist">Artist</Badge>
        <Badge variant="album">Album</Badge>
        <Badge variant="playlist">Playlist</Badge>
        <Badge variant="genre">Genre</Badge>
        <Badge variant="user">User</Badge>
      </div>

      <H2 id="state">5. State colors</H2>
      <Caption>Anchored to specific hues so they stay consistent across sections.</Caption>
      <div className="grid gap-2">
        {(['success', 'warning', 'error', 'info', 'active'] as const).map((state) => (
          <div
            key={state}
            className="flex items-center gap-3 rounded-(--radius-sm) border px-4 py-3"
            style={{
              backgroundColor: `var(--color-state-${state}-bg)`,
              borderColor: `var(--color-state-${state}-border)`,
              color: `var(--color-state-${state}-fg)`,
            }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.04em]">{state}</span>
            <span className="text-sm">
              --state-{state}-{`{bg|border|fg}`}
            </span>
          </div>
        ))}
      </div>

      <H2 id="dataviz">6. Data-viz palette</H2>
      <Caption>
        Eight series colors. Charts inside a section route shift the section hue to index 0.
      </Caption>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="text-center">
            <div
              className="mb-1 aspect-square rounded-(--radius-sm)"
              style={{ backgroundColor: `var(--color-chart-series-${i})` }}
            />
            <span className="font-mono text-xs">series-{i}</span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-fg-muted mb-2 font-mono text-xs">Heatmap sequential (azure)</p>
        <div className="flex h-10 overflow-hidden rounded-(--radius-sm)">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: `var(--color-chart-heatmap-${i})` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-fg-muted mb-2 font-mono text-xs">
          Divergent (trending negative ↔ positive)
        </p>
        <div className="flex h-10 overflow-hidden rounded-(--radius-sm)">
          {['neg-2', 'neg-1', 'zero', 'pos-1', 'pos-2'].map((step) => (
            <div
              key={step}
              className="flex-1"
              style={{ backgroundColor: `var(--color-chart-divergent-${step})` }}
            />
          ))}
        </div>
      </div>

      <H2 id="type">7. Type scale</H2>
      <Caption>Bricolage Grotesque for UI; JetBrains Mono for tabular numerics.</Caption>
      <div className="space-y-4">
        {TYPE_ROLES.map((r) => (
          <div
            key={r.token}
            className="border-border-default flex items-baseline justify-between gap-4 border-b pb-3"
          >
            <span style={{ fontSize: r.size, fontWeight: r.weight, lineHeight: 1.1 }}>
              The night is still young
            </span>
            <div className="text-right">
              <p className="font-mono text-xs">{r.token}</p>
              <p className="text-fg-muted text-xs">
                {r.size} · {r.weight} · {r.role}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-(--radius-md) border border-border-default bg-surface-raised p-4">
        <p className="text-fg-muted mb-2 font-mono text-xs">Mono / tabular numerics</p>
        <p className="font-mono text-3xl font-medium tabular-nums">12,847 plays · 03:42:18 · #1</p>
      </div>

      <H2 id="spacing">8. Spacing scale</H2>
      <Caption>Base unit 4px. Visualized as horizontal bars.</Caption>
      <div className="space-y-2">
        {SPACING_STEPS.map(({ token, px }) => (
          <div key={token} className="flex items-center gap-4">
            <span className="text-fg-muted w-16 font-mono text-xs">{token}</span>
            <div
              className="bg-section-accent h-3 rounded-(--radius-xs)"
              style={{ width: `${px}px` }}
            />
            <span className="text-fg-faint font-mono text-xs">{px}px</span>
          </div>
        ))}
      </div>

      <H2 id="primitives">9. Layout primitives</H2>
      <Caption>
        P6-M5 primitives consume the DESIGN.md spacing, container, surface, border, radius, and
        shadow tokens.
      </Caption>
      <div className="space-y-8">
        <LayoutSurface tone="work" padding="lg" radius="lg">
          <p className="text-fg-muted mb-3 font-mono text-xs">Container variants</p>
          <div className="space-y-3">
            {CONTAINER_VARIANTS.map((size) => (
              <LayoutContainer
                key={size}
                size={size}
                gutter={size === 'bleed' ? 'none' : 'compact'}
                className="border-border-default rounded-(--radius-sm) border bg-surface-raised py-3"
              >
                <span className="text-fg-muted font-mono text-xs">Container / {size}</span>
              </LayoutContainer>
            ))}
          </div>
        </LayoutSurface>

        <LayoutGrid columns="two" gap="lg">
          <LayoutSurface tone="raised" padding="lg" radius="lg">
            <p className="text-fg-muted mb-3 font-mono text-xs">Stack gaps</p>
            <div className="space-y-4">
              {STACK_GAPS.map((gap) => (
                <div key={gap}>
                  <p className="text-fg-muted mb-2 font-mono text-xs">{gap}</p>
                  <LayoutStack gap={gap}>
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="h-3 rounded-(--radius-xs) bg-section-accent" />
                    ))}
                  </LayoutStack>
                </div>
              ))}
            </div>
          </LayoutSurface>

          <LayoutSurface tone="raised" padding="lg" radius="lg">
            <p className="text-fg-muted mb-3 font-mono text-xs">Grid column steps</p>
            <div className="space-y-4">
              {GRID_COLUMNS.map((columns) => (
                <div key={columns}>
                  <p className="text-fg-muted mb-2 font-mono text-xs">{columns}</p>
                  <LayoutGrid columns={columns} gap="sm">
                    {[0, 1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-12 rounded-(--radius-sm) bg-section-tint ring-1 ring-border-default"
                      />
                    ))}
                  </LayoutGrid>
                </div>
              ))}
            </div>
          </LayoutSurface>
        </LayoutGrid>

        <LayoutSurface tone="work" padding="lg" radius="lg">
          <p className="text-fg-muted mb-3 font-mono text-xs">Section tones and spacing</p>
          <LayoutGrid columns="four" gap="md">
            {SECTION_TONES.map((tone) => (
              <LayoutSection
                key={tone}
                tone={tone}
                spacing="sm"
                container="none"
                className="rounded-(--radius-md) border border-border-default px-4"
              >
                <span className="font-mono text-xs">tone / {tone}</span>
              </LayoutSection>
            ))}
          </LayoutGrid>
          <div className="mt-4 grid gap-3">
            {SECTION_SPACING.map((spacing) => (
              <LayoutSection
                key={spacing}
                tone="tint"
                spacing={spacing}
                container="none"
                className="rounded-(--radius-sm) border border-border-default px-4"
              >
                <span className="text-fg-muted font-mono text-xs">spacing / {spacing}</span>
              </LayoutSection>
            ))}
          </div>
        </LayoutSurface>

        <LayoutSurface tone="work" padding="lg" radius="lg">
          <p className="text-fg-muted mb-3 font-mono text-xs">Surface tones</p>
          <LayoutGrid columns="three" gap="md">
            {SURFACE_TONES.map((tone) => (
              <LayoutSurface
                key={tone}
                tone={tone}
                border={tone === 'overlay' ? 'none' : 'default'}
                radius="md"
                padding="md"
              >
                <span className="font-mono text-xs">tone / {tone}</span>
              </LayoutSurface>
            ))}
          </LayoutGrid>
          <p className="text-fg-muted mt-6 mb-3 font-mono text-xs">Surface radius</p>
          <div className="flex flex-wrap items-end gap-3">
            {SURFACE_RADII.map((radius) => (
              <LayoutSurface
                key={radius}
                tone="raised"
                radius={radius}
                padding="none"
                className="flex size-20 items-end justify-center p-2"
              >
                <span className="font-mono text-xs">{radius}</span>
              </LayoutSurface>
            ))}
          </div>
          <p className="text-fg-muted mt-6 mb-3 font-mono text-xs">Surface shadow</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {SURFACE_SHADOWS.map((shadow) => (
              <LayoutSurface key={shadow} tone="raised" shadow={shadow} padding="md">
                <span className="font-mono text-xs">{shadow}</span>
              </LayoutSurface>
            ))}
          </div>
        </LayoutSurface>

        <LayoutGrid columns="two" gap="lg">
          <LayoutSurface tone="raised" padding="lg" radius="lg">
            <p className="text-fg-muted mb-3 font-mono text-xs">Divider tones</p>
            <LayoutStack gap="md">
              {DIVIDER_TONES.map((tone) => (
                <div key={tone}>
                  <p className="text-fg-muted mb-2 font-mono text-xs">horizontal / {tone}</p>
                  <LayoutDivider tone={tone} />
                </div>
              ))}
              <div className="flex h-20 gap-6">
                {DIVIDER_TONES.map((tone) => (
                  <LayoutStack key={tone} direction="horizontal" gap="sm" align="stretch">
                    <LayoutDivider orientation="vertical" tone={tone} />
                    <span className="text-fg-muted font-mono text-xs">vertical / {tone}</span>
                  </LayoutStack>
                ))}
              </div>
            </LayoutStack>
          </LayoutSurface>

          <LayoutSurface tone="raised" padding="lg" radius="lg">
            <p className="text-fg-muted mb-3 font-mono text-xs">Spacer sizes</p>
            <div className="space-y-2">
              {SPACER_SIZES.map((size) => (
                <div key={size} className="flex items-center gap-3">
                  <span className="text-fg-muted w-12 font-mono text-xs">{size}</span>
                  <LayoutSpacer
                    axis="horizontal"
                    size={size}
                    className="h-3 rounded-(--radius-xs) bg-section-accent"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-end gap-2 overflow-hidden rounded-(--radius-sm) border border-border-default p-3">
              {SPACER_SIZES.map((size) => (
                <LayoutSpacer
                  key={size}
                  size={size}
                  className="w-2 rounded-(--radius-xs) bg-section-tint ring-1 ring-border-default"
                />
              ))}
            </div>
          </LayoutSurface>
        </LayoutGrid>
      </div>

      <H2 id="navigation">10. Navigation system</H2>
      <Caption>
        M6 navigation states use semantic surface, foreground, section, border, and focus tokens.
        Navigation icons are locked to icon-md.
      </Caption>
      <SectionFrame hue="indigo">
        <div className="space-y-8">
          <LayoutGrid columns="two" gap="lg">
            <LayoutSurface tone="work" padding="lg" radius="lg">
              <p className="text-fg-muted mb-3 font-mono text-xs">Navigation link states</p>
              <LayoutStack gap="sm">
                {NAV_DEMO_STATES.map((state) => (
                  <div key={state}>
                    <p className="text-fg-muted mb-2 font-mono text-xs">{state}</p>
                    <NavigationLink item={NAV_DEMO_PRIMARY_ITEM} state={state} />
                  </div>
                ))}
              </LayoutStack>
            </LayoutSurface>

            <LayoutSurface tone="work" padding="lg" radius="lg">
              <p className="text-fg-muted mb-3 font-mono text-xs">Top bar links</p>
              <LayoutSurface
                tone="page"
                border="default"
                radius="md"
                padding="sm"
                className="flex items-center justify-between gap-4"
              >
                <span className="text-fg-strong text-base font-semibold">Statify</span>
                <nav aria-label="Styleguide top navigation" className="flex flex-wrap gap-1">
                  {NAV_DEMO_ITEMS.filter((item) => item.topLevel === true)
                    .slice(0, 4)
                    .map((item) => (
                      <NavigationLink
                        key={item.href}
                        item={item}
                        active={item.href === '/discover'}
                        variant="top"
                      />
                    ))}
                </nav>
              </LayoutSurface>
            </LayoutSurface>
          </LayoutGrid>

          <LayoutGrid columns="two" gap="lg">
            <LayoutSurface tone="raised" padding="lg" radius="lg">
              <p className="text-fg-muted mb-3 font-mono text-xs">Side navigation</p>
              <SideNavigation
                includeAdmin
                activePath="/me/stats/top-artists"
                forceVisible
                className="rounded-(--radius-md) border border-border-default"
              />
            </LayoutSurface>

            <LayoutSurface tone="raised" padding="lg" radius="lg">
              <p className="text-fg-muted mb-3 font-mono text-xs">Mobile panel list</p>
              <LayoutStack gap="xs">
                {NAV_DEMO_ITEMS.slice(0, 5).map((item) => (
                  <NavigationLink
                    key={item.href}
                    item={item}
                    active={item.href === '/me/playlists'}
                    variant="mobile"
                  />
                ))}
              </LayoutStack>
              <p className="text-fg-muted mt-6 mb-3 font-mono text-xs">Breadcrumbs</p>
              <NavigationBreadcrumbs activePath="/catalog/tracks/42" className="mb-0" />
            </LayoutSurface>
          </LayoutGrid>
        </div>
      </SectionFrame>

      <H2 id="radius">11. Radius scale</H2>
      <Caption>Album frames lock at radius-md.</Caption>
      <div className="flex flex-wrap items-end gap-4">
        {RADII.map((r) => (
          <div key={r} className="text-center">
            <div
              className="border-border-default mb-1 size-20 border bg-surface-raised"
              style={{ borderRadius: `var(--radius-${r})` }}
            />
            <span className="font-mono text-xs">{r}</span>
          </div>
        ))}
      </div>

      <H2 id="shadow">12. Shadow scale</H2>
      <Caption>
        Cards default to none; depth comes from block fills. Shadows reserved for floating surfaces.
      </Caption>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {SHADOWS.map((s) => (
          <div
            key={s}
            className="flex h-24 flex-col items-start justify-end rounded-(--radius-md) bg-surface-raised p-3"
            style={{ boxShadow: `var(--shadow-${s})` }}
          >
            <span className="font-mono text-xs">shadow-{s}</span>
          </div>
        ))}
      </div>

      <H2 id="motion">13. Motion</H2>
      <Caption>
        Fire any named animation. Durations and easings live in --duration-* / --ease-* tokens.
        Reduce-motion collapses every transition to 0ms globally.
      </Caption>
      <div className="flex flex-wrap items-start gap-3">
        <Button onClick={() => setPulseKey((k) => k + 1)}>Replay all</Button>
        {ANIMATIONS.map((name) => (
          <div
            key={name + pulseKey}
            className="border-border-default rounded-(--radius-md) border bg-surface-raised p-4"
          >
            <div
              className="bg-section-accent mx-auto mb-2 size-16 rounded-(--radius-sm)"
              style={{ animation: `var(--animate-${name})` }}
            />
            <span className="font-mono text-xs">{name}</span>
          </div>
        ))}
        <div className="border-border-default flex flex-col items-center gap-2 rounded-(--radius-md) border bg-surface-raised p-4">
          <span className="text-state-active-fg">
            <Equalizer size={32} />
          </span>
          <span className="font-mono text-xs">pulse-eq</span>
        </div>
      </div>

      <H2 id="image">14. Image frames</H2>
      <Caption>
        Cover at every size with a real iTunes URL (left) and the null-fallback variant (right).
        Frame thickness varies by context.
      </Caption>
      <div className="space-y-8">
        {SECTIONS.slice(0, 4).map((s) => (
          <SectionFrame key={s.id} hue={s.hue}>
            <div className="rounded-(--radius-md) border border-border-default bg-surface-raised p-4">
              <p className="text-fg-muted mb-3 font-mono text-xs">
                section: <code>{s.label}</code> ({s.hue})
              </p>
              <div className="flex flex-wrap items-end gap-4">
                {COVER_SIZES.map(({ token }) => (
                  <div key={`${s.id}-${token}-real`} className="text-center">
                    <Cover
                      src={SAMPLE_COVER_URL}
                      name={`Sample ${token}`}
                      entity="album"
                      size={token}
                      context="card"
                    />
                    <p className="text-fg-muted mt-1 font-mono text-xs">{token}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                {COVER_SIZES.map(({ token }) => (
                  <div key={`${s.id}-${token}-null`} className="text-center">
                    <Cover
                      src={null}
                      name="Nameless Track"
                      entity="track"
                      size={token}
                      context="card"
                    />
                    <p className="text-fg-muted mt-1 font-mono text-xs">null fallback</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-fg-muted mb-2 font-mono text-xs">currently-playing context</p>
                <Cover
                  src={SAMPLE_COVER_URL}
                  name="Playing"
                  entity="track"
                  size="lg"
                  context="currently-playing"
                />
              </div>
            </div>
          </SectionFrame>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-fg-muted mb-2 font-mono text-xs">Aspect ratios (DESIGN.md §7.1)</p>
        <div className="grid gap-3 md:grid-cols-3">
          {ASPECTS.map((a) => (
            <div
              key={a.token}
              className="border-border-default rounded-(--radius-md) border bg-surface-raised p-3"
            >
              <div
                className="bg-section-accent rounded-(--radius-sm)"
                style={{ aspectRatio: a.ratio }}
              />
              <p className="text-fg-muted mt-2 font-mono text-xs">
                {a.token} — {a.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <H2 id="icons">15. Icon set</H2>
      <Caption>
        Lucide React, stroke 2 locked by the &lt;Icon&gt; wrapper. Sizes from --icon-xs to
        --icon-xl.
      </Caption>
      <div className="space-y-3">
        {ICON_SIZES.map((size) => (
          <div
            key={size}
            className="border-border-default flex flex-wrap items-center gap-3 border-b pb-3"
          >
            <span className="text-fg-muted w-12 font-mono text-xs">{size}</span>
            {ICON_DEMO.map(({ name, cmp }) => (
              <span key={`${size}-${name}`} className="text-fg-default" title={name}>
                <Icon as={cmp} size={size} />
              </span>
            ))}
          </div>
        ))}
      </div>

      <H2 id="buttons">16. Button primitive</H2>
      <Caption>
        Public API unchanged from Phase 5 (variant + size). Internals re-keyed onto the new tokens.
      </Caption>
      <div className="flex flex-wrap gap-3">
        {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) =>
          (['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              <Icon as={Play} size={size === 'lg' ? 'md' : 'sm'} />
              {variant} / {size}
            </Button>
          )),
        )}
      </div>

      <footer className="text-fg-muted border-border-default mt-24 border-t pt-8 font-mono text-xs">
        Spec: DESIGN.md · Implementation: apps/web/src/app/globals.css · Route: /styleguide
      </footer>
    </LayoutContainer>
  );
}
