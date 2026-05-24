import { describe, expect, it } from 'vitest';
import { getSectionHue, resolveSection } from './section';

describe('section identity resolver', () => {
  it('uses the most specific section prefix for analytics routes', () => {
    expect(resolveSection('/me/stats/top-artists').id).toBe('top-artists');
    expect(resolveSection('/me/stats/top-tracks').id).toBe('top-tracks');
    expect(resolveSection('/me/stats/heatmap').id).toBe('heatmap');
    expect(resolveSection('/me/stats/trending').id).toBe('trending');
  });

  it('resolves app sections from their route prefixes', () => {
    expect(getSectionHue('/catalog/tracks')).toBe('indigo');
    expect(getSectionHue('/discover')).toBe('green');
    expect(getSectionHue('/explore/hidden-gems')).toBe('teal');
    expect(getSectionHue('/me/history')).toBe('vermilion');
    expect(getSectionHue('/me/playlists/12')).toBe('violet');
    expect(getSectionHue('/community/playlists')).toBe('cyan');
    expect(getSectionHue('/admin/users')).toBe('pink');
  });

  it('keeps account neutral while defaulting unmatched routes to Library', () => {
    expect(resolveSection('/me/account')).toMatchObject({
      hue: 'indigo',
      id: 'account',
      neutral: true,
    });
    expect(resolveSection('/me/stats')).toMatchObject({
      hue: 'indigo',
      id: 'library',
      neutral: false,
    });
  });
});
