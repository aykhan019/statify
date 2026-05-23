import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border border-b">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Statify
          </Link>
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
