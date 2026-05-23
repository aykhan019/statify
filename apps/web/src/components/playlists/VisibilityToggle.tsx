'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { setPlaylistVisibility } from '@/lib/user-playlists/api';

interface VisibilityToggleProps {
  playlistId: number;
  isPublic: boolean;
}

export function VisibilityToggle({ playlistId, isPublic }: VisibilityToggleProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(isPublic);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    const next = !optimistic;
    setOptimistic(next);
    setPending(true);
    setError(null);
    try {
      await setPlaylistVisibility(playlistId, next);
      router.refresh();
    } catch (caught) {
      setOptimistic(!next);
      setError(caught instanceof ApiClientError ? caught.message : 'Could not update visibility.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={optimistic ? 'primary' : 'secondary'}
        onClick={() => void toggle()}
        disabled={pending}
        aria-pressed={optimistic}
      >
        {pending ? 'Saving…' : optimistic ? 'Public · Make private' : 'Private · Make public'}
      </Button>
      {error !== null && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
