import { PrismaClient, type Prisma } from '@prisma/client';

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_DEEZER_API_BASE_URL = 'https://api.deezer.com';
const DEFAULT_DEEZER_MAX_RETRIES = 5;
const DEFAULT_DEEZER_REQUEST_INTERVAL_MS = 120;
const DEFAULT_DEEZER_REQUEST_TIMEOUT_MS = 10000;
const DEFAULT_DEEZER_QUOTA_BACKOFF_MS = 5000;

// Deezer signals "Quota limit exceeded" with an in-body error object (HTTP 200), code 4.
const DEEZER_QUOTA_ERROR_CODE = 4;

const ALBUM_IMAGE_FIELDS = ['cover_xl', 'cover_big', 'cover_medium', 'cover'] as const;
const ARTIST_IMAGE_FIELDS = ['picture_xl', 'picture_big', 'picture_medium', 'picture'] as const;

const ALBUM_SELECT = {
  id: true,
  imageUrl: true,
  name: true,
  primaryArtist: { select: { name: true } },
} as const satisfies Prisma.AlbumSelect;

const ARTIST_SELECT = {
  id: true,
  imageUrl: true,
  name: true,
} as const satisfies Prisma.ArtistSelect;

type BackfillAlbum = Prisma.AlbumGetPayload<{ select: typeof ALBUM_SELECT }>;
type BackfillArtist = Prisma.ArtistGetPayload<{ select: typeof ARTIST_SELECT }>;
type BackfillEntityKind = 'album' | 'artist';

export interface DeezerMediaBackfillPrisma {
  album: {
    findMany(args: Prisma.AlbumFindManyArgs): Promise<BackfillAlbum[]>;
    update(args: Prisma.AlbumUpdateArgs): Promise<unknown>;
  };
  artist: {
    findMany(args: Prisma.ArtistFindManyArgs): Promise<BackfillArtist[]>;
    update(args: Prisma.ArtistUpdateArgs): Promise<unknown>;
  };
}

export interface MediaBackfillLogger {
  info(message: string): void;
  warn(message: string): void;
}

export interface DeezerMediaBackfillOptions {
  artworkFetcher?: DeezerArtworkFetcher;
  batchSize?: number;
  deezerApiBaseUrl?: string;
  deezerMaxRetries?: number;
  deezerQuotaBackoffMs?: number;
  deezerRequestIntervalMs?: number;
  deezerRequestTimeoutMs?: number;
  delay?: Delay;
  fetch?: FetchLike;
  limit?: number | null;
  logger?: MediaBackfillLogger;
  overwriteExisting?: boolean;
}

export interface DeezerMediaBackfillResult {
  albumLookupFailures: number;
  albumsScanned: number;
  albumsSkipped: number;
  albumsUpdated: number;
  artistLookupFailures: number;
  artistsScanned: number;
  artistsSkipped: number;
  artistsUpdated: number;
}

export interface DeezerArtworkFetcher {
  getAlbumImage(album: string, artist: string): Promise<string | null>;
  getArtistImage(artist: string): Promise<string | null>;
}

interface ResolvedDeezerMediaBackfillOptions {
  artworkFetcher: DeezerArtworkFetcher;
  batchSize: number;
  limit: number | null;
  logger: MediaBackfillLogger;
  overwriteExisting: boolean;
}

interface DeezerArtworkClientOptions {
  apiBaseUrl?: string;
  delay?: Delay;
  fetch?: FetchLike;
  maxRetries?: number;
  quotaBackoffMs?: number;
  requestIntervalMs?: number;
  requestTimeoutMs?: number;
}

interface ResolvedDeezerArtworkClientOptions {
  apiBaseUrl: string;
  delay: Delay;
  fetch: FetchLike;
  maxRetries: number;
  quotaBackoffMs: number;
  requestIntervalMs: number;
  requestTimeoutMs: number;
}

interface DeezerSearchResponse {
  data?: unknown;
  error?: unknown;
}

