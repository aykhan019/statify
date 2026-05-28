'use client';

import { useMemo } from 'react';

/**
 * Hero backdrop for the marketing landing page.
 *
 * Visually identical to `AuthBackgroundSpectrumMosaic` (tilted album mosaic
 * + animated EQ bars + glow blobs) but with two differences for marketing
 * use:
 *   1. Wider tile grid (10 cols) to fill 1280px hero width without seams.
 *   2. Bottom fade-to-`--surface-page` so the hero blends into the next
 *      light-themed section.
 *
 * Drop-in: render as a child of any `relative` parent and it will fill it.
 */
export function HeroBackground() {
  const tiles = useMemo(buildTiles, []);
  const bars = useMemo(buildBars, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base gradient. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, oklch(0.16 0.04 270) 0%, oklch(0.2 0.08 270) 45%, oklch(0.22 0.1 300) 100%)',
        }}
      />

      {/* Glow blobs. */}
      <div
        className="absolute left-[8%] top-[12%] size-[34rem] rounded-full opacity-45 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-indigo-500)' }}
      />
      <div
        className="absolute left-[55%] top-[5%] size-[34rem] rounded-full opacity-45 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-violet-500)' }}
      />
      <div
        className="absolute right-[-12rem] top-[55%] size-[28rem] rounded-full opacity-30 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-teal-500)' }}
      />

      {/* Album tile mosaic, rotated to break the horizon. */}
      <div
        className="absolute inset-0 opacity-85"
        style={{ transform: 'rotate(-12deg) scale(1.5)', transformOrigin: 'center' }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="absolute motion-reduce:!animate-none"
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: 96,
              height: 96,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${tile.start}, ${tile.end})`,
              boxShadow: `0 18px 40px -10px color-mix(in oklch, ${tile.end} 50%, transparent)`,
              animation: `statify-tile-float 8s ease-in-out ${tile.delay}s infinite alternate`,
            }}
          >
            <div
              className="absolute bottom-3 left-3 right-3 flex items-end gap-[2px]"
              style={{ height: 16 }}
            >
              {[6, 10, 7, 13, 8, 11, 6, 9].map((h, j) => (
                <div key={j} className="flex-1 rounded-[1px] bg-white/55" style={{ height: h }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mid-vignette to calm the centre so headline + preview cards pop. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 65% 55%, oklch(0.13 0.004 265 / 0.35) 0%, oklch(0.13 0.004 265 / 0.7) 70%, oklch(0.13 0.004 265 / 0.85) 100%)',
        }}
      />

      {/* Spectrum bars at the foot. */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end gap-[3px] px-6"
        style={{ height: 220 }}
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-full opacity-55 motion-reduce:!animate-none motion-reduce:!scale-100"
            style={{
              height: `${14 + bar.amp * 150}px`,
              background:
                'linear-gradient(180deg, var(--color-violet-200) 0%, var(--color-indigo-500) 55%, transparent 100%)',
              transformOrigin: 'bottom',
              animation: `statify-bar-pulse 2.4s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Bottom fade so the next section blends in. */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5] h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--surface-page))',
        }}
      />

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
  const out: Tile[] = [];
  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 10; c += 1) {
      const palette = palettes[(r * 10 + c) % palettes.length]!;
      out.push({
        x: c * 10 + (r % 2) * 3 - 3,
        y: r * 17 - 5,
        start: palette[0],
        end: palette[1],
        delay: ((r + c) % 5) * 0.6,
      });
    }
  }
  return out;
}

function buildBars(): Bar[] {
  return Array.from({ length: 96 }, (_, i) => ({
    amp: Math.sin(i * 1.7) * 0.5 + 0.5,
    delay: (i % 8) * 0.12,
  }));
}
