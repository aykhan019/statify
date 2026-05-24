import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ConfigService } from '../../config/config.service';
import { ItunesRateLimiter } from './itunes-rate-limiter';
import type { ItunesSearchParams, ItunesSearchResponse } from './itunes.types';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 100;

const ItunesSearchResultSchema = z.object({
  artistName: z.string().optional(),
  artworkUrl100: z.string().url().optional(),
  collectionName: z.string().optional(),
  kind: z.string().optional(),
  previewUrl: z.string().url().optional(),
  primaryGenreName: z.string().optional(),
  trackId: z.number().optional(),
  trackName: z.string().optional(),
  wrapperType: z.string().optional(),
});

const ItunesSearchResponseSchema = z.object({
  resultCount: z.number().int(),
  results: z.array(ItunesSearchResultSchema),
});

export class ItunesClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ItunesClientError';
  }
}

@Injectable()
export class ItunesClient {
  constructor(
    private readonly config: ConfigService,
    private readonly rateLimiter: ItunesRateLimiter,
  ) {}

  async searchSongs(params: ItunesSearchParams): Promise<ItunesSearchResponse> {
    await this.rateLimiter.acquire();

    return this.requestWithRetries(params);
  }

  private async requestWithRetries(params: ItunesSearchParams): Promise<ItunesSearchResponse> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        return await this.request(params);
      } catch (error) {
        lastError = error;

        if (!shouldRetry(error) || attempt === MAX_RETRIES) {
          break;
        }

        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }

    throw lastError;
  }

  private async request(params: ItunesSearchParams): Promise<ItunesSearchResponse> {
    const response = await fetch(this.createSearchUrl(params), {
      signal: AbortSignal.timeout(this.config.itunesRequestTimeoutMs),
    });

    if (!response.ok) {
      throw new ItunesClientError('iTunes lookup failed', response.status);
    }

    return ItunesSearchResponseSchema.parse(await response.json());
  }

  private createSearchUrl(params: ItunesSearchParams): URL {
    const url = new URL('/search', this.config.itunesApiBaseUrl);

    url.searchParams.set('term', params.term);
    url.searchParams.set('media', 'music');
    url.searchParams.set('entity', 'song');
    url.searchParams.set('limit', String(params.limit ?? 5));

    return url;
  }
}

function shouldRetry(error: unknown): boolean {
  if (!(error instanceof ItunesClientError)) {
    return true;
  }

  return error.status === undefined || error.status === 429 || error.status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
