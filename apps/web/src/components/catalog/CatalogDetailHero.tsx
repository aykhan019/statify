import Image from 'next/image';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Cover, coverSrc, type EntityKind } from '@/components/ui/Cover';
import { cn } from '@/lib/utils/cn';

interface CatalogDetailHeroProps {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  entity: Extract<EntityKind, 'track' | 'artist' | 'album'>;
  eyebrow: string;
  imageUrl: string | null;
  meta: ReactNode;
  title: string;
}

const ENTITY_BADGE: Record<CatalogDetailHeroProps['entity'], 'track' | 'artist' | 'album'> = {
  album: 'album',
  artist: 'artist',
  track: 'track',
};

export function CatalogDetailHero({
  actions,
  children,
  className,
  entity,
  eyebrow,
  imageUrl,
  meta,
  title,
}: CatalogDetailHeroProps) {
  if (entity === 'artist') {
    return (
      <section
        className={cn(
          'overflow-hidden rounded-(--radius-lg) bg-section-tint text-fg-default',
          className,
        )}
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          <ArtistHeroImage imageUrl={imageUrl} name={title} />
          <HeroCopy
            actions={actions}
            entity={entity}
            eyebrow={eyebrow}
            meta={meta}
            title={title}
            className="p-6 lg:p-8"
          >
            {children}
          </HeroCopy>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'grid gap-6 rounded-(--radius-lg) bg-section-tint p-4 sm:p-6 lg:grid-cols-[minmax(16rem,0.38fr)_1fr] lg:items-center lg:p-8',
        className,
      )}
    >
      <Cover
        src={imageUrl}
        name={title}
        entity={entity}
        size="display"
        context="hero"
        responsive
        className="mx-auto w-full lg:mx-0"
      />
      <HeroCopy actions={actions} entity={entity} eyebrow={eyebrow} meta={meta} title={title}>
        {children}
      </HeroCopy>
    </section>
  );
}

function HeroCopy({
  actions,
  children,
  className,
  entity,
  eyebrow,
  meta,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  entity: CatalogDetailHeroProps['entity'];
  eyebrow: string;
  meta: ReactNode;
  title: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <Badge variant={ENTITY_BADGE[entity]}>{eyebrow}</Badge>
      <h2 className="mt-4 text-3xl font-extrabold text-fg-strong text-balance sm:text-4xl">
        {title}
      </h2>
      <div className="mt-3 text-base text-fg-muted">{meta}</div>
      {children !== undefined && <div className="mt-5 text-sm text-fg-default">{children}</div>}
      {actions !== undefined && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

function ArtistHeroImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <div className="bg-section-frame p-2">
      <div
        className="relative grid size-full min-h-72 place-items-center overflow-hidden rounded-(--radius-md)"
        style={{ aspectRatio: 'var(--aspect-artist)' }}
      >
        {imageUrl === null ? (
          <div className="grid size-full place-items-center bg-section-frame text-fg-on-block">
            <span className="text-7xl font-extrabold">{firstLetterFor(name)}</span>
          </div>
        ) : (
          <>
            <Image
              src={coverSrc(imageUrl, 1000)}
              alt={name}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundColor: 'color-mix(in oklch, var(--color-section-frame) 20%, transparent)',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

const FALLBACK_LEADING_ARTICLES = /^(?:the|a|an)\s+/i;

function firstLetterFor(name: string): string {
  const stripped = name.replace(FALLBACK_LEADING_ARTICLES, '').trim();
  return (stripped[0] ?? '?').toUpperCase();
}
