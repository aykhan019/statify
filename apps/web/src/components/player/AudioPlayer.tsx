'use client';

import { useEffect, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { usePlayerStore } from './player-store';

interface AudioPlayerProps {
  className?: string;
}

const TICK_INTERVAL_MS = 250;

export function AudioPlayer({ className }: AudioPlayerProps) {
  const track = usePlayerStore((state) => state.track);
  const status = usePlayerStore((state) => state.status);
  const positionMs = usePlayerStore((state) => state.positionMs);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const toggle = usePlayerStore((state) => state.toggle);
  const seek = usePlayerStore((state) => state.seek);
  const tick = usePlayerStore((state) => state.tick);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setMuted = usePlayerStore((state) => state.setMuted);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'playing') {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      tick(usePlayerStore.getState().positionMs + TICK_INTERVAL_MS);
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick]);

  if (track === null) {
    return null;
  }

  const isUnavailable = status === 'unavailable' || track.previewUrl === null;

  return (
    <div
      className={cn(
        'bg-surface text-surface-foreground flex items-center gap-4 rounded-lg border p-3 shadow-sm',
        className,
      )}
      role="region"
      aria-label="Audio preview player"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{track.trackName}</p>
        <p className="text-muted-foreground truncate text-xs">{track.artistName}</p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={toggle}
        disabled={isUnavailable}
        aria-label={status === 'playing' ? 'Pause preview' : 'Play preview'}
      >
        {status === 'playing' ? 'Pause' : 'Play'}
      </Button>

      <label className="flex flex-1 items-center gap-2 text-xs">
        <span className="sr-only">Seek</span>
        <input
          type="range"
          min={0}
          max={track.durationMs}
          step={TICK_INTERVAL_MS}
          value={positionMs}
          disabled={isUnavailable}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            seek(Number.parseInt(event.target.value, 10))
          }
          className="w-full accent-(--color-accent)"
          aria-label="Seek position"
        />
        <span aria-live="polite">
          {formatPosition(positionMs)} / {formatPosition(track.durationMs)}
        </span>
      </label>

      <label className="flex w-24 items-center gap-2 text-xs">
        <span className="sr-only">Volume</span>
        <button
          type="button"
          onClick={() => setMuted(!isMuted)}
          className="hover:text-accent"
          aria-pressed={isMuted}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? 'Muted' : 'Vol'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setVolume(Number.parseFloat(event.target.value))
          }
          className="w-full accent-(--color-accent)"
          aria-label="Volume"
        />
      </label>

      {isUnavailable && (
        <span className="text-muted-foreground text-xs" role="status">
          Preview unavailable
        </span>
      )}
    </div>
  );
}

function formatPosition(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
