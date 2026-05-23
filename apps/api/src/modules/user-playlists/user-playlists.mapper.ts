import type {
  UserPlaylistDetail,
  UserPlaylistListItem,
  UserPlaylistTrackEntry,
} from '@statify/shared';
import { toTrackListItem } from '../catalog/catalog.mapper';
import type { UserPlaylistRecord, UserPlaylistTrackRecord } from './user-playlists.repository';

export function toUserPlaylistListItem(record: UserPlaylistRecord): UserPlaylistListItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    isPublic: record.isPublic,
    trackCount: record._count.tracks,
    owner: {
      id: record.user.id,
      displayName: record.user.displayName,
    },
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toUserPlaylistDetail(record: UserPlaylistRecord): UserPlaylistDetail {
  return toUserPlaylistListItem(record);
}

export function toUserPlaylistTrackEntry(record: UserPlaylistTrackRecord): UserPlaylistTrackEntry {
  return {
    pos: record.pos,
    addedAt: record.addedAt.toISOString(),
    track: toTrackListItem(record.track),
  };
}
