import { describe, expect, it } from 'vitest';
import { generateListeningEvents } from './seed-listening-history';

// Deterministic RNG (mulberry32) so distribution assertions are stable.
function seededRng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('generateListeningEvents', () => {
  it('produces the requested number of events referencing only known users and tracks', () => {
    const userIds = [10, 20, 30];
    const trackIds = Array.from({ length: 500 }, (_, index) => index + 1);
    const now = new Date('2026-05-26T00:00:00.000Z');

    const rows = generateListeningEvents({
      events: 2000,
      now,
      poolSize: 100,
      rng: seededRng(42),
      trackIds,
      userIds,
      windowDays: 90,
    });

    expect(rows).toHaveLength(2000);

    for (const row of rows) {
      expect(userIds).toContain(row.userId);
      expect(trackIds).toContain(row.trackId);
      expect(row.source).toBe('seed');
      expect(row.durationPlayedMs).toBeGreaterThanOrEqual(20000);
      expect(row.durationPlayedMs).toBeLessThan(20000 + 220000);
      expect(row.playedAt.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(row.playedAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 90 * 86400000);
    }
  });

  it('concentrates plays on a head of tracks (Zipf), leaving a long tail', () => {
    const trackIds = Array.from({ length: 1000 }, (_, index) => index + 1);
    const rows = generateListeningEvents({
      events: 5000,
      poolSize: 200,
      rng: seededRng(7),
      trackIds,
      userIds: [1],
    });

    const counts = new Map<number, number>();
    for (const row of rows) {
      counts.set(row.trackId, (counts.get(row.trackId) ?? 0) + 1);
    }

    const distinctPlayed = counts.size;
    const max = Math.max(...counts.values());
    const totalPlays = [...counts.values()].reduce((sum, value) => sum + value, 0);

    // Only the pool gets plays, and the busiest track holds a meaningful share.
    expect(distinctPlayed).toBeLessThanOrEqual(200);
    expect(totalPlays).toBe(5000);
    expect(max).toBeGreaterThan(5000 / 200); // far above a uniform spread
  });

  it('returns no rows for non-positive event counts', () => {
    expect(generateListeningEvents({ events: 0, trackIds: [1], userIds: [1] })).toEqual([]);
  });

  it('throws when there are no users or no tracks', () => {
    expect(() => generateListeningEvents({ events: 1, trackIds: [1], userIds: [] })).toThrow(
      /without users/,
    );
    expect(() => generateListeningEvents({ events: 1, trackIds: [], userIds: [1] })).toThrow(
      /without tracks/,
    );
  });
});
