import type { Artist } from '@prisma/client';
import type {
  AlbumDetail,
  AlbumListItem,
  ArtistDetail,
  CatalogAlbumSummary,
  CatalogArtistSummary,
  TrackDetail,
  TrackListItem,
} from '@statify/shared';
import type { AlbumCatalogRecord, AlbumDetailRecord } from './albums.repository';
import type { ArtistDetailRecord } from './artists.repository';
import type { TrackCatalogRecord } from './tracks.repository';

export function toArtistListItem(artist: Artist): CatalogArtistSummary {
  return toArtistSummary(artist);
}

export function toArtistDetail(artist: ArtistDetailRecord): ArtistDetail {
  return {
    ...toArtistSummary(artist),
    albumCount: artist._count.albums,
    createdAt: artist.createdAt.toISOString(),
    trackCount: artist._count.trackArtists,
  };
}

export function toAlbumListItem(album: AlbumCatalogRecord): AlbumListItem {
  return toAlbumSummary(album);
}

export function toAlbumDetail(album: AlbumDetailRecord): AlbumDetail {
  return {
    ...toAlbumSummary(album),
    createdAt: album.createdAt.toISOString(),
    trackCount: album._count.tracks,
  };
}

export function toTrackListItem(track: TrackCatalogRecord): TrackListItem {
  return {
    album: toAlbumSummary(track.album),
    artists: track.trackArtists.map(({ artist, role }) => ({
      ...toArtistSummary(artist),
      role,
    })),
    durationMs: track.durationMs,
    id: track.id,
    imageUrl: track.imageUrl,
    name: track.name,
    previewUrl: track.previewUrl,
    spotifyUri: track.spotifyUri,
  };
}

export function toTrackDetail(track: TrackCatalogRecord): TrackDetail {
  return {
    ...toTrackListItem(track),
    previewFetchedAt: track.previewFetchedAt?.toISOString() ?? null,
  };
}

function toAlbumSummary(album: AlbumCatalogRecord): CatalogAlbumSummary {
  return {
    id: album.id,
    imageUrl: album.imageUrl,
    name: album.name,
    primaryArtist: toArtistSummary(album.primaryArtist),
    spotifyUri: album.spotifyUri,
  };
}

function toArtistSummary(
  artist: Pick<Artist, 'id' | 'imageUrl' | 'name' | 'spotifyUri'>,
): CatalogArtistSummary {
  return {
    id: artist.id,
    imageUrl: artist.imageUrl,
    name: artist.name,
    spotifyUri: artist.spotifyUri,
  };
}
