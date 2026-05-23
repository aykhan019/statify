import { Injectable } from '@nestjs/common';
import type { ItunesPreviewMatch, ItunesSearchResponse } from './itunes.types';

@Injectable()
export class ItunesAdapter {
  toPreviewMatch(response: ItunesSearchResponse): ItunesPreviewMatch | null {
    const result = response.results.find(hasPreviewMatch);

    if (result === undefined) {
      return null;
    }

    return {
      itunesTrackId: result.trackId,
      previewUrl: result.previewUrl,
    };
  }
}

function hasPreviewMatch(result: ItunesSearchResponse['results'][number]): result is {
  previewUrl: string;
  trackId: number;
} {
  return (
    typeof result.trackId === 'number' &&
    typeof result.previewUrl === 'string' &&
    result.previewUrl.length > 0
  );
}