type Delay = (ms: number) => Promise<void>;
type FetchLike = (input: URL, init?: RequestInit) => Promise<Response>;

const SILENT_LOGGER: MediaBackfillLogger = {
  info() {},
  warn() {},
};

export async function runDeezerMediaBackfill(
  prisma: DeezerMediaBackfillPrisma,
  options: DeezerMediaBackfillOptions = {},
): Promise<DeezerMediaBackfillResult> {
  const resolved = resolveDeezerMediaBackfillOptions(options);
  const result = createEmptyResult();

  await backfillAlbums(prisma, resolved, result);
  await backfillArtists(prisma, resolved, result);

  resolved.logger.info(
    `Deezer media backfill complete. albumsScanned=${result.albumsScanned} albumsUpdated=${result.albumsUpdated} albumsSkipped=${result.albumsSkipped} albumLookupFailures=${result.albumLookupFailures} artistsScanned=${result.artistsScanned} artistsUpdated=${result.artistsUpdated} artistsSkipped=${result.artistsSkipped} artistLookupFailures=${result.artistLookupFailures}`,
  );

  return result;
}

function resolveDeezerMediaBackfillOptions(
  options: DeezerMediaBackfillOptions,
): ResolvedDeezerMediaBackfillOptions {
  return {
    artworkFetcher: options.artworkFetcher ?? createDeezerArtworkFetcher(resolveDeezerEnv(options)),
    batchSize: resolvePositiveInt(options.batchSize ?? DEFAULT_BATCH_SIZE, 'batchSize'),
    limit: resolveLimit(options.limit),
    logger: options.logger ?? SILENT_LOGGER,
    overwriteExisting: options.overwriteExisting ?? false,
  };
}

function resolveDeezerEnv(options: DeezerMediaBackfillOptions): DeezerArtworkClientOptions {
  return {
    apiBaseUrl: options.deezerApiBaseUrl ?? process.env.DEEZER_API_BASE_URL,
    delay: options.delay,
    fetch: options.fetch,
    maxRetries: options.deezerMaxRetries,
    quotaBackoffMs: options.deezerQuotaBackoffMs,
    requestIntervalMs: options.deezerRequestIntervalMs,
    requestTimeoutMs: options.deezerRequestTimeoutMs,
  };
}

function resolvePositiveInt(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer, got ${value}`);
  }

  return value;
}

function resolveNonNegativeInt(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer, got ${value}`);
  }

  return value;
}

function resolveLimit(value: number | null | undefined): number | null {
  const limit = value ?? null;

  if (limit !== null && (!Number.isInteger(limit) || limit < 0)) {
    throw new Error(`limit must be a non-negative integer, got ${limit}`);
  }

  return limit;
}

function createEmptyResult(): DeezerMediaBackfillResult {
  return {
    albumLookupFailures: 0,
    albumsScanned: 0,
    albumsSkipped: 0,
    albumsUpdated: 0,
    artistLookupFailures: 0,
    artistsScanned: 0,
    artistsSkipped: 0,
    artistsUpdated: 0,
  };
}

async function backfillAlbums(
  prisma: DeezerMediaBackfillPrisma,
  options: ResolvedDeezerMediaBackfillOptions,
  result: DeezerMediaBackfillResult,
): Promise<void> {
  await backfillEntityImages<BackfillAlbum>({
    describe: (album) => `name="${album.name}" artist="${album.primaryArtist.name}"`,
    findBatch: (lastId, take) => findAlbumBatch(prisma, lastId, take, options.overwriteExisting),
    kind: 'album',
    onLookupFailure: () => {
      result.albumLookupFailures += 1;
    },
    onScanned: () => {
      result.albumsScanned += 1;
    },
    onSkipped: () => {
      result.albumsSkipped += 1;
    },
    onUpdated: () => {
      result.albumsUpdated += 1;
    },
    options,
    resolveImage: (album) =>
      options.artworkFetcher.getAlbumImage(album.name, album.primaryArtist.name),
    update: (id, imageUrl) =>
      prisma.album.update({
        data: { imageUrl },
        where: { id },
      }),
  });
}

