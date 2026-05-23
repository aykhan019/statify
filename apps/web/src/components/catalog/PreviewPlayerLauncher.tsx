'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usePlayerStore, type PlayerTrack } from '@/components/player/player-store';
import { resolveTrackPreview } from '@/lib/catalog/preview';

interface PreviewPlayerLauncherProps {
  track: PlayerTrack;
}

export function PreviewPlayerLauncher({ track: initialTrack }: PreviewPlayerLauncherProps) {
  const [track, setTrack] = useState<PlayerTrack>(initialTrack);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const load = usePlayerStore((state) => state.load);
  const play = usePlayerStore((state) => state.play);
  const currentTrack = usePlayerStore((state) => state.track);
  const status = usePlayerStore((state) => state.status);

  const isLoaded = currentTrack?.trackId === track.trackId;
  const isPlaying = isLoaded && status === 'playing';
  const previewMissing = track.previewUrl === null;

  const onClick = async () => {
    setResolveError(null);

    let usable = track;

    if (previewMissing) {
      setIsResolving(true);
      try {
        const detail = await resolveTrackPreview(track.trackId);
        if (detail.previewUrl === null) {
          setIsResolving(false);
          setResolveError('Preview unavailable for this track.');
          return;
        }
        usable = { ...track, previewUrl: detail.previewUrl, durationMs: detail.durationMs };
        setTrack(usable);
      } catch {
        setIsResolving(false);
        setResolveError('Could not load preview. Try again.');
        return;
      }
      setIsResolving(false);
    }

    if (!isLoaded) {
      load(usable);
    }
    play();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={onClick} disabled={isPlaying || isResolving}>
        {isResolving
          ? 'Fetching preview…'
          : isPlaying
            ? 'Playing…'
            : isLoaded
              ? 'Resume preview'
              : previewMissing
                ? 'Load preview'
                : 'Play preview'}
      </Button>
      {resolveError !== null && (
        <p className="text-destructive text-sm" role="alert">
          {resolveError}
        </p>
      )}
    </div>
  );
}
