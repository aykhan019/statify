import { describe, expect, it } from 'vitest';
import { DEFAULT_SEED_COUNTS, generateCorpus, SEED_REFERENCE_DATE } from './generate';

describe('generateCorpus', () => {
  it('produces the requested counts at default settings', () => {
    const corpus = generateCorpus();
    expect(corpus.artists.length).toBeLessThanOrEqual(DEFAULT_SEED_COUNTS.artists);
    expect(corpus.albums).toHaveLength(DEFAULT_SEED_COUNTS.albums);
    expect(corpus.tracks).toHaveLength(DEFAULT_SEED_COUNTS.tracks);
    expect(corpus.playlists).toHaveLength(DEFAULT_SEED_COUNTS.playlists);
    expect(corpus.playlistTracks.length).toBeGreaterThan(0);
    expect(corpus.history.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same input', () => {
    const a = generateCorpus();
    const b = generateCorpus();
    expect(a.tracks).toEqual(b.tracks);
    expect(a.playlists).toEqual(b.playlists);
    expect(a.history).toEqual(b.history);
  });

  it('uses unique spotify URIs across artists, albums, and tracks', () => {
    const corpus = generateCorpus();
    const artistUris = new Set(corpus.artists.map((a) => a.spotifyUri));
    const albumUris = new Set(corpus.albums.map((a) => a.spotifyUri));
    const trackUris = new Set(corpus.tracks.map((t) => t.spotifyUri));
    expect(artistUris.size).toBe(corpus.artists.length);
    expect(albumUris.size).toBe(corpus.albums.length);
    expect(trackUris.size).toBe(corpus.tracks.length);
  });

  it('keeps foreign-key references consistent', () => {
    const corpus = generateCorpus();
    const artistUris = new Set(corpus.artists.map((a) => a.spotifyUri));
    const albumUris = new Set(corpus.albums.map((a) => a.spotifyUri));
    const trackUris = new Set(corpus.tracks.map((t) => t.spotifyUri));
    const playlistPids = new Set(corpus.playlists.map((p) => p.mpdPid));

    expect(corpus.albums.every((a) => artistUris.has(a.primaryArtistSpotifyUri))).toBe(true);
    expect(corpus.tracks.every((t) => albumUris.has(t.albumSpotifyUri))).toBe(true);
    expect(corpus.tracks.every((t) => artistUris.has(t.primaryArtistSpotifyUri))).toBe(true);
    expect(corpus.playlistTracks.every((pt) => playlistPids.has(pt.mpdPid))).toBe(true);
    expect(corpus.playlistTracks.every((pt) => trackUris.has(pt.trackSpotifyUri))).toBe(true);
    expect(corpus.history.every((h) => trackUris.has(h.trackSpotifyUri))).toBe(true);
  });

  it('keeps every playlist position unique within the playlist', () => {
    const corpus = generateCorpus();
    const positionsByPid = new Map<number, Set<number>>();
    for (const entry of corpus.playlistTracks) {
      const set = positionsByPid.get(entry.mpdPid) ?? new Set<number>();
      expect(set.has(entry.pos)).toBe(false);
      set.add(entry.pos);
      positionsByPid.set(entry.mpdPid, set);
    }
  });

  it('spans the requested history window and stays at or before the reference date', () => {
    const corpus = generateCorpus();
    const referenceMidnight = new Date(SEED_REFERENCE_DATE);
    referenceMidnight.setUTCHours(0, 0, 0, 0);
    const earliestAllowed =
      referenceMidnight.getTime() - (DEFAULT_SEED_COUNTS.historyDays - 1) * 86_400_000;
    for (const entry of corpus.history) {
      expect(entry.playedAt.getTime()).toBeGreaterThanOrEqual(earliestAllowed);
      expect(entry.playedAt.getTime()).toBeLessThanOrEqual(SEED_REFERENCE_DATE.getTime());
    }
  });

  it('only emits history rows for users within the configured count', () => {
    const corpus = generateCorpus();
    const userIndexes = new Set(corpus.history.map((h) => h.userIndex));
    for (const idx of userIndexes) {
      expect(idx).toBeGreaterThanOrEqual(1);
      expect(idx).toBeLessThanOrEqual(DEFAULT_SEED_COUNTS.historyUsers);
    }
  });
});
