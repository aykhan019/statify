'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { logoutUser } from '@/lib/auth/api';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onClick = async () => {
    setIsPending(true);

    try {
      await logoutUser();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={isPending}
      aria-label="Log out"
    >
      {isPending ? 'Logging out…' : 'Log out'}
    </Button>
  );
}
