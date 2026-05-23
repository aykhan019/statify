'use client';

import { useEffect, useRef } from 'react';
import { recordPlay } from '@/lib/history/api';
import { usePlayerStore } from './player-store';

export function PlayHistoryReporter() {
  const reportedRef = useRef<{ trackId: number; key: string } | null>(null);

  useEffect(() => {
    return usePlayerStore.subscribe((state, previousState) => {
      const becamePlaying = state.status === 'playing' && previousState.status !== 'playing';
      const trackChanged =
        state.track !== null &&
        (previousState.track === null || state.track.trackId !== previousState.track.trackId);

      if (!state.track) {
        return;
      }
      if (!becamePlaying && !trackChanged) {
        return;
      }
      if (state.track.previewUrl === null) {
        return;
      }
      if (reportedRef.current?.trackId === state.track.trackId) {
        return;
      }

      const key = buildIdempotencyKey(state.track.trackId);
      reportedRef.current = { trackId: state.track.trackId, key };

      void recordPlay(
        {
          trackId: state.track.trackId,
          source: 'preview',
          durationPlayedMs: state.track.durationMs,
        },
        { idempotencyKey: key },
      ).catch(() => {
        reportedRef.current = null;
      });
    });
  }, []);

  return null;
}

function buildIdempotencyKey(trackId: number): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now()}`;
  return `play-${trackId}-${random}`;
}
