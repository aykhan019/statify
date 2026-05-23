export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  bool(probability: number): boolean;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };

  const int = (min: number, max: number): number => {
    if (max < min) {
      throw new Error(`Rng.int: max (${max}) must be >= min (${min})`);
    }
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Rng.pick: empty array');
    }
    return items[int(0, items.length - 1)] as T;
  };

  const bool = (probability: number): boolean => {
    return next() < probability;
  };

  return { next, int, pick, bool };
}
