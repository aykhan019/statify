import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type AdminTrackListItem,
  type AdminTrackListResponse,
  type AdminTracksListQuery,
  type UpdateAdminTrackRequest,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { type AdminTrackRecord, AdminTracksRepository } from './admin-tracks.repository';
import { diffAuditFields } from './admin-audit.util';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminTracksService {
  constructor(
    private readonly repository: AdminTracksRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: AdminTracksListQuery): Promise<AdminTrackListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toAdminTrackListItem), result.total, query);
  }

  async update(
    actorId: number,
    trackId: number,
    input: UpdateAdminTrackRequest,
  ): Promise<AdminTrackListItem> {
    const existing = await this.require(trackId);
    const updated = await this.repository.update(trackId, {
      name: input.name,
      imageUrl: input.imageUrl,
    });
    await this.auditLog.record({
      actorUserId: actorId,
      action: 'admin.track.updated',
      targetTable: 'tracks',
      targetId: String(trackId),
      metadata: diffAuditFields(
        { name: existing.name, imageUrl: existing.imageUrl },
        { name: updated.name, imageUrl: updated.imageUrl },
      ),
    });
    return toAdminTrackListItem(updated);
  }

  async setHidden(actorId: number, trackId: number, hidden: boolean): Promise<AdminTrackListItem> {
    const existing = await this.require(trackId);
    const wasHidden = existing.hiddenAt !== null;
    if (wasHidden === hidden) {
      return toAdminTrackListItem(existing);
    }
    const updated = await this.repository.setHidden(trackId, hidden);
    await this.auditLog.record({
      actorUserId: actorId,
      action: hidden ? 'admin.track.hidden' : 'admin.track.unhidden',
      targetTable: 'tracks',
      targetId: String(trackId),
      metadata: null,
    });
    return toAdminTrackListItem(updated);
  }

  private async require(id: number): Promise<AdminTrackRecord> {
    const record = await this.repository.findById(id);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Track not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return record;
  }
}

function toAdminTrackListItem(record: AdminTrackRecord): AdminTrackListItem {
  return {
    id: record.id,
    name: record.name,
    imageUrl: record.imageUrl ?? record.album.imageUrl,
    hiddenAt: record.hiddenAt?.toISOString() ?? null,
    durationMs: record.durationMs,
    albumId: record.album.id,
    albumName: record.album.name,
    primaryArtistId: record.album.primaryArtist.id,
    primaryArtistName: record.album.primaryArtist.name,
    playCount: record._count.listeningHistory,
  };
}
