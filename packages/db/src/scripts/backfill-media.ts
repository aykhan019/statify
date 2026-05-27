import { PrismaClient, type Prisma } from '@prisma/client';

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SPOTIFY_ACCOUNTS_BASE_URL = 'https://accounts.spotify.com';
const DEFAULT_SPOTIFY_API_BASE_URL = 'https://api.spotify.com';
const DEFAULT_SPOTIFY_MAX_RETRIES = 5;
const DEFAULT_SPOTIFY_REQUEST_INTERVAL_MS = 350;
const DEFAULT_SPOTIFY_REQUEST_TIMEOUT_MS = 10000;

// Spotify batch endpoints: Get Several Albums allows 20 ids, Get Several Artists allows 50.
// Batching keeps the request count (and therefore quota burn) ~20-50x lower than one id per call.
const SPOTIFY_ALBUM_IDS_PER_REQUEST = 20;
const SPOTIFY_ARTIST_IDS_PER_REQUEST = 50;
const SPOTIFY_TOKEN_EXPIRY_BUFFER_MS = 60000;

const ALBUM_SELECT = {
  id: true,
  imageUrl: true,
  spotifyUri: true,
} as const satisfies Prisma.AlbumSelect;

const ARTIST_SELECT = {
  id: true,
  imageUrl: true,
  spotifyUri: true,
} as const satisfies Prisma.ArtistSelect;

type BackfillAlbum = Prisma.AlbumGetPayload<{ select: typeof ALBUM_SELECT }>;
type BackfillArtist = Prisma.ArtistGetPayload<{ select: typeof ARTIST_SELECT }>;
type BackfillEntityKind = 'album' | 'artist';
type BackfillRecord = BackfillAlbum | BackfillArtist;
type BackfillCandidate = { record: BackfillRecord; spotifyId: string };

export interface MediaBackfillPrisma {
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

export interface MediaBackfillOptions {
  batchSize?: number;
  catalogFetcher?: SpotifyCatalogFetcher;
  delay?: Delay;
  fetch?: FetchLike;
  limit?: number | null;
  logger?: MediaBackfillLogger;
  overwriteExisting?: boolean;
  spotifyAccountsBaseUrl?: string;
  spotifyApiBaseUrl?: string;
  spotifyClientId?: string;
  spotifyClientSecret?: string;
  spotifyMaxRetries?: number;
  spotifyRequestIntervalMs?: number;
  spotifyRequestTimeoutMs?: number;
}

export interface MediaBackfillResult {
  albumLookupFailures: number;
  albumsScanned: number;
  albumsSkipped: number;
  albumsUpdated: number;
  artistLookupFailures: number;
  artistsScanned: number;
  artistsSkipped: number;
  artistsUpdated: number;
}

export interface SpotifyCatalogImage {
  id: string;
  imageUrl: string | null;
}

export interface SpotifyCatalogFetcher {
  getAlbums(ids: string[]): Promise<SpotifyCatalogImage[]>;
  getArtists(ids: string[]): Promise<SpotifyCatalogImage[]>;
}

interface ResolvedMediaBackfillOptions {
  batchSize: number;
  catalogFetcher: SpotifyCatalogFetcher;
  limit: number | null;
  logger: MediaBackfillLogger;
  overwriteExisting: boolean;
}

interface SpotifyCatalogClientOptions {
  accountsBaseUrl?: string;
  apiBaseUrl?: string;
  clientId: string;
  clientSecret: string;
  delay?: Delay;
  fetch?: FetchLike;
  maxRetries?: number;
  requestIntervalMs?: number;
  requestTimeoutMs?: number;
}

interface ResolvedSpotifyCatalogClientOptions {
  accountsBaseUrl: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  delay: Delay;
  fetch: FetchLike;
  maxRetries: number;
  requestIntervalMs: number;
  requestTimeoutMs: number;
}

interface SpotifyAccessToken {
  accessToken: string;
  expiresAt: number;
}

interface SpotifyTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
}

interface SpotifyMediaObject {
  id?: unknown;
  images?: unknown;
}

type Delay = (ms: number) => Promise<void>;
type FetchLike = (input: URL, init?: RequestInit) => Promise<Response>;

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

  await backfillAlbums(prisma, resolved, result);
  await backfillArtists(prisma, resolved, result);

  resolved.logger.info(
    `Media backfill complete. albumsScanned=${result.albumsScanned} albumsUpdated=${result.albumsUpdated} albumsSkipped=${result.albumsSkipped} albumLookupFailures=${result.albumLookupFailures} artistsScanned=${result.artistsScanned} artistsUpdated=${result.artistsUpdated} artistsSkipped=${result.artistsSkipped} artistLookupFailures=${result.artistLookupFailures}`,
  );

  return result;
}

