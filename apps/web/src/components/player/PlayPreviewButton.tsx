'use client';

import { Loader2, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { resolveTrackPreview } from '@/lib/catalog/preview';
import { usePlayerStore, type PlayerTrack } from './player-store';

interface PlayPreviewButtonProps {
  track: PlayerTrack;
}

/**
 * Compact play/pause control for a track row. Loads the 30s preview into the shared player; if the
 * track has no stored preview it resolves one on demand (iTunes) before playing.
 */
export function PlayPreviewButton({ track: initialTrack }: PlayPreviewButtonProps) {
  const [track, setTrack] = useState<PlayerTrack>(initialTrack);
  const [isResolving, setIsResolving] = useState(false);

  const load = usePlayerStore((state) => state.load);
  const play = usePlayerStore((state) => state.play);
  const toggle = usePlayerStore((state) => state.toggle);
  const currentTrack = usePlayerStore((state) => state.track);
  const status = usePlayerStore((state) => state.status);

  const isLoaded = currentTrack?.trackId === track.trackId;
  const isPlaying = isLoaded && status === 'playing';

  const onClick = async () => {
    if (isLoaded) {
      toggle();
      return;
    }

    let usable = track;

    if (usable.previewUrl === null) {
      setIsResolving(true);
      try {
        const detail = await resolveTrackPreview(track.trackId);
        usable = { ...track, previewUrl: detail.previewUrl, durationMs: detail.durationMs };
        setTrack(usable);
      } catch {
        setIsResolving(false);
        return;
      }
      setIsResolving(false);
    }

    load(usable);
    play();
  };

  const icon = isResolving ? Loader2 : isPlaying ? Pause : Play;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => void onClick()}
      disabled={isResolving}
      aria-label={isPlaying ? `Pause ${track.trackName}` : `Play ${track.trackName}`}
    >
      <Icon as={icon} size="sm" className={isResolving ? 'animate-spin' : undefined} />
    </Button>
  );
}
