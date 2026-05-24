'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError, Switch } from '@/components/forms';
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
    <div className="flex flex-col items-end gap-1.5">
      <Switch
        checked={optimistic}
        onCheckedChange={() => void toggle()}
        disabled={pending}
        label={optimistic ? 'Public' : 'Private'}
        description={
          optimistic ? 'Anyone can browse this playlist.' : 'Only you can see this playlist.'
        }
      />
      {error !== null && <FormError className="self-end">{error}</FormError>}
    </div>
  );
}
