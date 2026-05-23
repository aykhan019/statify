'use client';

import { Button } from '@/components/ui/Button';
import { usePlayerStore, type PlayerTrack } from '@/components/player/player-store';

interface PreviewPlayerLauncherProps {
  track: PlayerTrack;
}

export function PreviewPlayerLauncher({ track }: PreviewPlayerLauncherProps) {
  const load = usePlayerStore((state) => state.load);
  const play = usePlayerStore((state) => state.play);
  const currentTrack = usePlayerStore((state) => state.track);
  const status = usePlayerStore((state) => state.status);

  const isUnavailable = track.previewUrl === null;
  const isLoaded = currentTrack?.trackId === track.trackId;
  const isPlaying = isLoaded && status === 'playing';

  const onClick = () => {
    if (isUnavailable) {
      return;
    }
    if (!isLoaded) {
      load(track);
    }
    play();
  };

  if (isUnavailable) {
    return (
      <span
        className="bg-muted text-muted-foreground rounded-(--radius-sm) px-3 py-2 text-sm"
        role="status"
      >
        Preview unavailable
      </span>
    );
  }

  return (
    <Button type="button" onClick={onClick} disabled={isPlaying}>
      {isPlaying ? 'Playing…' : isLoaded ? 'Resume preview' : 'Play preview'}
    </Button>
  );
}
