import { describe, expect, it } from 'vitest';
import { mergeCookieHeader } from './session-refresh';

function toJar(header: string): Record<string, string> {
  return Object.fromEntries(header.split('; ').map((pair) => pair.split('=')));
}

describe('mergeCookieHeader', () => {
  it('overlays refreshed values onto the existing cookie header', () => {
    const merged = mergeCookieHeader('sf_access=old; sf_refresh=r1; sf_csrf=c1', [
      'sf_access=new; Path=/; HttpOnly; Max-Age=900; SameSite=Lax',
      'sf_refresh=r2; Path=/; HttpOnly',
      'sf_csrf=c2; Path=/',
    ]);
    const jar = toJar(merged);

    expect(jar.sf_access).toBe('new');
    expect(jar.sf_refresh).toBe('r2');
    expect(jar.sf_csrf).toBe('c2');
  });

  it('adds new cookies while preserving unrelated ones', () => {
    const jar = toJar(mergeCookieHeader('theme=dark', ['sf_access=tok; Path=/']));

    expect(jar.theme).toBe('dark');
    expect(jar.sf_access).toBe('tok');
  });

  it('handles an empty original header', () => {
    const jar = toJar(mergeCookieHeader('', ['sf_access=tok; Path=/']));

    expect(jar.sf_access).toBe('tok');
  });
});
