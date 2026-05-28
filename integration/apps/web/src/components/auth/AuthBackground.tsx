import { useMemo } from 'react';

interface AuthBackgroundProps {
  /** Pseudo-random seed; same seed = same star pattern across renders. */
  seed?: number;
  /** Star count. */
  density?: number;
  /** Maximum distance (0–100, unitless on the 100×100 viewBox) below which
   *  two stars get connected by an edge. */
  linkDistance?: number;
}

/**
 * Constellation backdrop for the auth route.
 *
 * - Renders as an absolutely-positioned layer (consumer wraps it).
 * - Pure SVG; deterministic via seeded RNG so SSR and CSR agree (no hydration
 *   mismatch) and so the pattern is stable between visits.
 * - Colors reference design tokens — adapts to indigo/violet/teal section
 *   hues and works in both color schemes.
 *
 * Swap suggestions for other directions explored in the design canvas:
 *   - "Ribbons":   replace <svg> contents with cubic SVG paths tinted with
 *                  --color-violet-500 / --color-indigo-500 / --color-teal-500.
 *   - "Spectrum":  array of <rect>s along the bottom with `animate-pulse-eq`.
 *   - "Mosaic":    rotated grid of <rect> album-tile divs.
 */
export function AuthBackground({
  seed = 19,
  density = 110,
  linkDistance = 11,
}: AuthBackgroundProps) {
  const { nodes, edges } = useMemo(
    () => buildConstellation(seed, density, linkDistance),
    [seed, density, linkDistance],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="auth-background"
    >
      {/* Base gradient — dark in either theme so the mark and form pop. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, var(--color-indigo-900) 0%, var(--surface-sunken) 55%, var(--surface-page) 100%)',
        }}
      />

      {/* Soft color glow blobs. */}
      <div
        className="absolute -left-32 top-1/3 size-[34rem] rounded-full opacity-40 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-violet-500)' }}
      />
      <div
        className="absolute right-[-12rem] top-12 size-[28rem] rounded-full opacity-30 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-indigo-500)' }}
      />
      <div
        className="absolute bottom-[-10rem] left-1/3 size-[26rem] rounded-full opacity-25 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-teal-500)' }}
      />

      {/* Constellation. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {edges.map((edge, i) => {
          const a = nodes[edge.a]!;
          const b = nodes[edge.b]!;
          return (
            <line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-indigo-200)"
              strokeWidth="0.05"
              opacity={edge.opacity}
            />
          );
        })}
        {nodes.map((node, i) => (
          <circle
            key={`n-${i}`}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.color}
            opacity={node.opacity}
          />
        ))}
      </svg>

      {/* Subtle top/bottom fade for legibility against header/footer chrome. */}
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background: 'linear-gradient(to bottom, var(--surface-page), transparent)',
        }}
      />
    </div>
  );
}

// ── deterministic constellation generator ───────────────────────────────────

interface ConstellationNode {
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
}

interface ConstellationEdge {
  a: number;
  b: number;
  opacity: number;
}

function buildConstellation(seed: number, density: number, linkDistance: number) {
  const rng = mulberry32(seed);
  const palette = [
    'var(--color-indigo-200)',
    'var(--color-violet-200)',
    'var(--color-teal-200)',
    'var(--color-azure-200)',
  ];

  const nodes: ConstellationNode[] = [];
  for (let i = 0; i < density; i += 1) {
    nodes.push({
      x: rng() * 100,
      y: rng() * 100,
      r: 0.15 + rng() * 0.5,
      color: palette[Math.floor(rng() * palette.length)] ?? palette[0]!,
      opacity: 0.45 + rng() * 0.5,
    });
  }

  const edges: ConstellationEdge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < linkDistance) {
        edges.push({
          a: i,
          b: j,
          opacity: Math.max(0, 0.45 - distance * 0.035),
        });
      }
    }
  }

  return { nodes, edges };
}

/** Tiny seeded RNG so SSR + CSR produce identical patterns. */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
