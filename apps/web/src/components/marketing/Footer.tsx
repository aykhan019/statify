import Link from 'next/link';
import { Container } from '@/components/layout';
import { StatifyLogo } from '@/components/brand/StatifyLogo';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Stack', href: '/#stack' },
      { label: 'Demo path', href: '/#demo' },
    ],
  },
  {
    heading: 'Team',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'GitHub', href: 'https://github.com/aykhan019/statify', external: true },
      {
        label: 'License',
        href: 'https://github.com/aykhan019/statify/blob/main/LICENSE',
        external: true,
      },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Create account', href: '/signup' },
    ],
  },
] as const;

/**
 * Marketing footer. Lives at the bottom of `/` (and any other page that
 * imports it). Brand block on the left, three link columns on the right,
 * legal line under both.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface-sunken py-16">
      <Container size="wide" gutter="page">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          {/* Brand block */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-fg-strong">
              <StatifyLogo size={36} />
              <span className="text-2xl font-bold tracking-tight">Statify</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
              Music streaming analytics built on the Spotify Million Playlist Dataset. Previews from
              iTunes, artwork from Spotify, analytics from hand-written SQL.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
                  {col.heading}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...('external' in link && link.external
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="text-sm text-fg-muted motion-colors hover:text-fg-strong"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border-default pt-6 text-xs text-fg-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Statify · MIT License</span>
          <span>COMP306 · Koç University</span>
        </div>
      </Container>
    </footer>
  );
}
