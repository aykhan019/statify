import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError, ErrorCode } from '@statify/shared';
import type { TrackPreview, TrackPreviewProvider } from '../track-preview-provider';
import { ItunesAdapter } from './itunes.adapter';
import { ItunesCache, type ItunesCacheRecord, type ItunesTrackForPreview } from './itunes.cache';
import { ItunesClient } from './itunes.client';

const FAILED_LOOKUP_RETRY_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ItunesService implements TrackPreviewProvider {
  constructor(
    private readonly adapter: ItunesAdapter,
    private readonly cache: ItunesCache,
    private readonly client: ItunesClient,
  ) {}

  async resolvePreview(trackId: number): Promise<TrackPreview> {
    const track = await this.cache.findTrackForPreview(trackId);

    if (track === null) {
      throw new AppError({
        code: ErrorCode.TRACK_NOT_FOUND,
        message: 'Track not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    const cachedPreview = getFreshCache(track);
    if (cachedPreview !== null) {
      return cachedPreview;
    }

    return this.lookupPreview(track);
  }

  private async lookupPreview(track: ItunesTrackForPreview): Promise<TrackPreview> {
    const fetchedAt = new Date();

    try {
      const response = await this.client.searchSongs({
        term: createSearchTerm(track),
      });
      const match = this.adapter.toPreviewMatch(response);

      if (match === null) {
        return toTrackPreview(await this.cache.markUnavailable(track.id, fetchedAt), 'lookup');
      }

      return toTrackPreview(await this.cache.savePreview(track.id, match, fetchedAt), 'lookup');
    } catch {
      return toTrackPreview(await this.cache.markUnavailable(track.id, fetchedAt), 'lookup');
    }
  }
}

function getFreshCache(track: ItunesTrackForPreview): TrackPreview | null {
  if (track.previewFetchedAt === null) {
    return null;
  }

  if (track.previewUrl !== null) {
    return toTrackPreview(track, 'cache');
  }

  if (Date.now() - track.previewFetchedAt.getTime() < FAILED_LOOKUP_RETRY_MS) {
    return toTrackPreview(track, 'cache');
  }

  return null;
}

function createSearchTerm(track: ItunesTrackForPreview): string {
  return [track.name, getPrimaryArtistName(track)].filter(Boolean).join(' ');
}

function getPrimaryArtistName(track: ItunesTrackForPreview): string | undefined {
  return (
    track.trackArtists.find((trackArtist) => trackArtist.role === 'primary') ??
    track.trackArtists[0]
  )?.artist.name;
}

function toTrackPreview(
  record: ItunesCacheRecord | ItunesTrackForPreview,
  source: TrackPreview['source'],
): TrackPreview {
  return {
    itunesTrackId: record.itunesTrackId,
    previewFetchedAt: record.previewFetchedAt ?? new Date(0),
    previewUrl: record.previewUrl,
    source,
    status: record.previewUrl === null ? 'unavailable' : 'available',
    trackId: record.id,
  };
}
