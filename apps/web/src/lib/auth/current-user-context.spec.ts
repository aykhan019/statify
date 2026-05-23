import type { AuthUser } from '@statify/shared';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CurrentUserProvider, useCurrentUser } from './current-user-context';

describe('CurrentUserProvider', () => {
  it('exposes the initial authenticated user', () => {
    const user: AuthUser = {
      id: 1,
      email: 'user@example.com',
      displayName: 'User',
      role: 'user',
    };

    expect(
      renderToString(
        createElement(CurrentUserProvider, {
          initialUser: user,
          children: createElement(Probe),
        }),
      ),
    ).toContain('user@example.com');
  });

  it('exposes a signed-out state', () => {
    expect(
      renderToString(
        createElement(CurrentUserProvider, {
          initialUser: null,
          children: createElement(Probe),
        }),
      ),
    ).toContain('guest');
  });

  it('requires the provider', () => {
    expect(() => renderToString(createElement(Probe))).toThrow(
      'useCurrentUser must be used within CurrentUserProvider',
    );
  });
});

function Probe() {
  const { isAuthenticated, user } = useCurrentUser();

  return createElement('span', null, isAuthenticated ? user?.email : 'guest');
}
