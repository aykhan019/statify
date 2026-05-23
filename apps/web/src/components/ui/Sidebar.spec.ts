import { describe, expect, it } from 'vitest';
import { isHrefActive } from './Sidebar';

describe('isHrefActive', () => {
  it('returns true for the exact path', () => {
    expect(isHrefActive('/me', '/me')).toBe(true);
  });

  it('returns true for nested paths under the href', () => {
    expect(isHrefActive('/me/history', '/me')).toBe(true);
    expect(isHrefActive('/me/stats/heatmap', '/me/stats')).toBe(true);
  });

  it('returns false for sibling paths that share a prefix', () => {
    expect(isHrefActive('/menu', '/me')).toBe(false);
    expect(isHrefActive('/catalog', '/me')).toBe(false);
  });

  it('returns false for the root href when on a different path', () => {
    expect(isHrefActive('/login', '/me')).toBe(false);
  });
});
