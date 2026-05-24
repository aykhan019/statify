import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { PlaylistArtwork } from './PlaylistArtwork';

interface PlaylistHeroProps {
  coverImages: string[];
  eyebrow?: string;
  meta: ReactNode;
  name: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PlaylistHero({
  actions,
  className,
  coverImages,
  description,
  eyebrow = 'Playlist',
  meta,
  name,
}: PlaylistHeroProps) {
  return (
    <section className={cn('overflow-hidden rounded-(--radius-lg) bg-section-block', className)}>
      <div className="relative">
        <PlaylistArtwork coverImages={coverImages} name={name} context="hero" wide />
        <div
          className="absolute inset-x-0 bottom-0 flex min-h-[40%] items-end p-5 text-fg-on-block sm:p-6 lg:p-8"
          style={{
            background: 'linear-gradient(to bottom, oklch(0 0 0 / 0), oklch(0 0 0 / 0.65))',
          }}
        >
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <Badge variant="section" className="mb-3">
                {eyebrow}
              </Badge>
              <h1 className="text-3xl font-extrabold text-balance sm:text-4xl">{name}</h1>
              <div className="mt-2 text-sm font-medium opacity-90 sm:text-base">{meta}</div>
              {description !== undefined && (
                <div className="mt-3 max-w-(--container-prose) text-sm opacity-85">
                  {description}
                </div>
              )}
            </div>
            {actions !== undefined && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
