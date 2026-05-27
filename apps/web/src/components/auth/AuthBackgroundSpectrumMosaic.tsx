'use client';

import { useMemo } from 'react';

/**
 * Alternate auth backdrop: tilted album-tile mosaic behind, animated
 * equalizer bars at the foot of the canvas, shared violet/indigo/teal
 * glow blobs. Drop-in replacement for `AuthBackground` — same outer
 * signature, no props required.
 *
 * To use:
 *   // in apps/web/src/app/(auth)/layout.tsx
 *   import { AuthBackgroundSpectrumMosaic as AuthBackground }
 *     from '@/components/auth/AuthBackgroundSpectrumMosaic';
 *
 * 'use client' is required: the animated bars + tiles use CSS animations
 * that run continuously and the component memoises a deterministic tile
 * grid.
 */
export function AuthBackgroundSpectrumMosaic() {
  const tiles = useMemo(buildTiles, []);
  const bars = useMemo(buildBars, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="auth-background"
    >
      {/* Base gradient. Dark in either theme so the form pops. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, var(--color-indigo-900) 0%, var(--surface-sunken) 60%, var(--surface-page) 100%)',
        }}
      />

      {/* Soft color glows. */}
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

      {/* Tilted album mosaic. Rotated/scaled so the tile grid bleeds off
          every edge — no straight horizon line. */}
      <div
        className="absolute inset-0"
        style={{
          transform: 'rotate(-12deg) scale(1.45)',
          transformOrigin: 'center',
          opacity: 0.85,
        }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="absolute motion-reduce:!animate-none"
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: 88,
              height: 88,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${tile.start}, ${tile.end})`,
              boxShadow: `0 18px 40px -10px color-mix(in oklch, ${tile.end} 50%, transparent)`,
              animation: `statify-tile-float 8s ease-in-out ${tile.delay}s infinite alternate`,
            }}
          >
            {/* Tiny waveform glyph inside each tile. */}
            <div
              className="absolute bottom-3 left-3 right-3 flex items-end gap-[2px]"
              style={{ height: 16 }}
            >
              {[6, 10, 7, 13, 8, 11, 6, 9, 7].map((h, j) => (
                <div key={j} className="flex-1 rounded-[1px] bg-white/55" style={{ height: h }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mid-vignette so the spectrum bars stand out + form stays legible. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 55%, var(--color-overlay-strong, oklch(0.13 0.004 265 / 0.35)) 0%, oklch(0.13 0.004 265 / 0.7) 70%, oklch(0.13 0.004 265 / 0.85) 100%)',
        }}
      />

      {/* Spectrum bars across the bottom. */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end gap-[3px] px-7"
        style={{ height: 360 }}
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-full opacity-55 motion-reduce:!animate-none motion-reduce:!scale-100"
            style={{
              height: `${Math.round(20 + bar.amp * 220)}px`,
              background:
                'linear-gradient(180deg, var(--color-violet-200) 0%, var(--color-indigo-500) 55%, transparent 100%)',
              transformOrigin: 'bottom',
              animation: `statify-bar-pulse 2.4s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes statify-tile-float {
          from { transform: translateY(-8px); }
          to   { transform: translateY(8px);  }
        }
        @keyframes statify-bar-pulse {
          from { transform: scaleY(0.6); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

// ─── deterministic generators ────────────────────────────────────────────

interface Tile {
  x: number;
  y: number;
  start: string;
  end: string;
  delay: number;
}

interface Bar {
  amp: number;
  delay: number;
}

function buildTiles(): Tile[] {
  // Use token vars so light/dark mode + section hues swap correctly.
  const palettes: Array<[string, string]> = [
    ['var(--color-violet-500)', 'var(--color-indigo-700)'],
    ['var(--color-teal-500)', 'var(--color-indigo-500)'],
    ['var(--color-magenta-500)', 'var(--color-violet-700)'],
    ['var(--color-green-500)', 'var(--color-teal-500)'],
    ['var(--color-violet-200)', 'var(--color-indigo-500)'],
    ['var(--color-azure-400)', 'var(--color-violet-500)'],
    ['var(--color-teal-200)', 'var(--color-teal-500)'],
    ['var(--color-indigo-200)', 'var(--color-indigo-700)'],
  ];

  const tiles: Tile[] = [];
  const rows = 6;
  const cols = 8;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = (r * cols + c) % palettes.length;
      const offset = (r % 2) * 4;
      const palette = palettes[idx]!;
      tiles.push({
        x: c * 13 + offset - 5,
        y: r * 18 - 5,
        start: palette[0],
        end: palette[1],
        delay: ((r + c) % 5) * 0.6,
      });
    }
  }
  return tiles;
}

function buildBars(): Bar[] {
  return Array.from({ length: 80 }, (_, i) => ({
    amp: Math.sin(i * 1.7) * 0.5 + 0.5,
    delay: (i % 8) * 0.12,
  }));
}
