import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export type CoverSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'display';
export type CoverContext = 'list-dense' | 'card' | 'card-hover' | 'hero' | 'currently-playing';
export type EntityKind = 'track' | 'artist' | 'album' | 'playlist' | 'genre' | 'user';

const SIZE_PX: Record<CoverSize, number> = {
  xs: 40,
  sm: 56,
  md: 80,
  lg: 128,
  xl: 200,
  hero: 320,
  display: 480,
};

const FRAME_THICKNESS_PX: Record<CoverContext, number> = {
  'list-dense': 1,
  card: 4,
  'card-hover': 6,
  hero: 8,
  'currently-playing': 6,
};

const ENTITY_FRAME_COLOR: Record<EntityKind, string> = {
  track: 'var(--color-entity-track)',
  artist: 'var(--color-entity-artist)',
  album: 'var(--color-entity-album)',
  playlist: 'var(--color-entity-playlist)',
  genre: 'var(--color-entity-genre)',
  user: 'var(--color-entity-user)',
};

const FALLBACK_LEADING_ARTICLES = /^(?:the|a|an)\s+/i;

function firstLetterFor(name: string): string {
  const stripped = name.replace(FALLBACK_LEADING_ARTICLES, '').trim();
  return (stripped[0] ?? '?').toUpperCase();
}

/**
 * Substitutes the iTunes artwork URL size segment per DESIGN.md §7.2.
 * iTunes URLs end in `...{w}x{h}bb.jpg`; we swap to the requested size.
 */
export function coverSrc(url: string, sizePx: number): string {
  return url.replace(/\d+x\d+bb\.(jpg|png|webp)/i, `${sizePx}x${sizePx}bb.$1`);
}

export interface CoverProps {
  /** iTunes-shaped image URL or null for the designed fallback. */
  src: string | null | undefined;
  /** Display name used for alt text and the fallback letter. */
  name: string;
  /** Entity type drives the fallback hue when outside a section. */
  entity?: EntityKind;
  /** Render size; one of the token scale steps. */
  size?: CoverSize;
  /** Frame thickness context; defaults to `card`. */
  context?: CoverContext;
  /**
   * Whether the frame uses the active section hue (true; default) or the
   * entity-type hue (false). True inside section-scoped layouts; false in
   * global search results and other section-less surfaces.
   */
  inSection?: boolean;
  className?: string;
}

export function Cover({
  src,
  name,
  entity = 'album',
  size = 'md',
  context = 'card',
  inSection = true,
  className,
}: CoverProps) {
  const px = SIZE_PX[size];
  const thickness = FRAME_THICKNESS_PX[context];
  const frameColor = inSection ? 'var(--color-section-frame)' : ENTITY_FRAME_COLOR[entity];
  const fallbackBg = inSection ? 'var(--color-section-frame)' : ENTITY_FRAME_COLOR[entity];

  const wrapStyle = {
    width: `${px}px`,
    height: `${px}px`,
    padding: `${thickness}px`,
    backgroundColor: frameColor,
    borderRadius: 'var(--radius-md)',
    ...(context === 'currently-playing'
      ? {
          boxShadow: `0 0 0 ${thickness}px ${frameColor}, 0 0 12px 0 color-mix(in oklch, ${frameColor} 25%, transparent)`,
        }
      : {}),
  } as const;

  const innerStyle = {
    borderRadius: `calc(var(--radius-md) - ${thickness}px)`,
  } as const;

  if (src) {
    return (
      <div className={cn('inline-block overflow-hidden', className)} style={wrapStyle}>
        <div className="relative size-full overflow-hidden" style={innerStyle}>
          <Image
            src={coverSrc(src, px * 2)}
            alt={name}
            fill
            sizes={`${px}px`}
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('inline-flex items-center justify-center overflow-hidden', className)}
      style={wrapStyle}
      role="img"
      aria-label={name}
    >
      <div
        className="grid size-full place-items-center text-fg-on-block font-semibold"
        style={{
          ...innerStyle,
          backgroundColor: fallbackBg,
          fontSize: `${Math.max(px * 0.45, 16)}px`,
        }}
      >
        {firstLetterFor(name)}
      </div>
    </div>
  );
}
