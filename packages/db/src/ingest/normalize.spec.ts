import { describe, expect, it } from 'vitest';
import { normalizeName, normalizePlaylists } from './normalize';
import type { RawMpdPlaylist } from './types';

const SAMPLE_PLAYLIST: RawMpdPlaylist = {
  pid: 7,
  name: 'Road trip',
  collaborative: 'false',
  modified_at: 1_493_424_000,
  num_followers: 3,
  num_edits: 2,
  duration_ms: 600_000,
  tracks: [
    {
      pos: 0,
      artist_name: 'The Cars',
      artist_uri: 'spotify:artist:a1',
      track_name: 'Drive',
      track_uri: 'spotify:track:t1',
      album_name: 'Heartbeat City',
      album_uri: 'spotify:album:al1',
      duration_ms: 240_000,
    },
    {
      pos: 1,
      artist_name: 'The Cars',
      artist_uri: 'spotify:artist:a1',
      track_name: 'Just What I Needed',
      track_uri: 'spotify:track:t2',
      album_name: 'The Cars',
      album_uri: 'spotify:album:al2',
      duration_ms: 217_000,
    },
  ],
};

describe('normalizePlaylists', () => {
  it('deduplicates artists, albums, and tracks across playlists', () => {
    const secondPlaylist: RawMpdPlaylist = {
      ...SAMPLE_PLAYLIST,
      pid: 8,
      name: 'Another mix',
      tracks: [SAMPLE_PLAYLIST.tracks[0]!, SAMPLE_PLAYLIST.tracks[1]!],
    };

    const result = normalizePlaylists([SAMPLE_PLAYLIST, secondPlaylist]);

    expect(result.artists).toHaveLength(1);
    expect(result.albums).toHaveLength(2);
    expect(result.tracks).toHaveLength(2);
    expect(result.trackArtists).toHaveLength(2);
    expect(result.playlists).toHaveLength(2);
    expect(result.playlistTracks).toHaveLength(4);
  });

  it('parses collaborative as a boolean', () => {
    const collab = normalizePlaylists([{ ...SAMPLE_PLAYLIST, collaborative: 'true' }]);
    expect(collab.playlists[0]?.collaborative).toBe(true);

    const direct = normalizePlaylists([{ ...SAMPLE_PLAYLIST, collaborative: false }]);
    expect(direct.playlists[0]?.collaborative).toBe(false);
  });

  it('converts modified_at from seconds to a Date', () => {
    const result = normalizePlaylists([SAMPLE_PLAYLIST]);
    expect(result.playlists[0]?.modifiedAt).toEqual(new Date(1_493_424_000 * 1000));
  });

  it('promotes durationMs to bigint', () => {
    const result = normalizePlaylists([SAMPLE_PLAYLIST]);
    expect(result.playlists[0]?.durationMs).toBe(BigInt(600_000));
  });
});

describe('normalizeName', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalizeName('  The Cars  ')).toBe('the cars');
  });

  it('strips punctuation and diacritics', () => {
    expect(normalizeName('Café del Mar!')).toBe('cafe del mar');
    expect(normalizeName('Beyoncé')).toBe('beyonce');
  });

  it('returns an empty string for pure punctuation', () => {
    expect(normalizeName('!!!---???')).toBe('');
  });
});
