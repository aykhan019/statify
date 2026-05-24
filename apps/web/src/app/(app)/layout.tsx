import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getServerSession();

  if (currentUser === null) {
    redirect('/login');
  }

  return (
    <AppShell user={currentUser} includeAdmin={isAdmin(currentUser)}>
      {children}
    </AppShell>
  );
}
