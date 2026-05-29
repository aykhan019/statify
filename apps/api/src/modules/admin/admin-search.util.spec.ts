import { describe, expect, it } from 'vitest';
import {
  buildScopedFilter,
  idFilterValue,
  parseSearchQuery,
  toPositiveInt,
} from './admin-search.util';

describe('parseSearchQuery', () => {
  it('splits a recognized field qualifier from its value', () => {
    expect(parseSearchQuery('id:1')).toEqual({ field: 'id', value: '1' });
    expect(parseSearchQuery('artist:shakira')).toEqual({ field: 'artist', value: 'shakira' });
  });

  it('lowercases the field and trims the value', () => {
    expect(parseSearchQuery('  Artist:  Shakira  ')).toEqual({ field: 'artist', value: 'Shakira' });
  });

  it('treats a plain string as free text', () => {
    expect(parseSearchQuery('shakira')).toEqual({ field: null, value: 'shakira' });
  });

  it('falls back to free text when the value is empty after the colon', () => {
    expect(parseSearchQuery('id:')).toEqual({ field: null, value: 'id:' });
  });

  it('does not treat a leading-digit token as a qualifier', () => {
    expect(parseSearchQuery('123:abc')).toEqual({ field: null, value: '123:abc' });
  });
});

describe('buildScopedFilter', () => {
  const fields: Record<string, (v: string) => Record<string, unknown>> = {
    id: (v) => ({ id: idFilterValue(v) }),
    name: (v) => ({ name: { contains: v } }),
  };

  it('returns the matching field builder result', () => {
    expect(buildScopedFilter(parseSearchQuery('id:5'), fields)).toEqual({ id: 5 });
    expect(buildScopedFilter(parseSearchQuery('name:abba'), fields)).toEqual({
      name: { contains: 'abba' },
    });
  });

  it('returns null for free text or an unrecognized field', () => {
    expect(buildScopedFilter(parseSearchQuery('abba'), fields)).toBeNull();
    expect(buildScopedFilter(parseSearchQuery('genre:rock'), fields)).toBeNull();
  });
});

describe('idFilterValue', () => {
  it('parses positive ints and sentinels invalid values', () => {
    expect(idFilterValue('5')).toBe(5);
    expect(idFilterValue('abc')).toBe(-1);
    expect(idFilterValue('0')).toBe(-1);
  });
});

describe('toPositiveInt', () => {
  it('accepts positive integers only', () => {
    expect(toPositiveInt('42')).toBe(42);
    expect(toPositiveInt('0')).toBeNull();
    expect(toPositiveInt('-1')).toBeNull();
    expect(toPositiveInt('id:1')).toBeNull();
  });
});
