import type { ReactNode } from 'react';
import { BrandMarkLink } from '@/components/ui/BrandMarkLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Container } from '@/components/ui/Container';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-section-hue="indigo"
      className="flex min-h-screen flex-col bg-surface-page text-fg-default"
    >
      <header className="border-b border-border-default bg-surface-page/85 backdrop-blur">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <BrandMarkLink href="/" />
          <ThemeToggle />
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Container size="sm" className="w-full max-w-md">
          {children}
        </Container>
      </main>
    </div>
  );
}
