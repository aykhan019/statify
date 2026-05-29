'use client';

import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { Cover } from '@/components/ui/Cover';
import { Equalizer } from '@/components/ui/Equalizer';
import { Icon } from '@/components/ui/Icon';
import { formatTrackName } from '@/components/catalog';
import { cn } from '@/lib/utils/cn';
import { usePlayerStore } from './player-store';

interface AudioPlayerProps {
  className?: string;
}

// eslint-disable-next-line complexity
export function AudioPlayer({ className }: AudioPlayerProps) {
  const track = usePlayerStore((state) => state.track);
  const status = usePlayerStore((state) => state.status);
  const positionMs = usePlayerStore((state) => state.positionMs);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const toggle = usePlayerStore((state) => state.toggle);
  const seek = usePlayerStore((state) => state.seek);
  const tick = usePlayerStore((state) => state.tick);
  const pause = usePlayerStore((state) => state.pause);
  const play = usePlayerStore((state) => state.play);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setMuted = usePlayerStore((state) => state.setMuted);
  const reset = usePlayerStore((state) => state.reset);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current === null) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const node = audioRef.current;
    if (node === null || track === null || track.previewUrl === null) return;
    if (status === 'playing') {
      void node.play().catch(() => pause());
    } else {
      node.pause();
    }
  }, [status, track, pause]);

  useEffect(() => {
    const node = audioRef.current;
    if (node === null) return;
    const target = positionMs / 1000;
    if (Math.abs(node.currentTime - target) > 0.5) {
      node.currentTime = target;
    }
  }, [positionMs]);

  if (track === null) return null;

  const isUnavailable = status === 'unavailable' || track.previewUrl === null;
  const isPlaying = status === 'playing';
  const progress = track.durationMs > 0 ? positionMs / track.durationMs : 0;

  return (
    <div
      className={cn(
        'motion-player relative overflow-hidden rounded-(--radius-xl)',
        'border border-border-default/70 shadow-xl',
        'bg-surface-work/88 backdrop-blur supports-[backdrop-filter]:bg-surface-work/76',
        className,
      )}
      role="region"
      aria-label="Audio preview player"
    >
      {track.previewUrl !== null && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            if (status === 'loading') play();
          }}
          onEnded={() => {
            pause();
            seek(track.durationMs);
          }}
          onTimeUpdate={() => {
            if (audioRef.current === null) return;
            tick(Math.round(audioRef.current.currentTime * 1000));
          }}
        />
      )}

      {/* Accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--section-accent), transparent)',
        }}
      />

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Cover art */}
        <Cover
          src={track.imageUrl ?? null}
          name={formatTrackName(track.trackName)}
          entity="track"
          size="sm"
          context="list-dense"
          inSection={false}
          className="shrink-0"
        />

        {/* Track info */}
        <div className="min-w-0 flex-1">
          {isPlaying && (
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-section-accent leading-none">
              <Equalizer size={12} />
              Now playing
            </p>
          )}
          <p
            className={cn(
              'truncate text-sm font-semibold text-fg-strong leading-tight',
              isPlaying && 'mt-1.5',
            )}
          >
            {formatTrackName(track.trackName)}
          </p>
          <p className="truncate text-xs text-fg-muted leading-tight mt-0.5">{track.artistName}</p>
        </div>

        {/* Play / pause */}
        <button
          type="button"
          onClick={toggle}
          disabled={isUnavailable}
          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-full motion-interactive',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
            isUnavailable
              ? 'cursor-not-allowed opacity-40 bg-surface-sunken'
              : 'bg-section-accent text-section-accent-fg hover:opacity-90',
          )}
        >
          <Icon as={isPlaying ? Pause : Play} size="md" />
        </button>

        {/* Seek + time */}
        <div className="hidden min-w-0 flex-[2] flex-col gap-1 sm:flex">
          <label className="flex items-center gap-2">
            <span className="sr-only">Seek</span>
            <input
              type="range"
              min={0}
              max={track.durationMs}
              step={100}
              value={positionMs}
              disabled={isUnavailable}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                seek(Number.parseInt(e.target.value, 10))
              }
              className="w-full cursor-pointer accent-section-accent focus-visible:outline-none"
              aria-label="Seek position"
              aria-valuetext={`${formatPosition(positionMs)} of ${formatPosition(track.durationMs)}`}
            />
          </label>
          <div className="flex justify-between font-mono text-[11px] text-fg-faint tabular-nums">
            <span>{formatPosition(positionMs)}</span>
            <span>{formatPosition(track.durationMs)}</span>
          </div>
        </div>

        {/* Progress dot on mobile */}
        <div
          aria-hidden
          className="hidden h-1 w-16 overflow-hidden rounded-full bg-surface-sunken sm:hidden xs:block"
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${progress * 100}%`, background: 'var(--section-accent)' }}
          />
        </div>

        {isUnavailable && (
          <span className="hidden shrink-0 text-xs text-fg-faint sm:block" role="status">
            No preview
          </span>
        )}

        {/* Volume */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => setMuted(!isMuted)}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="grid size-7 place-items-center rounded-(--radius-xs) text-fg-muted motion-interactive hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
          >
            <Icon as={isMuted ? VolumeX : Volume2} size="sm" />
          </button>
          <label className="flex w-16 items-center">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setVolume(Number.parseFloat(e.target.value))
              }
              className="w-full cursor-pointer accent-section-accent focus-visible:outline-none"
              aria-label="Volume"
            />
          </label>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={reset}
          aria-label="Close player"
          className="grid size-7 shrink-0 place-items-center rounded-(--radius-xs) text-fg-muted motion-interactive hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
        >
          <Icon as={X} size="sm" />
        </button>
      </div>
    </div>
  );
}

function formatPosition(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
