import { Database, Search, Disc3, ListEnd } from 'lucide-react';
import { Container } from '@/components/layout';
import { Icon } from '@/components/ui/Icon';

const ITEMS = [
  { value: '12', label: 'Normalized tables', icon: Database },
  { value: '6', label: 'Advanced SQL queries', icon: Search },
  { value: 'iTunes', label: '30s preview source', icon: ListEnd },
  { value: 'Spotify', label: 'Artwork source', icon: Disc3 },
] as const;

/**
 * Headline numbers from the README in a 4-up card strip. Sits directly
 * under the hero on a light surface; mirrors the SYSTEM_POINTS array
 * the original landing page used.
 */
export function StatsStrip() {
  return (
    <section className="relative z-[4] bg-surface-page">
      <Container size="wide" gutter="page" className="py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-(--radius-lg) border border-border-default bg-surface-work p-5"
            >
              <div
                className="grid size-12 place-items-center rounded-(--radius-md) text-section-accent"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklch, var(--color-violet-500) 8%, transparent), color-mix(in oklch, var(--color-indigo-500) 14%, transparent))',
                }}
              >
                <Icon as={item.icon} size="md" />
              </div>
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
                  {item.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-fg-strong">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
