import { ErrorCode, HEADERS } from '@statify/shared';
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  it('allows safe methods', () => {
    const guard = new CsrfGuard();

    expect(guard.canActivate(createContext({ method: 'GET' }))).toBe(true);
  });

  it('allows matching header and cookie tokens', () => {
    const guard = new CsrfGuard();

    expect(
      guard.canActivate(
        createContext({
          method: 'POST',
          headers: { cookie: 'sf_csrf=token' },
          get: (name: string) => (name === HEADERS.CSRF ? 'token' : undefined),
        }),
      ),
    ).toBe(true);
  });

  it('rejects missing or mismatched tokens', () => {
    const guard = new CsrfGuard();

    expect(() =>
      guard.canActivate(
        createContext({
          method: 'POST',
          headers: { cookie: 'sf_csrf=token' },
          get: () => 'different',
        }),
      ),
    ).toThrow(expect.objectContaining({ code: ErrorCode.CSRF_INVALID }));
  });
});

function createContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}
