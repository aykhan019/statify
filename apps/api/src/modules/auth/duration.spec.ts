import { describe, expect, it } from 'vitest';
import { durationToMs } from './duration';

describe('durationToMs', () => {
  it('parses supported duration units', () => {
    expect(durationToMs('15m')).toBe(15 * 60 * 1000);
    expect(durationToMs('30d')).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('rejects unsupported duration values', () => {
    expect(() => durationToMs('1month')).toThrow(/Unsupported duration/);
  });
});
