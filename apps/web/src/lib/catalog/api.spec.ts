import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAlbums, fetchArtistById, fetchTracks } from './api';

const okResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

describe('catalog api client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('serializes track list query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [], page: 1 }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await fetchTracks({ page: 2, limit: 50, artistId: 7, sort: '-durationMs' });

    const [input] = fetchMock.mock.calls[0] as [URL];
    expect(input.toString()).toBe(
      'http://api.local/api/v1/tracks?page=2&limit=50&artistId=7&sort=-durationMs',
    );
  });

  it('omits empty query strings', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [], page: 1 }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await fetchAlbums({});

    const [input] = fetchMock.mock.calls[0] as [URL];
    expect(input.toString()).toBe('http://api.local/api/v1/albums');
  });

  it('fetches a single artist by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 9, name: 'Artist' }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await fetchArtistById(9);

    const [input] = fetchMock.mock.calls[0] as [URL];
    expect(input.toString()).toBe('http://api.local/api/v1/artists/9');
  });
});
