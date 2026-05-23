import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { ConfigService } from '../../config/config.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ItunesRateLimiter } from './itunes-rate-limiter';
import { ItunesClient } from './itunes.client';

describe('ItunesClient', () => {
  let requests: URL[];
  let server: Server;

  beforeEach(() => {
    requests = [];
  });

  afterEach(async () => {
    await closeServer(server);
  });

  it('queries the search endpoint on a mock server', async () => {
    server = await createMockServer(() => ({
      body: {
        resultCount: 1,
        results: [
          {
            previewUrl: 'https://example.com/preview.m4a',
            trackId: 123,
          },
        ],
      },
      status: 200,
    }));
    const client = createClient(getBaseUrl(server));

    await expect(client.searchSongs({ limit: 3, term: 'Track Artist' })).resolves.toEqual({
      resultCount: 1,
      results: [
        {
          previewUrl: 'https://example.com/preview.m4a',
          trackId: 123,
        },
      ],
    });

    expect(requests[0]?.pathname).toBe('/search');
    expect(requests[0]?.searchParams.get('term')).toBe('Track Artist');
    expect(requests[0]?.searchParams.get('media')).toBe('music');
    expect(requests[0]?.searchParams.get('entity')).toBe('song');
    expect(requests[0]?.searchParams.get('limit')).toBe('3');
  });

  it('retries server failures before returning a successful response', async () => {
    let calls = 0;
    server = await createMockServer(() => {
      calls += 1;

      if (calls === 1) {
        return { body: { error: 'try again' }, status: 500 };
      }

      return { body: { resultCount: 0, results: [] }, status: 200 };
    });
    const client = createClient(getBaseUrl(server));

    await expect(client.searchSongs({ term: 'Track Artist' })).resolves.toEqual({
      resultCount: 0,
      results: [],
    });
    expect(requests).toHaveLength(2);
  });

  function createClient(baseUrl: string): ItunesClient {
    return new ItunesClient(
      {
        itunesApiBaseUrl: baseUrl,
        itunesRequestTimeoutMs: 1000,
      } as ConfigService,
      {
        acquire: vi.fn().mockResolvedValue(undefined),
      } as unknown as ItunesRateLimiter,
    );
  }

  async function createMockServer(
    handler: () => { body: unknown; status: number },
  ): Promise<Server> {
    const mockServer = createServer((request, response) => {
      requests.push(new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`));

      const result = handler();
      response.statusCode = result.status;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify(result.body));
    });

    await new Promise<void>((resolve) => {
      mockServer.listen(0, '127.0.0.1', resolve);
    });

    return mockServer;
  }
});

function getBaseUrl(server: Server): string {
  const address = server.address() as AddressInfo;

  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server | undefined): Promise<void> {
  if (server === undefined) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error === undefined) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}
