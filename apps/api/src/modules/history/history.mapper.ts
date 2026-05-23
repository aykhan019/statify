import type { ListeningHistory } from '@prisma/client';
import type { ListeningHistoryEntry, ListeningHistoryListItem } from '@statify/shared';
import type { ListeningHistoryWithTrack } from './listening-history.repository';

export function toListeningHistoryEntry(record: ListeningHistory): ListeningHistoryEntry {
  return {
    id: record.id,
    trackId: record.trackId,
    playedAt: record.playedAt.toISOString(),
    source: record.source,
    durationPlayedMs: record.durationPlayedMs,
  };
}

export function toListeningHistoryListItem(
  record: ListeningHistoryWithTrack,
): ListeningHistoryListItem {
  return {
    ...toListeningHistoryEntry(record),
    track: {
      id: record.track.id,
      name: record.track.name,
      durationMs: record.track.durationMs,
      previewUrl: record.track.previewUrl,
      album: {
        id: record.track.album.id,
        name: record.track.album.name,
        spotifyUri: record.track.album.spotifyUri,
        primaryArtist: {
          id: record.track.album.primaryArtist.id,
          name: record.track.album.primaryArtist.name,
          spotifyUri: record.track.album.primaryArtist.spotifyUri,
        },
      },
      artists: record.track.trackArtists.map(({ artist, role }) => ({
        id: artist.id,
        name: artist.name,
        spotifyUri: artist.spotifyUri,
        role,
      })),
    },
  };
}
