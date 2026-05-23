import type { UserPlaylistDetail, UserPlaylistListItem } from '@statify/shared';
import type { UserPlaylistRecord } from './user-playlists.repository';

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
