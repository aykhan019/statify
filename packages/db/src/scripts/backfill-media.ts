import { PrismaClient, type Prisma } from '@prisma/client';

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_ITUNES_API_BASE_URL = 'https://itunes.apple.com';
const DEFAULT_ITUNES_RATE_LIMIT_RPS = 20;
const DEFAULT_ITUNES_REQUEST_TIMEOUT_MS = 5000;
const CANONICAL_ARTWORK_SIZE = 600;
const ITUNES_ARTWORK_SIZE_PATTERN = /\d+x\d+bb\.(jpg|jpeg|png|webp)(\?.*)?$/i;

const TRACK_SELECT = {
  album: {
    select: {
      primaryArtist: {
        select: {
          name: true,
        },
      },
    },
  },
  id: true,
  name: true,
  trackArtists: {
    orderBy: {
      artistId: 'asc',
    },
    select: {
      artist: {
        select: {
          name: true,
        },
      },
      role: true,
    },
  },
} as const satisfies Prisma.TrackSelect;

const ALBUM_SELECT = {
  id: true,
  tracks: {
    orderBy: {
      id: 'asc',
    },
    select: {
      imageUrl: true,
    },
    take: 1,
    where: {
      imageUrl: {
        not: null,
      },
    },
  },
} as const satisfies Prisma.AlbumSelect;

type BackfillTrack = Prisma.TrackGetPayload<{ select: typeof TRACK_SELECT }>;
type BackfillAlbum = Prisma.AlbumGetPayload<{ select: typeof ALBUM_SELECT }>;

export interface MediaBackfillPrisma {
  album: {
    findMany(args: Prisma.AlbumFindManyArgs): Promise<BackfillAlbum[]>;
    update(args: Prisma.AlbumUpdateArgs): Promise<unknown>;
  };
  track: {
    findMany(args: Prisma.TrackFindManyArgs): Promise<BackfillTrack[]>;
    update(args: Prisma.TrackUpdateArgs): Promise<unknown>;
  };
}

export interface MediaBackfillLogger {
  info(message: string): void;
  warn(message: string): void;
}

export interface MediaBackfillOptions {
  batchSize?: number;
  itunesApiBaseUrl?: string;
  itunesRateLimitRps?: number;
  itunesRequestTimeoutMs?: number;
  limit?: number | null;
  logger?: MediaBackfillLogger;
  searchSongs?: ItunesSongSearch;
}

export interface MediaBackfillResult {
  albumsUpdated: number;
  lookupFailures: number;
  tracksScanned: number;
  tracksSkipped: number;
  tracksUpdated: number;
}

export interface ItunesSongSearchParams {
  limit?: number;
  term: string;
}

export type ItunesSongSearch = (params: ItunesSongSearchParams) => Promise<ItunesSearchResponse>;

interface ItunesSearchResponse {
  results?: ItunesSearchResult[];
}

interface ItunesSearchResult {
  artworkUrl100?: unknown;
  previewUrl?: unknown;
  trackId?: unknown;
}

interface MediaMatch {
  imageUrl: string;
  itunesTrackId: number;
  previewUrl: string;
}

interface ResolvedMediaBackfillOptions {
  batchSize: number;
  limit: number | null;
  logger: MediaBackfillLogger;
  searchSongs: ItunesSongSearch;
}

const SILENT_LOGGER: MediaBackfillLogger = {
  info() {},
  warn() {},
};

export async function runMediaBackfill(
  prisma: MediaBackfillPrisma,
  options: MediaBackfillOptions = {},
): Promise<MediaBackfillResult> {
  const resolved = resolveMediaBackfillOptions(options);
  const result = createEmptyResult();

  await backfillTrackImages(prisma, resolved, result);
  result.albumsUpdated = await backfillAlbumImages(prisma, resolved.batchSize);
  resolved.logger.info(
    `Media backfill complete. tracksScanned=${result.tracksScanned} tracksUpdated=${result.tracksUpdated} tracksSkipped=${result.tracksSkipped} lookupFailures=${result.lookupFailures} albumsUpdated=${result.albumsUpdated}`,
  );

  return result;
}

function resolveMediaBackfillOptions(options: MediaBackfillOptions): ResolvedMediaBackfillOptions {
  return {
    batchSize: resolveBatchSize(options.batchSize),
    limit: resolveLimit(options.limit),
    logger: options.logger ?? SILENT_LOGGER,
    searchSongs: resolveSearchSongs(options),
  };
}

