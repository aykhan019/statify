import { describe, expect, it } from 'vitest';
import { formatDurationMs, formatTrackArtists } from './format';

describe('formatDurationMs', () => {
  it('formats whole minutes', () => {
    expect(formatDurationMs(180_000)).toBe('3:00');
  });

  it('pads seconds with a leading zero', () => {
    expect(formatDurationMs(125_000)).toBe('2:05');
  });

  it('treats invalid values as zero', () => {
    expect(formatDurationMs(Number.NaN)).toBe('0:00');
    expect(formatDurationMs(-1)).toBe('0:00');
  });
});

describe('formatTrackArtists', () => {
  it('joins multiple primary artists with commas', () => {
    expect(
      formatTrackArtists([
        { name: 'A', role: 'primary' },
        { name: 'B', role: 'primary' },
      ]),
    ).toBe('A, B');
  });

  it('appends featured artists with "feat."', () => {
    expect(
      formatTrackArtists([
        { name: 'A', role: 'primary' },
        { name: 'F1', role: 'featured' },
        { name: 'F2', role: 'featured' },
      ]),
    ).toBe('A feat. F1, F2');
  });

  it('returns Unknown when no artists are provided', () => {
    expect(formatTrackArtists([])).toBe('Unknown');
  });
});
