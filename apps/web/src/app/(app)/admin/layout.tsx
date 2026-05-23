import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Admin | Statify',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerSession();

  if (!isAdmin(user)) {
    redirect('/me');
  }

  return <>{children}</>;
}
