import { describe, expect, it } from 'vitest';
import { ItunesAdapter } from './itunes.adapter';

describe('ItunesAdapter', () => {
  it('selects the first result with a preview URL and track id', () => {
    const adapter = new ItunesAdapter();

    expect(
      adapter.toPreviewMatch({
        resultCount: 2,
        results: [
          {
            previewUrl: 'https://example.com/skip.m4a',
          },
          {
            artworkUrl100:
              'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/100x100bb.jpg',
            previewUrl: 'https://example.com/preview.m4a',
            trackId: 123,
          },
        ],
      }),
    ).toEqual({
      itunesTrackId: 123,
      previewUrl: 'https://example.com/preview.m4a',
    });
  });

  it('preserves preview matches when artwork is absent', () => {
    const adapter = new ItunesAdapter();

    expect(
      adapter.toPreviewMatch({
        resultCount: 1,
        results: [
          {
            previewUrl: 'https://example.com/preview.m4a',
            trackId: 123,
          },
        ],
      }),
    ).toEqual({
      itunesTrackId: 123,
      previewUrl: 'https://example.com/preview.m4a',
    });
  });

  it('returns null when no preview result is available', () => {
    const adapter = new ItunesAdapter();

    expect(
      adapter.toPreviewMatch({
        resultCount: 1,
        results: [{ trackId: 123 }],
      }),
    ).toBeNull();
  });
});
