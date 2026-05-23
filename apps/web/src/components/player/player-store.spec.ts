import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerStore, type PlayerTrack } from './player-store';

const TRACK: PlayerTrack = {
  trackId: 1,
  trackName: 'Track',
  artistName: 'Artist',
  previewUrl: 'https://example.com/preview.m4a',
  durationMs: 30_000,
};

const UNAVAILABLE_TRACK: PlayerTrack = { ...TRACK, previewUrl: null };

function resetStore(): void {
  usePlayerStore.setState({
    track: null,
    status: 'idle',
    positionMs: 0,
    volume: 0.8,
    isMuted: false,
  });
}

describe('player store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('loads a playable track into loading state', () => {
    usePlayerStore.getState().load(TRACK);
    const state = usePlayerStore.getState();
    expect(state.track).toBe(TRACK);
    expect(state.status).toBe('loading');
    expect(state.positionMs).toBe(0);
  });

  it('marks a track without a preview url as unavailable', () => {
    usePlayerStore.getState().load(UNAVAILABLE_TRACK);
    expect(usePlayerStore.getState().status).toBe('unavailable');
  });

  it('toggles between play and pause', () => {
    const { load, toggle } = usePlayerStore.getState();
    load(TRACK);

    toggle();
    expect(usePlayerStore.getState().status).toBe('playing');

    toggle();
    expect(usePlayerStore.getState().status).toBe('paused');

    toggle();
    expect(usePlayerStore.getState().status).toBe('playing');
  });

  it('does not play an unavailable track', () => {
    const { load, play } = usePlayerStore.getState();
    load(UNAVAILABLE_TRACK);
    play();
    expect(usePlayerStore.getState().status).toBe('unavailable');
  });

  it('clamps seek to the track duration', () => {
    const { load, seek } = usePlayerStore.getState();
    load(TRACK);

    seek(-500);
    expect(usePlayerStore.getState().positionMs).toBe(0);

    seek(40_000);
    expect(usePlayerStore.getState().positionMs).toBe(TRACK.durationMs);

    seek(15_000);
    expect(usePlayerStore.getState().positionMs).toBe(15_000);
  });

  it('only advances position when playing', () => {
    const { load, tick, play, pause } = usePlayerStore.getState();
    load(TRACK);

    tick(5_000);
    expect(usePlayerStore.getState().positionMs).toBe(0);

    play();
    tick(5_000);
    expect(usePlayerStore.getState().positionMs).toBe(5_000);

    pause();
    tick(20_000);
    expect(usePlayerStore.getState().positionMs).toBe(5_000);
  });

  it('clamps volume between zero and one and clears mute on volume change', () => {
    const { setVolume, setMuted } = usePlayerStore.getState();

    setMuted(true);
    setVolume(0.5);
    expect(usePlayerStore.getState().volume).toBe(0.5);
    expect(usePlayerStore.getState().isMuted).toBe(false);

    setVolume(2);
    expect(usePlayerStore.getState().volume).toBe(1);

    setVolume(-1);
    expect(usePlayerStore.getState().volume).toBe(0);
  });

  it('reset returns the player to idle', () => {
    const { load, play, reset } = usePlayerStore.getState();
    load(TRACK);
    play();

    reset();
    const state = usePlayerStore.getState();
    expect(state.track).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.positionMs).toBe(0);
  });
});
