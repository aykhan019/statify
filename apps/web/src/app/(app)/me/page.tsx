import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Compass,
  Headphones,
  Home,
  ListMusic,
  Search,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Container, Surface } from '@/components/layout';
import { SectionBlockHeader, SectionContent } from '@/components/section';
import { DecorativeCoverTile, type DecorativeCoverTone } from '@/components/ui/DecorativeCoverTile';
import { Icon } from '@/components/ui/Icon';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Overview | Statify',
};

const COVER_TONES: DecorativeCoverTone[] = ['indigo', 'magenta', 'teal', 'amber'];

const PRIMARY_ACTIONS = [
  {
    description: 'Pick a preview-ready track and let the player write listening history.',
    href: '/catalog/tracks?hasPreview=true',
    icon: Headphones,
    label: 'Play previews',
  },
  {
    description: 'Search the normalized catalog by artist, album, track, or playlist.',
    href: '/catalog',
    icon: Search,
    label: 'Browse catalog',
  },
  {
    description: 'Open top artists, top tracks, trends, and the listening heatmap.',
    href: '/me/stats',
    icon: BarChart3,
    label: 'View stats',
  },
  {
    description: 'Create, order, and share a playlist built from the catalog.',
    href: '/me/playlists',
    icon: ListMusic,
    label: 'Manage playlists',
  },
];

const INSIGHT_LINKS = [
  { href: '/discover', icon: Compass, label: 'Discover tracks' },
  { href: '/explore/hidden-gems', icon: Sparkles, label: 'Hidden gems' },
  { href: '/me/history', icon: Clock3, label: 'Recent listens' },
  { href: '/me/stats/trending', icon: Activity, label: 'Trending artists' },
];

export default async function OverviewPage() {
  const user = await getServerSession();
  const userName = user?.displayName ?? 'there';
  const actions =
    user?.role === 'admin'
      ? [
          ...PRIMARY_ACTIONS,
          {
            description: 'Review users, ingest jobs, and audit events.',
            href: '/admin',
            icon: Shield,
            label: 'Admin desk',
          },
        ]
      : PRIMARY_ACTIONS;

  return (
    <>
      <SectionBlockHeader
        eyebrow="/me"
        icon={Home}
        title={`Welcome back, ${userName}`}
        description="Start with a track, scan your listening signals, or jump straight into playlist work."
        actions={
          <Link
            href="/catalog/tracks?hasPreview=true"
            className="inline-flex h-11 items-center gap-2 rounded-(--radius-sm) bg-section-block-fg px-4 text-sm font-semibold text-section-accent motion-interactive hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper"
          >
            Play something
            <Icon as={ArrowRight} size="sm" />
          </Link>
        }
      />
      <SectionContent className="space-y-8">
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            as="div"
            tone="raised"
            border="default"
            radius="lg"
            padding="none"
            className="overflow-hidden"
          >
            <div className="grid min-h-full lg:grid-cols-[0.92fr_1.08fr]">
              <div className="p-6 sm:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-section-accent">
                  Listening command
                </p>
                <h2 className="mt-4 text-3xl leading-tight font-extrabold tracking-normal text-fg-strong text-balance">
                  Build history from previews, then let the analytics pages explain the pattern.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-fg-muted">
                  Preview playback, history writes, charts, playlist management, and admin tooling
                  all share the same account session.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <LinkButton href="/me/history" label="History" />
                  <LinkButton href="/me/stats/top-artists" label="Top artists" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-3">
                {COVER_TONES.map((tone, index) => (
                  <DecorativeCoverTile
                    key={`${tone}-${index}`}
                    tone={tone}
                    className="min-h-36 rounded-(--radius-md) border border-section-frame bg-surface-raised"
                  />
                ))}
              </div>
            </div>
          </Surface>

          <Surface
            as="section"
            tone="work"
            border="default"
            radius="lg"
            padding="lg"
            className="flex flex-col gap-4"
          >
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-section-accent">
                Quick routes
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-normal text-fg-strong">
                The next useful screen
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {INSIGHT_LINKS.map((link) => (
                <InlineRoute key={link.href} {...link} />
              ))}
            </div>
          </Surface>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </section>

        <Container size="bleed" gutter="none" centered={false}>
          <section className="grid gap-4 rounded-(--radius-lg) border border-border-default bg-surface-raised p-4 sm:grid-cols-3 sm:p-5">
            <StatBlock label="Best first click" value="Preview" />
            <StatBlock label="Fastest insight" value="Heatmap" />
            <StatBlock label="Most useful admin check" value="Ingest" />
          </section>
        </Container>
      </SectionContent>
    </>
  );
}

function ActionCard({
  description,
  href,
  icon,
  label,
}: {
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-52 flex-col justify-between rounded-(--radius-md) border border-border-default bg-surface-work p-5 motion-interactive hover:border-section-accent hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <span className="grid size-12 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent">
        <Icon as={icon} size="lg" />
      </span>
      <span>
        <span className="block text-xl font-extrabold tracking-normal text-fg-strong">{label}</span>
        <span className="mt-2 block text-sm leading-relaxed text-fg-muted">{description}</span>
      </span>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-section-accent">
        Open
        <Icon as={ArrowRight} size="sm" className="motion-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function InlineRoute({ href, icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-(--radius-sm) border border-border-default bg-surface-raised px-4 py-3 text-sm font-semibold text-fg-default motion-interactive hover:border-section-accent hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <span className="flex items-center gap-3">
        <Icon as={icon} size="md" className="text-section-accent" />
        {label}
      </span>
      <Icon as={ArrowRight} size="sm" className="text-fg-muted" />
    </Link>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center rounded-(--radius-sm) border border-border-strong bg-surface-work px-4 text-sm font-semibold text-fg-default motion-interactive hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      {label}
    </Link>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--radius-md) bg-surface-work p-5">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
        {label}
      </p>
      <p className="mt-3 text-3xl leading-none font-extrabold tracking-normal text-fg-strong">
        {value}
      </p>
    </div>
  );
}
