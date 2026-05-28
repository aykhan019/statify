import { Shield } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { P2PageHero } from '@/components/p2';
import { SectionContent } from '@/components/section';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';
import { AdminEyebrow } from './AdminEyebrow';

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
      <P2PageHero
        eyebrow={<AdminEyebrow />}
        icon={Shield}
        title="Admin"
        description="Operational tools for account, ingest, and audit workflows."
        className="[background:var(--section-block)]"
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
