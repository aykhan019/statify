import { Injectable } from '@nestjs/common';
import type { ItunesPreviewMatch, ItunesSearchResponse } from './itunes.types';

const CANONICAL_ARTWORK_SIZE = 600;
const ITUNES_ARTWORK_SIZE_PATTERN = /\d+x\d+bb\.(jpg|jpeg|png|webp)(\?.*)?$/i;

@Injectable()
export class ItunesAdapter {
  toPreviewMatch(response: ItunesSearchResponse): ItunesPreviewMatch | null {
    const result = response.results.find(hasPreviewMatch);

    if (result === undefined) {
      return null;
    }

    return {
      ...(typeof result.artworkUrl100 === 'string' && result.artworkUrl100.length > 0
        ? { imageUrl: toCanonicalArtworkUrl(result.artworkUrl100) }
        : {}),
      itunesTrackId: result.trackId,
      previewUrl: result.previewUrl,
    };
  }
}

export function toCanonicalArtworkUrl(url: string): string {
  return url.replace(
    ITUNES_ARTWORK_SIZE_PATTERN,
    `${CANONICAL_ARTWORK_SIZE}x${CANONICAL_ARTWORK_SIZE}bb.$1$2`,
  );
}

function hasPreviewMatch(result: ItunesSearchResponse['results'][number]): result is {
  artworkUrl100?: string;
  previewUrl: string;
  trackId: number;
} {
  return (
    typeof result.trackId === 'number' &&
    typeof result.previewUrl === 'string' &&
    result.previewUrl.length > 0
  );
}
