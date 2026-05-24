import { Shield } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';
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

  return (
    <>
      <SectionBlockHeader
        eyebrow="/admin"
        icon={Shield}
        title="Admin"
        description="Operational tools for account, ingest, and audit workflows."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
