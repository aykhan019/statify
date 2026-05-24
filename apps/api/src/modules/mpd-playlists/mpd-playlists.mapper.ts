import type {
  MpdPlaylistDetail,
  MpdPlaylistListItem,
  MpdPlaylistTrackEntry,
} from '@statify/shared';
import { toTrackListItem } from '../catalog/catalog.mapper';
import type { MpdPlaylistListRecord, MpdPlaylistTrackRecord } from './mpd-playlists.repository';

export function toMpdPlaylistListItem(record: MpdPlaylistListRecord): MpdPlaylistListItem {
  return {
    collaborative: record.collaborative,
    coverImages: coverImagesFromTracks(record.tracks),
    durationMs: Number(record.durationMs),
    id: record.id,
    mpdPid: record.mpdPid,
    name: record.name,
    numEdits: record.numEdits,
    numFollowers: record.numFollowers,
    trackCount: record._count.tracks,
  };
}

export function toMpdPlaylistDetail(record: MpdPlaylistListRecord): MpdPlaylistDetail {
  return {
    ...toMpdPlaylistListItem(record),
    modifiedAt: record.modifiedAt.toISOString(),
  };
}

export function toMpdPlaylistTrackEntry(record: MpdPlaylistTrackRecord): MpdPlaylistTrackEntry {
  return {
    pos: record.pos,
    track: toTrackListItem(record.track),
  };
}

function coverImagesFromTracks(recordTracks: MpdPlaylistListRecord['tracks']): string[] {
  return recordTracks
    .map(({ track }) => track.imageUrl ?? track.album.imageUrl)
    .filter((imageUrl): imageUrl is string => imageUrl !== null);
}
