import Image from 'next/image';
import type { CSSProperties } from 'react';
import { coverSrc, type CoverContext, type CoverSize } from '@/components/ui/Cover';
import { cn } from '@/lib/utils/cn';

interface PlaylistArtworkProps {
  coverImages: string[];
  name: string;
  size?: CoverSize;
  context?: CoverContext;
  wide?: boolean;
  className?: string;
}

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

const FALLBACK_LEADING_ARTICLES = /^(?:the|a|an)\s+/i;

export function PlaylistArtwork({
  className,
  context = 'card',
  coverImages,
  name,
  size = 'lg',
  wide = false,
}: PlaylistArtworkProps) {
  const px = SIZE_PX[size];
  const thickness = FRAME_THICKNESS_PX[context];
  const images = fillCoverGrid(coverImages);
  const style = {
    ['--playlist-frame' as string]: `${thickness}px`,
    ['--playlist-size' as string]: `${px}px`,
    ...(context === 'currently-playing'
      ? {
          boxShadow:
            '0 0 0 var(--playlist-frame) var(--color-section-frame), 0 0 12px 0 color-mix(in oklch, var(--color-section-frame) 25%, transparent)',
        }
      : {}),
  } as CSSProperties;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-(--radius-md) bg-section-frame p-(--playlist-frame)',
        wide
          ? 'aspect-(--aspect-wide) w-full'
          : 'size-(--playlist-size) max-w-full shrink-0 aspect-(--aspect-square)',
        className,
      )}
      style={style}
      role="img"
      aria-label={name}
    >
      {images.length === 0 ? (
        <div className="grid size-full place-items-center rounded-[calc(var(--radius-md)-var(--playlist-frame))] bg-section-frame text-fg-on-block font-extrabold">
          <span className={wide ? 'text-5xl' : 'text-4xl'}>{firstLetterFor(name)}</span>
        </div>
      ) : (
        <div className="grid size-full grid-cols-2 overflow-hidden rounded-[calc(var(--radius-md)-var(--playlist-frame))]">
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="relative">
              <Image
                src={coverSrc(imageUrl, px * 2)}
                alt=""
                fill
                sizes={wide ? '(min-width: 1024px) 60vw, 100vw' : `${px}px`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fillCoverGrid(coverImages: string[]): string[] {
  const unique = Array.from(new Set(coverImages.filter(Boolean))).slice(0, 4);
  if (unique.length === 0) {
    return [];
  }

  return Array.from({ length: 4 }, (_, index) => unique[index % unique.length]!);
}

function firstLetterFor(name: string): string {
  const stripped = name.replace(FALLBACK_LEADING_ARTICLES, '').trim();
  return (stripped[0] ?? '?').toUpperCase();
}