async function backfillArtists(
  prisma: DeezerMediaBackfillPrisma,
  options: ResolvedDeezerMediaBackfillOptions,
  result: DeezerMediaBackfillResult,
): Promise<void> {
  await backfillEntityImages<BackfillArtist>({
    describe: (artist) => `name="${artist.name}"`,
    findBatch: (lastId, take) => findArtistBatch(prisma, lastId, take, options.overwriteExisting),
    kind: 'artist',
    onLookupFailure: () => {
      result.artistLookupFailures += 1;
    },
    onScanned: () => {
      result.artistsScanned += 1;
    },
    onSkipped: () => {
      result.artistsSkipped += 1;
    },
    onUpdated: () => {
      result.artistsUpdated += 1;
    },
    options,
    resolveImage: (artist) => options.artworkFetcher.getArtistImage(artist.name),
    update: (id, imageUrl) =>
      prisma.artist.update({
        data: { imageUrl },
        where: { id },
      }),
  });
}

async function backfillEntityImages<TRecord extends { id: number; imageUrl: string | null }>(args: {
  describe(record: TRecord): string;
  findBatch(lastId: number, take: number): Promise<TRecord[]>;
  kind: BackfillEntityKind;
  onLookupFailure(): void;
  onScanned(): void;
  onSkipped(): void;
  onUpdated(): void;
  options: ResolvedDeezerMediaBackfillOptions;
  resolveImage(record: TRecord): Promise<string | null>;
  update(id: number, imageUrl: string): Promise<unknown>;
}): Promise<void> {
  let lastId = 0;
  let remaining = args.options.limit;

  args.options.logger.info(
    `${args.kind} backfill started. batchSize=${args.options.batchSize} limit=${remaining ?? 'all'}`,
  );

  while (remaining === null || remaining > 0) {
    const take = resolveNextTake(remaining, args.options.batchSize);

    args.options.logger.info(`${args.kind} fetching DB batch after lastId=${lastId} take=${take}`);

    const records = await args.findBatch(lastId, take);

    args.options.logger.info(`${args.kind} DB batch loaded. records=${records.length}`);

    if (records.length === 0) {
      args.options.logger.info(`${args.kind} no more records found.`);
      break;
    }

    for (const record of records) {
      await backfillEntityRecord(args, record);
    }

    lastId = records[records.length - 1]?.id ?? lastId;

    if (remaining !== null) {
      remaining -= records.length;
    }
  }
}

async function backfillEntityRecord<TRecord extends { id: number; imageUrl: string | null }>(
  args: {
    describe(record: TRecord): string;
    kind: BackfillEntityKind;
    onLookupFailure(): void;
    onScanned(): void;
    onSkipped(): void;
    onUpdated(): void;
    options: ResolvedDeezerMediaBackfillOptions;
    resolveImage(record: TRecord): Promise<string | null>;
    update(id: number, imageUrl: string): Promise<unknown>;
  },
  record: TRecord,
): Promise<void> {
  args.onScanned();

  if (record.imageUrl !== null && !args.options.overwriteExisting) {
    args.onSkipped();
    return;
  }

  let newImageUrl: string | null;

  try {
    newImageUrl = await args.resolveImage(record);
  } catch (error) {
    args.onLookupFailure();
    args.options.logger.warn(
      `${args.kind} image lookup failed for dbId=${record.id} ${args.describe(record)}: ${toErrorMessage(error)}`,
    );
    return;
  }

  if (newImageUrl === null) {
    args.options.logger.info(
      `${args.kind} skipped dbId=${record.id} ${args.describe(record)} reason=no-image-found`,
    );
    args.onSkipped();
    return;
  }

  await args.update(record.id, newImageUrl);

  args.options.logger.info(
    `${args.kind} updated dbId=${record.id} ${args.describe(record)} oldImageUrl=${record.imageUrl ?? 'null'} newImageUrl=${newImageUrl}`,
  );

  args.onUpdated();
}