function resolveBatchSize(value: number | undefined): number {
  const batchSize = value ?? DEFAULT_BATCH_SIZE;
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error(`batchSize must be a positive integer, got ${batchSize}`);
  }

  return batchSize;
}

function resolveLimit(value: number | null | undefined): number | null {
  const limit = value ?? null;
  if (limit !== null && (!Number.isInteger(limit) || limit < 0)) {
    throw new Error(`limit must be a non-negative integer, got ${limit}`);
  }

  return limit;
}

function resolveSearchSongs(options: MediaBackfillOptions): ItunesSongSearch {
  return (
    options.searchSongs ??
    createItunesSearcher({
      apiBaseUrl: options.itunesApiBaseUrl ?? DEFAULT_ITUNES_API_BASE_URL,
      rateLimitRps: options.itunesRateLimitRps ?? DEFAULT_ITUNES_RATE_LIMIT_RPS,
      requestTimeoutMs: options.itunesRequestTimeoutMs ?? DEFAULT_ITUNES_REQUEST_TIMEOUT_MS,
    })
  );
}

function createEmptyResult(): MediaBackfillResult {
  return {
    albumsUpdated: 0,
    lookupFailures: 0,
    tracksScanned: 0,
    tracksSkipped: 0,
    tracksUpdated: 0,
  };
}

async function backfillTrackImages(
  prisma: MediaBackfillPrisma,
  options: ResolvedMediaBackfillOptions,
  result: MediaBackfillResult,
): Promise<void> {
  let lastTrackId = 0;
  let remainingTracks = options.limit;

  while (remainingTracks === null || remainingTracks > 0) {
    const tracks = await findTrackBatch(prisma, lastTrackId, options.batchSize, remainingTracks);

    if (tracks.length === 0) {
      break;
    }

    for (const track of tracks) {
      result.tracksScanned += 1;
      lastTrackId = track.id;
      await backfillTrackImage(prisma, options, result, track);
    }

    if (remainingTracks !== null) {
      remainingTracks -= tracks.length;
    }
  }
}

function findTrackBatch(
  prisma: MediaBackfillPrisma,
  lastTrackId: number,
  batchSize: number,
  remainingTracks: number | null,
): Promise<BackfillTrack[]> {
  const take = remainingTracks === null ? batchSize : Math.min(batchSize, remainingTracks);

  return prisma.track.findMany({
    orderBy: { id: 'asc' },
    select: TRACK_SELECT,
    take,
    where: {
      id: { gt: lastTrackId },
      imageUrl: null,
    },
  });
}

async function backfillTrackImage(
  prisma: MediaBackfillPrisma,
  options: ResolvedMediaBackfillOptions,
  result: MediaBackfillResult,
  track: BackfillTrack,
): Promise<void> {
  try {
    const response = await options.searchSongs({ term: createSearchTerm(track), limit: 5 });
    const match = toMediaMatch(response);

    if (match === null) {
      result.tracksSkipped += 1;
      return;
    }

    await prisma.track.update({
      data: {
        imageUrl: match.imageUrl,
        itunesTrackId: BigInt(match.itunesTrackId),
        previewFetchedAt: new Date(),
        previewUrl: match.previewUrl,
      },
      where: { id: track.id },
    });
    result.tracksUpdated += 1;
  } catch (error) {
    result.lookupFailures += 1;
    options.logger.warn(`Track ${track.id} lookup failed: ${toErrorMessage(error)}`);
  }
}

async function backfillAlbumImages(
  prisma: MediaBackfillPrisma,
  batchSize: number,
): Promise<number> {
  let lastAlbumId = 0;
  let updated = 0;

  for (;;) {
    const albums = await prisma.album.findMany({
      orderBy: { id: 'asc' },
      select: ALBUM_SELECT,
      take: batchSize,
      where: {
        id: { gt: lastAlbumId },
        imageUrl: null,
        tracks: {
          some: {
            imageUrl: {
              not: null,
            },
          },
        },
      },
    });

    if (albums.length === 0) {
      break;
    }

    for (const album of albums) {
      lastAlbumId = album.id;
      const imageUrl = album.tracks[0]?.imageUrl;

      if (imageUrl === undefined || imageUrl === null) {
        continue;
      }

      await prisma.album.update({
        data: { imageUrl },
        where: { id: album.id },
      });
      updated += 1;
    }
  }

  return updated;
}

