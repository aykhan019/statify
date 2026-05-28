import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { Container } from '@/components/layout';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

export interface P2PageHeroProps {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow: ReactNode;
  icon?: LucideIcon;
  title: ReactNode;
  className?: string;
}

export function P2PageHero({
  actions,
  description,
  eyebrow,
  icon,
  title,
  className,
}: P2PageHeroProps) {
  return (
    <header
      className={cn(
        'relative isolate overflow-hidden text-white motion-block-reveal',
        'shadow-[0_18px_50px_-22px_color-mix(in_oklch,var(--section-hue-500)_80%,transparent)]',
        '[background:linear-gradient(135deg,color-mix(in_oklch,var(--section-hue-700)_92%,transparent),color-mix(in_oklch,var(--section-hue-500)_70%,transparent))]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            'radial-gradient(60% 80% at 80% 0%, color-mix(in oklch, var(--section-hue-200) 35%, transparent), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-10 size-[220px] rounded-full"
        style={{
          background: 'color-mix(in oklch, var(--color-teal-500) 22%, transparent)',
          filter: 'blur(28px)',
        }}
      />
      <Container size="wide" gutter="page" className="relative py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-(--container-prose)">
            {eyebrow !== undefined && (
              <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] opacity-82">
                {eyebrow}
              </p>
            )}
            <div className="flex items-start gap-3">
              {icon !== undefined && (
                <span className="grid size-9 shrink-0 place-items-center rounded-(--radius-sm) bg-white/14 text-current">
                  <Icon as={icon} size="md" />
                </span>
              )}
              <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-4xl">
                {title}
              </h1>
            </div>
            {description !== undefined && (
              <p className="mt-3 max-w-(--container-narrow) text-sm leading-relaxed opacity-82 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions !== undefined && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </Container>
    </header>
  );
}

export function P2GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-(--radius-lg) border border-border-default/80 bg-surface-work/88 shadow-[0_22px_60px_-44px_color-mix(in_oklch,var(--section-accent)_55%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-surface-work/76',
        className,
      )}
      {...props}
    />
  );
}

export function P2StatTile({
  caption,
  className,
  delta,
  label,
  value,
}: {
  caption?: ReactNode;
  className?: string;
  delta?: number | string;
  label: ReactNode;
  value: ReactNode;
}) {
  const deltaLabel = typeof delta === 'number' ? `${delta > 0 ? '+' : ''}${delta}%` : delta;

  return (
    <P2GlassPanel className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-fg-muted uppercase">
          {label}
        </p>
        {deltaLabel !== undefined && (
          <span className="rounded-full border border-section-frame/35 bg-section-tint px-2 py-0.5 text-xs font-semibold text-section-accent">
            {deltaLabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl leading-none font-extrabold tracking-tight text-fg-strong">
        {value}
      </p>
      {caption !== undefined && <p className="mt-2 text-sm text-fg-muted">{caption}</p>}
    </P2GlassPanel>
  );
}

export function P2RouteCard({
  description,
  href,
  icon,
  meta,
  title,
}: {
  description: ReactNode;
  href: string;
  icon: LucideIcon;
  meta?: ReactNode;
  title: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block min-h-full rounded-(--radius-lg) border border-border-default bg-surface-work/88 p-5 shadow-[0_20px_58px_-48px_color-mix(in_oklch,var(--section-accent)_60%,transparent)] backdrop-blur motion-interactive hover:-translate-y-0.5 hover:border-section-frame hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <span className="grid size-12 place-items-center rounded-(--radius-md) border border-section-frame/25 bg-section-tint text-section-accent">
        <Icon as={icon} size="lg" />
      </span>
      <span className="mt-5 block text-xl font-extrabold tracking-tight text-fg-strong">
        {title}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-fg-muted">{description}</span>
      <span className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold text-section-accent">
        <span>{meta ?? 'Open'}</span>
        <Icon as={ArrowRight} size="sm" className="motion-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

const COVER_CLASSES = [
  'from-indigo-400/80 via-violet-500/55 to-magenta-500/45',
  'from-cyan-400/75 via-teal-500/55 to-indigo-500/45',
  'from-amber-400/80 via-coral-500/55 to-pink-500/45',
  'from-green-400/75 via-cyan-500/55 to-violet-500/45',
  'from-magenta-400/80 via-pink-500/55 to-coral-500/45',
];

export function P2MiniCover({ index = 0, label }: { index?: number; label?: string }) {
  return (
    <span
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      className={cn(
        'relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-(--radius-md) border border-white/10 bg-gradient-to-br shadow-inner',
        COVER_CLASSES[index % COVER_CLASSES.length],
      )}
    >
      <span className="absolute inset-2 rounded-full border border-white/20" />
      <span className="absolute -right-3 -bottom-3 size-10 rounded-full bg-white/15" />
    </span>
  );
}

export function P2RankBadge({ rank }: { rank: number }) {
  return (
    <span className="font-mono text-sm font-bold text-fg-faint">
      #{String(rank).padStart(2, '0')}
    </span>
  );
}

export function P2MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-section-frame/25 bg-section-tint px-2.5 py-1 text-xs font-semibold text-section-accent">
      {children}
    </span>
  );
}

export function P2Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-(--radius-lg) border border-border-default bg-surface-raised/80 p-3 backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function P2EmptyWrap({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-(--radius-lg) border border-dashed border-border-strong bg-surface-work/70 p-6">
      {children}
    </div>
  );
}

export interface P2HeroButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'paper' | 'ghost';
  className?: string;
}

export function P2HeroButton({ children, href, variant = 'paper', className }: P2HeroButtonProps) {
  const styles =
    variant === 'paper'
      ? 'bg-white/95 text-section-accent hover:bg-white'
      : 'border border-white/22 bg-white/8 text-white hover:bg-white/16';
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-(--radius-sm) px-4 text-sm font-semibold motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper',
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}
