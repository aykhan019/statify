import type {
  AlbumSort,
  AlbumsQuery,
  ArtistSort,
  ArtistsQuery,
  TrackSort,
  TracksQuery,
} from '@statify/shared';

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export interface TrackControlsState {
  hasPreview?: 'true' | 'false';
  maxDurationSec?: string;
  minDurationSec?: string;
  q?: string;
  sort: TrackSort;
}

export interface ArtistControlsState {
  q?: string;
  sort: ArtistSort;
}

export interface AlbumControlsState {
  q?: string;
  sort: AlbumSort;
}

const TRACK_SORTS = ['plays', '-plays', 'name', '-name', 'durationMs', '-durationMs'] as const;
const ARTIST_SORTS = ['name', '-name', 'createdAt', '-createdAt'] as const;
const ALBUM_SORTS = ['plays', '-plays', 'name', '-name', 'createdAt', '-createdAt'] as const;

export function readTrackListQuery(params: CatalogSearchParams): {
  controls: TrackControlsState;
  query: Partial<TracksQuery>;
} {
  const sort = readAllowed(readSingle(params.sort), TRACK_SORTS, '-plays');
  const q = readSearchTerm(params.q);
  const hasPreview = readHasPreview(params.hasPreview);
  const minDurationSec = readNonNegativeIntString(params.minDurationSec);
  const maxDurationSec = readNonNegativeIntString(params.maxDurationSec);
  const minDurationMs = toMilliseconds(minDurationSec);
  const maxDurationMs = toMilliseconds(maxDurationSec);

  return {
    controls: {
      hasPreview,
      maxDurationSec,
      minDurationSec,
      q,
      sort,
    },
    query: {
      hasPreview: hasPreview === undefined ? undefined : hasPreview === 'true',
      maxDurationMs,
      minDurationMs,
      page: 1,
      q,
      sort,
    },
  };
}

export function readArtistListQuery(params: CatalogSearchParams): {
  controls: ArtistControlsState;
  query: Partial<ArtistsQuery>;
} {
  const sort = readAllowed(readSingle(params.sort), ARTIST_SORTS, 'name');
  const q = readSearchTerm(params.q);

  return {
    controls: { q, sort },
    query: { page: 1, q, sort },
  };
}

export function readAlbumListQuery(params: CatalogSearchParams): {
  controls: AlbumControlsState;
  query: Partial<AlbumsQuery>;
} {
  const sort = readAllowed(readSingle(params.sort), ALBUM_SORTS, '-plays');
  const q = readSearchTerm(params.q);

  return {
    controls: { q, sort },
    query: { page: 1, q, sort },
  };
}

function readSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readSearchTerm(value: string | string[] | undefined): string | undefined {
  const raw = readSingle(value)?.trim();
  return raw === undefined || raw.length === 0 ? undefined : raw.slice(0, 100);
}

function readHasPreview(value: string | string[] | undefined): 'true' | 'false' | undefined {
  const raw = readSingle(value);
  return raw === 'true' || raw === 'false' ? raw : undefined;
}

function readNonNegativeIntString(value: string | string[] | undefined): string | undefined {
  const raw = readSingle(value);

  if (raw === undefined || raw.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? String(parsed) : undefined;
}

function toMilliseconds(value: string | undefined): number | undefined {
  return value === undefined ? undefined : Number(value) * 1000;
}

function readAllowed<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
