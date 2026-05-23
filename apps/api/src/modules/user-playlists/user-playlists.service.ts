import { Injectable } from '@nestjs/common';
import type {
  CreateUserPlaylistRequest,
  UserPlaylistDetail,
  UserPlaylistListResponse,
  UserPlaylistsListQuery,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { toUserPlaylistDetail, toUserPlaylistListItem } from './user-playlists.mapper';
import { UserPlaylistsRepository } from './user-playlists.repository';

@Injectable()
export class UserPlaylistsService {
  constructor(private readonly repository: UserPlaylistsRepository) {}

  async create(userId: number, input: CreateUserPlaylistRequest): Promise<UserPlaylistDetail> {
    const record = await this.repository.create({
      userId,
      name: input.name,
      description: input.description,
      isPublic: input.isPublic,
    });
    return toUserPlaylistDetail(record);
  }

  async listForOwner(
    userId: number,
    query: UserPlaylistsListQuery,
  ): Promise<UserPlaylistListResponse> {
    const result = await this.repository.listForOwner(userId, query);
    return toOffsetPage(result.data.map(toUserPlaylistListItem), result.total, query);
  }
}
