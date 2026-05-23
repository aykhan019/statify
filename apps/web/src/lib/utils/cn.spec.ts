import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins string values with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('skips null, undefined, and false values', () => {
    expect(cn('a', null, undefined, false, 'b')).toBe('a b');
  });

  it('includes keys from a record when the value is truthy', () => {
    expect(cn('base', { active: true, disabled: false, large: 1 })).toBe('base active large');
  });

  it('flattens nested arrays', () => {
    expect(cn(['a', ['b', null, ['c']], 'd'])).toBe('a b c d');
  });

  it('drops empty strings', () => {
    expect(cn('', 'a', '')).toBe('a');
  });
});