function resolveMediaBackfillOptions(options: MediaBackfillOptions): ResolvedMediaBackfillOptions {
  return {
    batchSize: resolvePositiveInt(options.batchSize ?? DEFAULT_BATCH_SIZE, 'batchSize'),
    catalogFetcher:
      options.catalogFetcher ?? createSpotifyCatalogFetcher(resolveSpotifyEnv(options)),
    limit: resolveLimit(options.limit),
    logger: options.logger ?? SILENT_LOGGER,
    overwriteExisting: options.overwriteExisting ?? false,
  };
}

function resolveSpotifyEnv(options: MediaBackfillOptions): SpotifyCatalogClientOptions {
  const clientId = options.spotifyClientId ?? process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = options.spotifyClientSecret ?? process.env.SPOTIFY_CLIENT_SECRET;

  if (clientId === undefined || clientId.trim() === '') {
    throw new Error('SPOTIFY_CLIENT_ID is required for Spotify artwork backfill');
  }

  if (clientSecret === undefined || clientSecret.trim() === '') {
    throw new Error('SPOTIFY_CLIENT_SECRET is required for Spotify artwork backfill');
  }

  return {
    accountsBaseUrl: options.spotifyAccountsBaseUrl,
    apiBaseUrl: options.spotifyApiBaseUrl,
    clientId,
    clientSecret,
    delay: options.delay,
    fetch: options.fetch,
    maxRetries: options.spotifyMaxRetries,
    requestIntervalMs: options.spotifyRequestIntervalMs,
    requestTimeoutMs: options.spotifyRequestTimeoutMs,
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

function createEmptyResult(): MediaBackfillResult {
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
  prisma: MediaBackfillPrisma,
  options: ResolvedMediaBackfillOptions,
  result: MediaBackfillResult,
): Promise<void> {
  await backfillEntityImages({
    fetchImages: options.catalogFetcher.getAlbums.bind(options.catalogFetcher),
    findBatch: (lastId, take) => findAlbumBatch(prisma, lastId, take, options.overwriteExisting),
    kind: 'album',
    maxIdsPerRequest: SPOTIFY_ALBUM_IDS_PER_REQUEST,
    onLookupFailure: (count) => {
      result.albumLookupFailures += count;
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
    update: (id, imageUrl) =>
      prisma.album.update({
        data: { imageUrl },
        where: { id },
      }),
  });
}

async function backfillArtists(
  prisma: MediaBackfillPrisma,
  options: ResolvedMediaBackfillOptions,
  result: MediaBackfillResult,
): Promise<void> {
  await backfillEntityImages({
    fetchImages: options.catalogFetcher.getArtists.bind(options.catalogFetcher),
    findBatch: (lastId, take) => findArtistBatch(prisma, lastId, take, options.overwriteExisting),
    kind: 'artist',
    maxIdsPerRequest: SPOTIFY_ARTIST_IDS_PER_REQUEST,
    onLookupFailure: (count) => {
      result.artistLookupFailures += count;
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
    update: (id, imageUrl) =>
      prisma.artist.update({
        data: { imageUrl },
        where: { id },
      }),
  });
}

async function backfillEntityImages(args: {
  fetchImages(ids: string[]): Promise<SpotifyCatalogImage[]>;
  findBatch(lastId: number, take: number): Promise<BackfillRecord[]>;
  kind: BackfillEntityKind;
  maxIdsPerRequest: number;
  onLookupFailure(count: number): void;
  onScanned(): void;
  onSkipped(): void;
  onUpdated(): void;
  options: ResolvedMediaBackfillOptions;
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

    const candidates = collectBackfillCandidates({
      kind: args.kind,
      onScanned: args.onScanned,
      onSkipped: args.onSkipped,
      overwriteExisting: args.options.overwriteExisting,
      records,
    });

    args.options.logger.info(`${args.kind} candidates collected. candidates=${candidates.length}`);

    lastId = records[records.length - 1]?.id ?? lastId;

    for (const chunk of chunkArray(candidates, args.maxIdsPerRequest)) {
      await backfillEntityChunk(args, chunk);
    }

    if (remaining !== null) {
      remaining -= records.length;
    }
  }
}

function resolveNextTake(remaining: number | null, batchSize: number): number {
  return remaining === null ? batchSize : Math.min(batchSize, remaining);
}

function collectBackfillCandidates(args: {
  kind: BackfillEntityKind;
  onScanned(): void;
  onSkipped(): void;
  overwriteExisting: boolean;
  records: BackfillRecord[];
}): BackfillCandidate[] {
  const candidates: BackfillCandidate[] = [];

  for (const record of args.records) {
    args.onScanned();

    const spotifyId = toCandidateSpotifyId(record, args.kind, args.overwriteExisting);

    if (spotifyId === null) {
      args.onSkipped();
      continue;
    }

    candidates.push({ record, spotifyId });
  }

  return candidates;
}

function toCandidateSpotifyId(
  record: BackfillRecord,
  kind: BackfillEntityKind,
  overwriteExisting: boolean,
): string | null {
  if (record.imageUrl !== null && !overwriteExisting) {
    return null;
  }

  return parseSpotifyUri(record.spotifyUri, kind);
}

async function backfillEntityChunk(
  args: {
    fetchImages(ids: string[]): Promise<SpotifyCatalogImage[]>;
    kind: BackfillEntityKind;
    onLookupFailure(count: number): void;
    onSkipped(): void;
    onUpdated(): void;
    options: ResolvedMediaBackfillOptions;
    update(id: number, imageUrl: string): Promise<unknown>;
  },
  chunk: BackfillCandidate[],
): Promise<void> {
  const ids = chunk.map(({ spotifyId }) => spotifyId);

  try {
    const images = await args.fetchImages(ids);
    const imagesById = new Map(images.map((image) => [image.id, image.imageUrl]));

    for (const { record, spotifyId } of chunk) {
      const newImageUrl = imagesById.get(spotifyId);

      if (newImageUrl === undefined || newImageUrl === null) {
        args.options.logger.info(
          `${args.kind} skipped dbId=${record.id} spotifyId=${spotifyId} reason=no-image-found`,
        );
        args.onSkipped();
        continue;
      }

      await args.update(record.id, newImageUrl);

      args.options.logger.info(
        `${args.kind} updated dbId=${record.id} spotifyUri=${record.spotifyUri} spotifyId=${spotifyId} oldImageUrl=${record.imageUrl ?? 'null'} newImageUrl=${newImageUrl}`,
      );

      args.onUpdated();
    }
  } catch (error) {
    args.onLookupFailure(chunk.length);
    args.options.logger.warn(
      `${args.kind} image lookup failed for ${ids.length} Spotify IDs: ${toErrorMessage(error)}`,
    );
  }
}

function findAlbumBatch(
  prisma: MediaBackfillPrisma,
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
  prisma: MediaBackfillPrisma,
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

export function parseSpotifyUri(uri: string, expectedKind: BackfillEntityKind): string | null {
  const parts = uri.split(':');

  if (parts.length !== 3) {
    return null;
  }

  const [scheme, kind, id] = parts;

  if (scheme !== 'spotify' || kind !== expectedKind || id === undefined || id.trim() === '') {
    return null;
  }

  return id;
}

export function createSpotifyCatalogFetcher(
  options: SpotifyCatalogClientOptions,
): SpotifyCatalogFetcher {
  const resolved = resolveSpotifyCatalogClientOptions(options);
  let accessToken: SpotifyAccessToken | null = null;
  let lastRequestAt = 0;

  async function getAccessToken(): Promise<string> {
    if (accessToken !== null && Date.now() < accessToken.expiresAt) {
      return accessToken.accessToken;
    }

    const url = new URL('/api/token', resolved.accountsBaseUrl);
    const credentials = Buffer.from(`${resolved.clientId}:${resolved.clientSecret}`).toString(
      'base64',
    );

    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    });

    if (response === null) {
      throw new Error('Spotify token request unexpectedly returned no response');
    }

    const body = parseTokenResponse((await response.json()) as SpotifyTokenResponse);

    accessToken = {
      accessToken: body.accessToken,
      expiresAt: Date.now() + body.expiresIn * 1000 - SPOTIFY_TOKEN_EXPIRY_BUFFER_MS,
    };

    return accessToken.accessToken;
  }

  async function fetchCatalogItems(
    path: '/v1/albums' | '/v1/artists',
    ids: string[],
  ): Promise<SpotifyCatalogImage[]> {
    if (ids.length === 0) {
      return [];
    }

    console.log(`[media-backfill] Spotify fetching ${path}?ids= (${ids.length} ids)`);

    const token = await getAccessToken();
    const url = new URL(path, resolved.apiBaseUrl);
    url.searchParams.set('ids', ids.join(','));

    const response = await fetchWithRetry(
      url,
      {
        headers: { Authorization: `Bearer ${token}` },
        method: 'GET',
      },
      {
        softStatuses: [400, 404],
      },
    );

    if (response === null) {
      console.log(
        `[media-backfill] Spotify returned empty/soft-failed for ${path} (${ids.length} ids)`,
      );
      return ids.map((id) => ({ id, imageUrl: null }));
    }

    const body = (await response.json()) as unknown;
    const items = extractCatalogArray(body, path === '/v1/albums' ? 'albums' : 'artists');
    const imageById = new Map<string, string | null>();

    for (const item of items) {
      const mediaObject = isSpotifyMediaObject(item) ? item : null;

      if (mediaObject !== null && typeof mediaObject.id === 'string' && mediaObject.id.length > 0) {
        imageById.set(mediaObject.id, firstImageUrl(mediaObject.images));
      }
    }

    // The response array can contain nulls for ids Spotify cannot resolve; map by the
    // requested id so each row gets an explicit entry (null image => skipped, no error).
    return ids.map((id) => ({ id, imageUrl: imageById.get(id) ?? null }));
  }

  async function fetchWithRetry(
    url: URL,
    init: RequestInit,
    options: { softStatuses?: number[] } = {},
  ): Promise<Response | null> {
    for (let attempt = 0; ; attempt += 1) {
      await paceRequest();

      const response = await resolved.fetch(url, {
        ...init,
        signal: AbortSignal.timeout(resolved.requestTimeoutMs),
      });

      if (response.status === 429) {
        if (attempt >= resolved.maxRetries) {
          throw new Error('Spotify request exceeded retry limit after status 429');
        }

        const retryAfterMs = parseRetryAfterMs(response.headers.get('Retry-After'));
        await resolved.delay(retryAfterMs);
        continue;
      }

      if (options.softStatuses?.includes(response.status)) {
        return null;
      }

      if (!response.ok) {
        throw new Error(await createSpotifyRequestError(response));
      }

      return response;
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
    async getAlbums(ids) {
      return fetchCatalogItems('/v1/albums', ids);
    },

    async getArtists(ids) {
      return fetchCatalogItems('/v1/artists', ids);
    },
  };
}

async function createSpotifyRequestError(response: Response): Promise<string> {
  const body = await response.text();
  const suffix = body.trim().length === 0 ? '' : `: ${body.trim().slice(0, 500)}`;

  return `Spotify request failed with status ${response.status}${suffix}`;
}

function resolveSpotifyCatalogClientOptions(
  options: SpotifyCatalogClientOptions,
): ResolvedSpotifyCatalogClientOptions {
  return {
    accountsBaseUrl: options.accountsBaseUrl ?? DEFAULT_SPOTIFY_ACCOUNTS_BASE_URL,
    apiBaseUrl: options.apiBaseUrl ?? DEFAULT_SPOTIFY_API_BASE_URL,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    delay: options.delay ?? delay,
    fetch: options.fetch ?? fetch,
    maxRetries: resolveNonNegativeInt(
      options.maxRetries ?? DEFAULT_SPOTIFY_MAX_RETRIES,
      'maxRetries',
    ),
    requestIntervalMs: resolveNonNegativeInt(
      options.requestIntervalMs ?? DEFAULT_SPOTIFY_REQUEST_INTERVAL_MS,
      'requestIntervalMs',
    ),
    requestTimeoutMs: resolvePositiveInt(
      options.requestTimeoutMs ?? DEFAULT_SPOTIFY_REQUEST_TIMEOUT_MS,
      'requestTimeoutMs',
    ),
  };
}

function parseTokenResponse(response: SpotifyTokenResponse): {
  accessToken: string;
  expiresIn: number;
} {
  if (
    typeof response.access_token !== 'string' ||
    response.access_token.length === 0 ||
    typeof response.expires_in !== 'number'
  ) {
    throw new Error('Spotify token response is missing access_token or expires_in');
  }

  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
  };
}

function extractCatalogArray(body: unknown, key: 'albums' | 'artists'): unknown[] {
  if (typeof body === 'object' && body !== null && key in body) {
    const value = (body as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function isSpotifyMediaObject(value: unknown): value is SpotifyMediaObject {
  return typeof value === 'object' && value !== null;
}

function firstImageUrl(images: unknown): string | null {
  if (!Array.isArray(images)) {
    return null;
  }

  for (const image of images) {
    if (
      typeof image === 'object' &&
      image !== null &&
      'url' in image &&
      typeof image.url === 'string' &&
      image.url.length > 0
    ) {
      return image.url;
    }
  }

  return null;
}

function parseRetryAfterMs(value: string | null): number {
  if (value === null) {
    return 1000;
  }

  const seconds = Number.parseInt(value, 10);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return 1000;
  }

  return Math.max(1000, seconds * 1000);
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(
  argv: string[],
): Pick<MediaBackfillOptions, 'batchSize' | 'limit' | 'overwriteExisting'> {
  const options: Pick<MediaBackfillOptions, 'batchSize' | 'limit' | 'overwriteExisting'> = {};

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
