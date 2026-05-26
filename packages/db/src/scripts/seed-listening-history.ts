import { PrismaClient } from '@prisma/client';

const DEFAULT_EVENTS = 60000;
const DEFAULT_POOL_SIZE = 8000;
const DEFAULT_WINDOW_DAYS = 90;
const INSERT_CHUNK_SIZE = 1000;
const MIN_DURATION_PLAYED_MS = 20000;
const DURATION_PLAYED_SPREAD_MS = 220000;
const MS_PER_DAY = 86400000;

export interface ListeningEventRow {
  durationPlayedMs: number;
  playedAt: Date;
  source: 'seed';
  trackId: number;
  userId: number;
}

export interface GenerateListeningEventsOptions {
  events: number;
  now?: Date;
  /** Number of distinct tracks that receive plays; the rest stay at zero. */
  poolSize?: number;
  rng?: () => number;
  trackIds: number[];
  userIds: number[];
  windowDays?: number;
}

/**
 * Builds synthetic play events. Plays follow a Zipf distribution over a randomly chosen pool
 * of tracks (weight 1/rank), so a small head is played heavily and a long tail lightly, while
 * tracks outside the pool stay unplayed. That yields a realistic, non-degenerate "most played"
 * ranking instead of a flat one.
 */
export function generateListeningEvents(
  options: GenerateListeningEventsOptions,
): ListeningEventRow[] {
  const { events, trackIds, userIds } = options;
  const rng = options.rng ?? Math.random;
  const now = options.now ?? new Date();
  const windowMs = (options.windowDays ?? DEFAULT_WINDOW_DAYS) * MS_PER_DAY;

  if (userIds.length === 0) {
    throw new Error('Cannot seed listening history without users');
  }

  if (trackIds.length === 0) {
    throw new Error('Cannot seed listening history without tracks');
  }

  if (events <= 0) {
    return [];
  }

  const poolSize = Math.min(options.poolSize ?? DEFAULT_POOL_SIZE, trackIds.length);
  const pool = pickRankedPool(trackIds, poolSize, rng);
  const cumulative = buildZipfCumulative(poolSize);
  const total = cumulative[poolSize - 1] ?? 0;

  const rows: ListeningEventRow[] = [];

  for (let event = 0; event < events; event += 1) {
    const userId = userIds[Math.floor(rng() * userIds.length)] as number;
    const trackId = pool[weightedIndex(cumulative, rng() * total)] as number;

    rows.push({
      durationPlayedMs: MIN_DURATION_PLAYED_MS + Math.floor(rng() * DURATION_PLAYED_SPREAD_MS),
      playedAt: new Date(now.getTime() - Math.floor(rng() * windowMs)),
      source: 'seed',
      trackId,
      userId,
    });
  }

  return rows;
}

function pickRankedPool(trackIds: number[], poolSize: number, rng: () => number): number[] {
  // Partial Fisher-Yates: the first poolSize slots become a random, ranked sample.
  const copy = trackIds.slice();

  for (let i = 0; i < poolSize; i += 1) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const swap = copy[i] as number;
    copy[i] = copy[j] as number;
    copy[j] = swap;
  }

  return copy.slice(0, poolSize);
}

function buildZipfCumulative(poolSize: number): number[] {
  const cumulative = new Array<number>(poolSize);
  let total = 0;

  for (let i = 0; i < poolSize; i += 1) {
    total += 1 / (i + 1);
    cumulative[i] = total;
  }

  return cumulative;
}

function weightedIndex(cumulative: number[], target: number): number {
  let low = 0;
  let high = cumulative.length - 1;

  while (low < high) {
    const mid = (low + high) >> 1;

    if ((cumulative[mid] as number) < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export interface SeedListeningHistoryPrisma {
  listeningHistory: {
    createMany(args: { data: ListeningEventRow[] }): Promise<unknown>;
    deleteMany(args: Record<string, unknown>): Promise<unknown>;
  };
  track: { findMany(args: { select: { id: true } }): Promise<Array<{ id: number }>> };
  user: { findMany(args: { select: { id: true } }): Promise<Array<{ id: number }>> };
}

export interface SeedListeningHistoryOptions {
  events?: number;
  logger?: { info(message: string): void };
  poolSize?: number;
  /** Delete existing listening_history first (the catalog is never touched). */
  reset?: boolean;
}

export interface SeedListeningHistoryResult {
  inserted: number;
  tracks: number;
  users: number;
}

const SILENT_LOGGER = { info() {} };

export async function runSeedListeningHistory(
  prisma: SeedListeningHistoryPrisma,
  options: SeedListeningHistoryOptions = {},
): Promise<SeedListeningHistoryResult> {
  const logger = options.logger ?? SILENT_LOGGER;
  const events = options.events ?? DEFAULT_EVENTS;

  if (options.reset) {
    logger.info('Deleting existing listening_history rows (catalog untouched)');
    await prisma.listeningHistory.deleteMany({});
  }

  const [users, tracks] = await Promise.all([
    prisma.user.findMany({ select: { id: true } }),
    prisma.track.findMany({ select: { id: true } }),
  ]);

  logger.info(
    `Generating ${events} play events across ${users.length} users / ${tracks.length} tracks`,
  );

  const rows = generateListeningEvents({
    events,
    poolSize: options.poolSize,
    trackIds: tracks.map((track) => track.id),
    userIds: users.map((user) => user.id),
  });

  for (let start = 0; start < rows.length; start += INSERT_CHUNK_SIZE) {
    await prisma.listeningHistory.createMany({
      data: rows.slice(start, start + INSERT_CHUNK_SIZE),
    });
    logger.info(`Inserted ${Math.min(start + INSERT_CHUNK_SIZE, rows.length)}/${rows.length}`);
  }

  return { inserted: rows.length, tracks: tracks.length, users: users.length };
}

function parseArgs(argv: string[]): SeedListeningHistoryOptions {
  const options: SeedListeningHistoryOptions = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--reset') {
      options.reset = true;
      continue;
    }

    if (arg === '--events') {
      options.events = parseRequiredInt(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--pool-size') {
      options.poolSize = parseRequiredInt(argv, (index += 1), arg);
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

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer for ${flag}, got ${value}`);
  }

  return parsed;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const logger = { info: (message: string) => console.log(`[seed-history] ${message}`) };

  try {
    const result = await runSeedListeningHistory(prisma as unknown as SeedListeningHistoryPrisma, {
      ...parseArgs(process.argv.slice(2)),
      logger,
    });

    logger.info(`Done. inserted=${result.inserted} users=${result.users} tracks=${result.tracks}`);
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
