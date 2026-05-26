import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import type { ItunesPreviewMatch } from './itunes.types';

const TRACK_FOR_PREVIEW_INCLUDE = {
  album: {
    include: {
      primaryArtist: true,
    },
  },
  trackArtists: {
    include: {
      artist: true,
    },
    orderBy: {
      artistId: 'asc',
    },
  },
} as const satisfies Prisma.TrackInclude;

const ITUNES_CACHE_SELECT = {
  id: true,
  imageUrl: true,
  itunesTrackId: true,
  previewFetchedAt: true,
  previewUrl: true,
} as const satisfies Prisma.TrackSelect;

export type ItunesTrackForPreview = Prisma.TrackGetPayload<{
  include: typeof TRACK_FOR_PREVIEW_INCLUDE;
}>;

export type ItunesCacheRecord = Prisma.TrackGetPayload<{
  select: typeof ITUNES_CACHE_SELECT;
}>;

@Injectable()
export class ItunesCache extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findTrackForPreview(trackId: number): Promise<ItunesTrackForPreview | null> {
    return this.client.track.findUnique({
      include: TRACK_FOR_PREVIEW_INCLUDE,
      where: { id: trackId },
    });
  }

  savePreview(
    trackId: number,
    match: ItunesPreviewMatch,
    fetchedAt: Date,
  ): Promise<ItunesCacheRecord> {
    return this.client.track.update({
      data: {
        itunesTrackId: BigInt(match.itunesTrackId),
        previewFetchedAt: fetchedAt,
        previewUrl: match.previewUrl,
      },
      select: ITUNES_CACHE_SELECT,
      where: { id: trackId },
    });
  }

  markUnavailable(trackId: number, fetchedAt: Date): Promise<ItunesCacheRecord> {
    return this.client.track.update({
      data: {
        itunesTrackId: null,
        previewFetchedAt: fetchedAt,
        previewUrl: null,
      },
      select: ITUNES_CACHE_SELECT,
      where: { id: trackId },
    });
  }
}
