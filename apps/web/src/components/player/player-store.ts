import { create } from 'zustand';

export interface PlayerTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string | null;
  durationMs: number;
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'unavailable';

export interface PlayerState {
  track: PlayerTrack | null;
  status: PlayerStatus;
  positionMs: number;
  volume: number;
  isMuted: boolean;
  load(track: PlayerTrack): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seek(positionMs: number): void;
  tick(positionMs: number): void;
  setVolume(volume: number): void;
  setMuted(isMuted: boolean): void;
  reset(): void;
}

const INITIAL_VOLUME = 0.8;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

function clampVolume(value: number): number {
  if (Number.isNaN(value)) {
    return MIN_VOLUME;
  }
  return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, value));
}

function clampPosition(value: number, durationMs: number): number {
  if (Number.isNaN(value) || value < 0) {
    return 0;
  }
  return Math.min(value, durationMs);
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  status: 'idle',
  positionMs: 0,
  volume: INITIAL_VOLUME,
  isMuted: false,
  load(track) {
    set({
      track,
      status: track.previewUrl === null ? 'unavailable' : 'loading',
      positionMs: 0,
    });
  },
  play() {
    const { track } = get();
    if (track === null || track.previewUrl === null) {
      return;
    }
    set({ status: 'playing' });
  },
  pause() {
    const { status } = get();
    if (status !== 'playing') {
      return;
    }
    set({ status: 'paused' });
  },
  toggle() {
    const { status } = get();
    if (status === 'playing') {
      get().pause();
      return;
    }
    if (status === 'paused' || status === 'loading') {
      get().play();
    }
  },
  seek(positionMs) {
    const { track } = get();
    if (track === null) {
      return;
    }
    set({ positionMs: clampPosition(positionMs, track.durationMs) });
  },
  tick(positionMs) {
    const { track, status } = get();
    if (track === null || status !== 'playing') {
      return;
    }
    set({ positionMs: clampPosition(positionMs, track.durationMs) });
  },
  setVolume(volume) {
    set({ volume: clampVolume(volume), isMuted: false });
  },
  setMuted(isMuted) {
    set({ isMuted });
  },
  reset() {
    set({ track: null, status: 'idle', positionMs: 0 });
  },
}));
