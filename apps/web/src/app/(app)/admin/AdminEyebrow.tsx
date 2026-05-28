'use client';

import { usePathname } from 'next/navigation';

export function AdminEyebrow() {
  const pathname = usePathname();
  return <>{pathname ?? '/admin'}</>;
}
