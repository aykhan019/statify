import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type AdminArtistListItem,
  type AdminArtistListResponse,
  type AdminArtistsListQuery,
  type UpdateAdminArtistRequest,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { type AdminArtistRecord, AdminArtistsRepository } from './admin-artists.repository';
import { diffAuditFields } from './admin-audit.util';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminArtistsService {
  constructor(
    private readonly repository: AdminArtistsRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: AdminArtistsListQuery): Promise<AdminArtistListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toAdminArtistListItem), result.total, query);
  }

  async update(
    actorId: number,
    artistId: number,
    input: UpdateAdminArtistRequest,
  ): Promise<AdminArtistListItem> {
    const existing = await this.require(artistId);
    const updated = await this.repository.update(artistId, {
      name: input.name,
      imageUrl: input.imageUrl,
    });
    await this.auditLog.record({
      actorUserId: actorId,
      action: 'admin.artist.updated',
      targetTable: 'artists',
      targetId: String(artistId),
      metadata: diffAuditFields(
        { name: existing.name, imageUrl: existing.imageUrl },
        { name: updated.name, imageUrl: updated.imageUrl },
      ),
    });
    return toAdminArtistListItem(updated);
  }

  async setHidden(
    actorId: number,
    artistId: number,
    hidden: boolean,
  ): Promise<AdminArtistListItem> {
    const existing = await this.require(artistId);
    const wasHidden = existing.hiddenAt !== null;
    if (wasHidden === hidden) {
      return toAdminArtistListItem(existing);
    }
    const updated = await this.repository.setHidden(artistId, hidden);
    await this.auditLog.record({
      actorUserId: actorId,
      action: hidden ? 'admin.artist.hidden' : 'admin.artist.unhidden',
      targetTable: 'artists',
      targetId: String(artistId),
      metadata: null,
    });
    return toAdminArtistListItem(updated);
  }

  private async require(id: number): Promise<AdminArtistRecord> {
    const record = await this.repository.findById(id);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Artist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return record;
  }
}

function toAdminArtistListItem(record: AdminArtistRecord): AdminArtistListItem {
  return {
    id: record.id,
    name: record.name,
    imageUrl: record.imageUrl,
    hiddenAt: record.hiddenAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    albumCount: record._count.albums,
    trackCount: record._count.trackArtists,
  };
}