function resolveNextTake(remaining: number | null, batchSize: number): number {
  return remaining === null ? batchSize : Math.min(batchSize, remaining);
}

function findAlbumBatch(
  prisma: DeezerMediaBackfillPrisma,
  lastId: number,
  take: number,
  overwriteExisting: boolean,
): Promise<BackfillAlbum[]> {
  const where: Prisma.AlbumWhereInput = { id: { gt: lastId } };

  if (!overwriteExisting) {
    where.imageUrl = null;
  }

  return prisma.album.findMany({
    orderBy: { id: 'asc' },
    select: ALBUM_SELECT,
    take,
    where,
  });
}

function findArtistBatch(
  prisma: DeezerMediaBackfillPrisma,
  lastId: number,
  take: number,
  overwriteExisting: boolean,
): Promise<BackfillArtist[]> {
  const where: Prisma.ArtistWhereInput = { id: { gt: lastId } };

  if (!overwriteExisting) {
    where.imageUrl = null;
  }

  return prisma.artist.findMany({
    orderBy: { id: 'asc' },
    select: ARTIST_SELECT,
    take,
    where,
  });
}

/**
 * Builds a Deezer advanced-search query for an album, e.g. `artist:"Adele" album:"25"`.
 * Returns null when there is no usable album name to search by.
 */
export function buildDeezerAlbumQuery(album: string, artist: string): string | null {
  const albumTerm = sanitizeSearchTerm(album);

  if (albumTerm === '') {
    return null;
  }

  const artistTerm = sanitizeSearchTerm(artist);
  const clauses = [`album:"${albumTerm}"`];

  if (artistTerm !== '') {
    clauses.unshift(`artist:"${artistTerm}"`);
  }

  return clauses.join(' ');
}

/**
 * Builds a Deezer search query for an artist. Returns null when the name is empty.
 */
export function buildDeezerArtistQuery(artist: string): string | null {
  const artistTerm = sanitizeSearchTerm(artist);

  return artistTerm === '' ? null : artistTerm;
}

function sanitizeSearchTerm(value: string): string {
  // Deezer advanced queries are delimited by double quotes and have no escaping, so drop them.
  return value.replace(/"/g, ' ').replace(/\s+/g, ' ').trim();
}

export function createDeezerArtworkFetcher(
  options: DeezerArtworkClientOptions = {},
): DeezerArtworkFetcher {
  const resolved = resolveDeezerArtworkClientOptions(options);
  let lastRequestAt = 0;

  async function search(
    path: '/search/album' | '/search/artist',
    query: string,
  ): Promise<unknown[]> {
    const url = new URL(path, resolved.apiBaseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '1');

    const body = await fetchSearch(url);

    return Array.isArray(body.data) ? body.data : [];
  }

  async function fetchSearch(url: URL): Promise<DeezerSearchResponse> {
    for (let attempt = 0; ; attempt += 1) {
      await paceRequest();

      const response = await resolved.fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(resolved.requestTimeoutMs),
      });

      if (response.status === 429) {
        if (attempt >= resolved.maxRetries) {
          throw new Error('Deezer request exceeded retry limit after status 429');
        }

        await resolved.delay(resolved.quotaBackoffMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(await createDeezerRequestError(response));
      }

      const body = (await response.json()) as DeezerSearchResponse;

      if (isDeezerQuotaError(body.error)) {
        if (attempt >= resolved.maxRetries) {
          throw new Error('Deezer request exceeded retry limit after a quota error');
        }

        await resolved.delay(resolved.quotaBackoffMs);
        continue;
      }

      if (body.error !== undefined && body.error !== null) {
        throw new Error(`Deezer request returned an error: ${describeDeezerError(body.error)}`);
      }

      return body;
    }
  }

  async function paceRequest(): Promise<void> {
    const elapsedMs = Date.now() - lastRequestAt;

    if (elapsedMs < resolved.requestIntervalMs) {
      await resolved.delay(resolved.requestIntervalMs - elapsedMs);
    }

    lastRequestAt = Date.now();
  }

  return {
    async getAlbumImage(album, artist) {
      const query = buildDeezerAlbumQuery(album, artist);

      if (query === null) {
        return null;
      }

      const results = await search('/search/album', query);

      return firstImageUrl(results[0], ALBUM_IMAGE_FIELDS);
    },

    async getArtistImage(artist) {
      const query = buildDeezerArtistQuery(artist);

      if (query === null) {
        return null;
      }

      const results = await search('/search/artist', query);

      return firstImageUrl(results[0], ARTIST_IMAGE_FIELDS);
    },
  };
}

