import { describe, expect, it } from 'vitest';
import { getSectionHue, resolveSection } from './section';

describe('section identity resolver', () => {
  it('uses the most specific section prefix for analytics routes', () => {
    expect(resolveSection('/me/stats/top-artists').id).toBe('top-artists');
    expect(resolveSection('/me/stats/top-tracks').id).toBe('top-tracks');
    expect(resolveSection('/me/stats/heatmap').id).toBe('heatmap');
    expect(resolveSection('/me/stats/trending').id).toBe('trending');
  });

  it('resolves app sections from their route prefixes per the hue map', () => {
    expect(getSectionHue('/catalog/tracks')).toBe('magenta');
    expect(getSectionHue('/discover')).toBe('teal');
    expect(getSectionHue('/explore/hidden-gems')).toBe('cyan');
    expect(getSectionHue('/me/history')).toBe('coral');
    expect(getSectionHue('/me/stats/top-artists')).toBe('azure');
    expect(getSectionHue('/me/playlists/12')).toBe('violet');
    expect(getSectionHue('/community/playlists')).toBe('violet');
    expect(getSectionHue('/admin/users')).toBe('amber');
  });

  it('gives Overview indigo and Stats azure, and routes /me/account to account', () => {
    expect(resolveSection('/me/account')).toMatchObject({
      hue: 'indigo',
      id: 'account',
      neutral: false,
    });
    expect(resolveSection('/me/stats')).toMatchObject({
      hue: 'azure',
      id: 'stats',
      neutral: false,
    });
    expect(resolveSection('/me')).toMatchObject({
      hue: 'indigo',
      neutral: false,
    });
  });
});
