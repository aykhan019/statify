import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type AdminAlbumListItem,
  type AdminAlbumListResponse,
  type AdminAlbumsListQuery,
  type UpdateAdminAlbumRequest,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { type AdminAlbumRecord, AdminAlbumsRepository } from './admin-albums.repository';
import { diffAuditFields } from './admin-audit.util';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminAlbumsService {
  constructor(
    private readonly repository: AdminAlbumsRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: AdminAlbumsListQuery): Promise<AdminAlbumListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toAdminAlbumListItem), result.total, query);
  }

  async update(
    actorId: number,
    albumId: number,
    input: UpdateAdminAlbumRequest,
  ): Promise<AdminAlbumListItem> {
    const existing = await this.require(albumId);
    const updated = await this.repository.update(albumId, {
      name: input.name,
      imageUrl: input.imageUrl,
    });
    await this.auditLog.record({
      actorUserId: actorId,
      action: 'admin.album.updated',
      targetTable: 'albums',
      targetId: String(albumId),
      metadata: diffAuditFields(
        { name: existing.name, imageUrl: existing.imageUrl },
        { name: updated.name, imageUrl: updated.imageUrl },
      ),
    });
    return toAdminAlbumListItem(updated);
  }

  async setHidden(actorId: number, albumId: number, hidden: boolean): Promise<AdminAlbumListItem> {
    const existing = await this.require(albumId);
    const wasHidden = existing.hiddenAt !== null;
    if (wasHidden === hidden) {
      return toAdminAlbumListItem(existing);
    }
    const updated = await this.repository.setHidden(albumId, hidden);
    await this.auditLog.record({
      actorUserId: actorId,
      action: hidden ? 'admin.album.hidden' : 'admin.album.unhidden',
      targetTable: 'albums',
      targetId: String(albumId),
      metadata: null,
    });
    return toAdminAlbumListItem(updated);
  }

  private async require(id: number): Promise<AdminAlbumRecord> {
    const record = await this.repository.findById(id);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Album not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return record;
  }
}

function toAdminAlbumListItem(record: AdminAlbumRecord): AdminAlbumListItem {
  return {
    id: record.id,
    name: record.name,
    imageUrl: record.imageUrl,
    hiddenAt: record.hiddenAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    primaryArtistId: record.primaryArtist.id,
    primaryArtistName: record.primaryArtist.name,
    trackCount: record._count.tracks,
  };
}
