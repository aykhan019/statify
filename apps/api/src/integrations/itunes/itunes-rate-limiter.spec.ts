import type { ConfigService } from '../../config/config.service';
import { describe, expect, it } from 'vitest';
import { ItunesRateLimiter } from './itunes-rate-limiter';

describe('ItunesRateLimiter', () => {
  it('allows requests immediately while tokens are available', async () => {
    const limiter = new ItunesRateLimiter({
      itunesRateLimitRps: 20,
    } as ConfigService);

    await expect(limiter.acquire()).resolves.toBeUndefined();
  });
});