function toMediaMatch(response: ItunesSearchResponse): MediaMatch | null {
  const match = response.results?.find(hasArtworkPreviewMatch);

  if (match === undefined) {
    return null;
  }

  return {
    imageUrl: toCanonicalArtworkUrl(match.artworkUrl100),
    itunesTrackId: match.trackId,
    previewUrl: match.previewUrl,
  };
}

function hasArtworkPreviewMatch(result: ItunesSearchResult): result is {
  artworkUrl100: string;
  previewUrl: string;
  trackId: number;
} {
  return (
    typeof result.trackId === 'number' &&
    typeof result.previewUrl === 'string' &&
    result.previewUrl.length > 0 &&
    typeof result.artworkUrl100 === 'string' &&
    result.artworkUrl100.length > 0
  );
}

export function toCanonicalArtworkUrl(url: string): string {
  return url.replace(
    ITUNES_ARTWORK_SIZE_PATTERN,
    `${CANONICAL_ARTWORK_SIZE}x${CANONICAL_ARTWORK_SIZE}bb.$1$2`,
  );
}

function createSearchTerm(track: BackfillTrack): string {
  return [track.name, getPrimaryArtistName(track)].filter(Boolean).join(' ');
}

function getPrimaryArtistName(track: BackfillTrack): string | undefined {
  return (
    (
      track.trackArtists.find((trackArtist) => trackArtist.role === 'primary') ??
      track.trackArtists[0]
    )?.artist.name ?? track.album.primaryArtist.name
  );
}

function createItunesSearcher(options: {
  apiBaseUrl: string;
  rateLimitRps: number;
  requestTimeoutMs: number;
}): ItunesSongSearch {
  const minimumIntervalMs = Math.ceil(1000 / Math.max(1, options.rateLimitRps));
  let lastRequestAt = 0;

  return async (params) => {
    const elapsedMs = Date.now() - lastRequestAt;
    if (elapsedMs < minimumIntervalMs) {
      await delay(minimumIntervalMs - elapsedMs);
    }
    lastRequestAt = Date.now();

    const url = new URL('/search', options.apiBaseUrl);
    url.searchParams.set('term', params.term);
    url.searchParams.set('media', 'music');
    url.searchParams.set('entity', 'song');
    url.searchParams.set('limit', String(params.limit ?? 5));

    const response = await fetch(url, {
      signal: AbortSignal.timeout(options.requestTimeoutMs),
    });

    if (!response.ok) {
      throw new Error(`iTunes lookup failed with status ${response.status}`);
    }

    return (await response.json()) as ItunesSearchResponse;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(argv: string[]): Pick<MediaBackfillOptions, 'batchSize' | 'limit'> {
  const options: Pick<MediaBackfillOptions, 'batchSize' | 'limit'> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--batch-size') {
      options.batchSize = parseRequiredInt(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--limit') {
      options.limit = parseRequiredInt(argv, (index += 1), arg);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function parseRequiredInt(argv: string[], index: number, flag: string): number {
  const value = argv[index];
  if (value === undefined) {
    throw new Error(`Missing value for ${flag}`);
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Expected integer for ${flag}, got ${value}`);
  }

  return parsed;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const CONSOLE_LOGGER: MediaBackfillLogger = {
  info(message) {
    console.log(`[media-backfill] ${message}`);
  },
  warn(message) {
    console.warn(`[media-backfill] ${message}`);
  },
};

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await runMediaBackfill(prisma as unknown as MediaBackfillPrisma, {
      ...parseArgs(process.argv.slice(2)),
      itunesApiBaseUrl: process.env.ITUNES_API_BASE_URL,
      itunesRateLimitRps:
        process.env.ITUNES_RATE_LIMIT_RPS === undefined
          ? undefined
          : Number.parseInt(process.env.ITUNES_RATE_LIMIT_RPS, 10),
      itunesRequestTimeoutMs:
        process.env.ITUNES_REQUEST_TIMEOUT_MS === undefined
          ? undefined
          : Number.parseInt(process.env.ITUNES_REQUEST_TIMEOUT_MS, 10),
      logger: CONSOLE_LOGGER,
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
