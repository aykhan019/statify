import Link from 'next/link';
import type { ReactNode } from 'react';
import { Header } from '@/components/ui/Header';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        nav={
          <Link
            href="/"
            className="text-foreground hover:text-accent rounded-(--radius-sm) px-3 py-2 text-sm"
          >
            Home
          </Link>
        }
        actions={
          <>
            <Link
              href="/login"
              className="text-foreground hover:bg-muted rounded-(--radius) px-3 py-2 text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-(--radius) px-4 py-2 text-sm font-medium"
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
