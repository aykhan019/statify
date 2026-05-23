import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('returns a deterministic sequence for a given seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const aSeq = Array.from({ length: 8 }, () => a.next());
    const bSeq = Array.from({ length: 8 }, () => b.next());
    expect(aSeq).toEqual(bSeq);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1).next();
    const b = createRng(2).next();
    expect(a).not.toBe(b);
  });

  it('int stays within the inclusive bounds', () => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i += 1) {
      const value = rng.int(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it('pick returns one of the given items', () => {
    const rng = createRng(7);
    const items = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 50; i += 1) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it('pick throws on an empty array', () => {
    const rng = createRng(7);
    expect(() => rng.pick([])).toThrow(/empty array/);
  });

  it('int throws when max < min', () => {
    const rng = createRng(7);
    expect(() => rng.int(5, 4)).toThrow(/max .* must be >= min/);
  });
});
