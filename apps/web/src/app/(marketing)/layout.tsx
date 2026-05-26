import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMarkLink } from '@/components/ui/BrandMarkLink';
import { Header } from '@/components/ui/Header';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#demo', label: 'Demo' },
  { href: '/#about', label: 'About' },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        brandLabel={<BrandMarkLink className="-ml-1" />}
        nav={
          <>
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-(--radius-sm) px-3 py-2 text-sm font-medium text-fg-muted hover:bg-section-row-hover hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
              >
                {item.label}
              </Link>
            ))}
          </>
        }
        actions={
          <>
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-(--radius-sm) px-3 py-2 text-sm font-medium text-fg-default hover:bg-section-row-hover"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-(--radius-sm) bg-section-accent px-4 py-2 text-sm font-semibold text-section-accent-fg hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        }
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