function resolveDeezerArtworkClientOptions(
  options: DeezerArtworkClientOptions,
): ResolvedDeezerArtworkClientOptions {
  const apiBaseUrl =
    options.apiBaseUrl === undefined || options.apiBaseUrl.trim() === ''
      ? DEFAULT_DEEZER_API_BASE_URL
      : options.apiBaseUrl;

  return {
    apiBaseUrl,
    delay: options.delay ?? delay,
    fetch: options.fetch ?? fetch,
    maxRetries: resolveNonNegativeInt(
      options.maxRetries ?? DEFAULT_DEEZER_MAX_RETRIES,
      'maxRetries',
    ),
    quotaBackoffMs: resolvePositiveInt(
      options.quotaBackoffMs ?? DEFAULT_DEEZER_QUOTA_BACKOFF_MS,
      'quotaBackoffMs',
    ),
    requestIntervalMs: resolveNonNegativeInt(
      options.requestIntervalMs ?? DEFAULT_DEEZER_REQUEST_INTERVAL_MS,
      'requestIntervalMs',
    ),
    requestTimeoutMs: resolvePositiveInt(
      options.requestTimeoutMs ?? DEFAULT_DEEZER_REQUEST_TIMEOUT_MS,
      'requestTimeoutMs',
    ),
  };
}

function isDeezerQuotaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;

  return (
    code === DEEZER_QUOTA_ERROR_CODE || (typeof message === 'string' && /quota/i.test(message))
  );
}

function describeDeezerError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const { type, message, code } = error as {
      code?: unknown;
      message?: unknown;
      type?: unknown;
    };

    return `type=${String(type)} code=${String(code)} message=${String(message)}`;
  }

  return String(error);
}

function firstImageUrl(item: unknown, fields: readonly string[]): string | null {
  if (typeof item !== 'object' || item === null) {
    return null;
  }

  const record = item as Record<string, unknown>;

  for (const field of fields) {
    const value = record[field];

    if (typeof value === 'string' && isUsableImageUrl(value)) {
      return value;
    }
  }

  return null;
}

function isUsableImageUrl(url: string): boolean {
  if (url.length === 0) {
    return false;
  }

  // Deezer returns placeholder art with an empty resource id segment, e.g.
  // ".../images/artist//500x500-...jpg". Treat those as missing.
  return !/\/(artist|album|cover|playlist|user)\/\//.test(url);
}

async function createDeezerRequestError(response: Response): Promise<string> {
  const body = await response.text();
  const suffix = body.trim().length === 0 ? '' : `: ${body.trim().slice(0, 500)}`;

  return `Deezer request failed with status ${response.status}${suffix}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(
  argv: string[],
): Pick<DeezerMediaBackfillOptions, 'batchSize' | 'limit' | 'overwriteExisting'> {
  const options: Pick<DeezerMediaBackfillOptions, 'batchSize' | 'limit' | 'overwriteExisting'> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--batch-size') {
      options.batchSize = parseRequiredInt(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--limit') {
      options.limit = parseRequiredInt(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--overwrite-existing') {
      options.overwriteExisting = true;
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
    console.log(`[media-backfill:deezer] ${message}`);
  },

  warn(message) {
    console.warn(`[media-backfill:deezer] ${message}`);
  },
};

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await runDeezerMediaBackfill(prisma as unknown as DeezerMediaBackfillPrisma, {
      ...parseArgs(process.argv.slice(2)),
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
