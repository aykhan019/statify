import type { ReactNode } from 'react';
import { BrandMarkLink } from '@/components/ui/BrandMarkLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

/**
 * Auth shell.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ header (mobile only — desktop has brand panel) │
 *   ├──────────────────┬───────────────────────────┤
 *   │ AuthBrandPanel   │ {children}                │
 *   │ (lg+, on bg)     │ (Card from page.tsx)      │
 *   └──────────────────┴───────────────────────────┘
 *
 * The constellation background spans the full viewport behind both halves.
 * `data-section-hue="indigo"` keeps focus rings, the brand-panel accent,
 * and the form's submit button on the same indigo identity the rest of
 * the auth route already uses.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-section-hue="indigo"
      className="relative isolate min-h-screen bg-[oklch(0.16_0.004_265)] text-[oklch(0.99_0_0)]"
    >
      <AuthBackground />

      {/* Mobile/tablet header (lg breakpoint hides this — brand panel takes over). */}
      <header className="relative z-20 flex h-16 items-center justify-between px-6 lg:hidden">
        <BrandMarkLink href="/" />
        <ThemeToggle />
      </header>

      {/* Theme toggle anchored top-right at lg+ so the brand panel stays clean. */}
      <div className="absolute right-6 top-6 z-30 hidden lg:block">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <AuthBrandPanel />

        <main className="flex items-center justify-center px-4 py-12 sm:px-8 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
