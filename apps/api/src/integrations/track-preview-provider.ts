export const TRACK_PREVIEW_PROVIDER = Symbol('TRACK_PREVIEW_PROVIDER');

export interface TrackPreview {
  itunesTrackId: bigint | null;
  previewFetchedAt: Date;
  previewUrl: string | null;
  source: 'cache' | 'lookup';
  status: 'available' | 'unavailable';
  trackId: number;
}

export interface TrackPreviewProvider {
  resolvePreview(trackId: number): Promise<TrackPreview>;
}
