import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../seed/passwords';

const CURRENT_USER_EMAIL = 'ayxan@gmail.com';
const DEMO_PASSWORD = 'statify-demo';
const TRACK_POOL_SIZE = 4000;
const MIN_TRACKS_PER_PLAYLIST = 12;
const MAX_TRACKS_PER_PLAYLIST = 28;
const DEFAULT_PUBLIC_RATIO = 0.8;
const INSERT_CHUNK_SIZE = 500;

const COMMUNITY_USERS = [
  { email: 'maya.rivers@statify.demo', displayName: 'Maya Rivers' },
  { email: 'dj.nova@statify.demo', displayName: 'DJ Nova' },
  { email: 'leo.park@statify.demo', displayName: 'Leo Park' },
  { email: 'sasha.kim@statify.demo', displayName: 'Sasha Kim' },
  { email: 'theo.bennett@statify.demo', displayName: 'Theo Bennett' },
  { email: 'indie.aoki@statify.demo', displayName: 'Indie Aoki' },
  { email: 'ravi.mehta@statify.demo', displayName: 'Ravi Mehta' },
  { email: 'elena.costa@statify.demo', displayName: 'Elena Costa' },
] as const;

const PLAYLIST_NAMES = [
  'Late Night Drive',
  'Morning Coffee',
  'Workout Energy',
  'Indie Discoveries',
  'Throwback Anthems',
  'Focus Flow',
  'Rainy Day Mood',
  'Party Starters',
  'Acoustic Sessions',
  'Road Trip Mix',
  'Chill Vibes',
  'Deep Cuts',
  'Summer Nights',
  'Heartbreak Hour',
  'Gym Beasts',
  'Sunday Reset',
  'Underrated Bangers',
  'Coffeehouse',
] as const;

const PLAYLIST_DESCRIPTIONS = [
  null,
  null,
  'On repeat lately.',
  'Songs that never get old.',
  'Turn it up.',
  'Low-key background mix.',
  'A little something for everyone.',
] as const;

// The current user gets a deliberate public/private mix, mostly public.
const CURRENT_USER_PLAYLISTS = [
  { name: 'My Favorites', isPublic: true },
  { name: 'Coding Focus', isPublic: true },
  { name: 'Gym', isPublic: true },
  { name: 'Guilty Pleasures', isPublic: false },
  { name: 'Demos & Drafts', isPublic: false },
] as const;

export interface PlaylistPlan {
  description: string | null;
  isPublic: boolean;
  name: string;
  trackIds: number[];
  userId: number;
}

export interface GeneratePlaylistPlanOptions {
  communityUserIds: number[];
  currentUserId: number | null;
  publicRatio?: number;
  rng?: () => number;
  trackPool: number[];
}

/**
 * Builds the playlist plan: each community user gets 1-3 mostly-public playlists, and the current
 * user gets a fixed public/private mix. Tracks are sampled from the pool so covers render.
 */
export function generatePlaylistPlan(options: GeneratePlaylistPlanOptions): PlaylistPlan[] {
  const rng = options.rng ?? Math.random;
  const publicRatio = options.publicRatio ?? DEFAULT_PUBLIC_RATIO;
  const plans: PlaylistPlan[] = [];

  if (options.trackPool.length === 0) {
    throw new Error('Cannot seed playlists without a track pool');
  }

  for (const userId of options.communityUserIds) {
    const count = 1 + Math.floor(rng() * 3); // 1-3 playlists
    const names = pickDistinct(PLAYLIST_NAMES, count, rng);

    for (const name of names) {
      plans.push({
        description: pick(PLAYLIST_DESCRIPTIONS, rng),
        isPublic: rng() < publicRatio,
        name,
        trackIds: sampleTracks(options.trackPool, rng),
        userId,
      });
    }
  }

  if (options.currentUserId !== null) {
    for (const playlist of CURRENT_USER_PLAYLISTS) {
      plans.push({
        description: null,
        isPublic: playlist.isPublic,
        name: playlist.name,
        trackIds: sampleTracks(options.trackPool, rng),
        userId: options.currentUserId,
      });
    }
  }

  return plans;
}

function sampleTracks(pool: number[], rng: () => number): number[] {
  const count = Math.min(
    MIN_TRACKS_PER_PLAYLIST +
      Math.floor(rng() * (MAX_TRACKS_PER_PLAYLIST - MIN_TRACKS_PER_PLAYLIST + 1)),
    pool.length,
  );

  const copy = pool.slice();

  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const swap = copy[i] as number;
    copy[i] = copy[j] as number;
    copy[j] = swap;
  }

  return copy.slice(0, count);
}

function pickDistinct<T>(items: readonly T[], count: number, rng: () => number): T[] {
  const copy = items.slice();
  const take = Math.min(count, copy.length);

  for (let i = 0; i < take; i += 1) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const swap = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = swap;
  }

  return copy.slice(0, take);
}

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)] as T;
}

export interface SeedUserPlaylistsOptions {
  logger?: { info(message: string): void };
  reset?: boolean;
}

export interface SeedUserPlaylistsResult {
  communityUsers: number;
  playlists: number;
  publicPlaylists: number;
  tracks: number;
}

const SILENT_LOGGER = { info() {} };

export async function runSeedUserPlaylists(
  prisma: PrismaClient,
  options: SeedUserPlaylistsOptions = {},
): Promise<SeedUserPlaylistsResult> {
  const logger = options.logger ?? SILENT_LOGGER;

  if (options.reset) {
    logger.info('Clearing existing user playlists (catalog and accounts untouched)');
    await prisma.userPlaylistTrack.deleteMany({});
    await prisma.userPlaylist.deleteMany({});
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  await prisma.user.createMany({
    data: COMMUNITY_USERS.map((user) => ({ ...user, passwordHash })),
    skipDuplicates: true,
  });

  const communityUsers = await prisma.user.findMany({
    where: { email: { in: COMMUNITY_USERS.map((user) => user.email) } },
    select: { id: true },
  });
  const currentUser = await prisma.user.findUnique({
    where: { email: CURRENT_USER_EMAIL },
    select: { id: true },
  });

  if (currentUser === null) {
    logger.info(`Current user ${CURRENT_USER_EMAIL} not found; skipping their playlists`);
  }

  const trackPool = await loadTrackPool(prisma);
  logger.info(`Loaded track pool of ${trackPool.length} tracks with cover art`);

  const plans = generatePlaylistPlan({
    communityUserIds: communityUsers.map((user) => user.id),
    currentUserId: currentUser?.id ?? null,
    trackPool,
  });

  let trackRows = 0;

  for (const plan of plans) {
    const playlist = await prisma.userPlaylist.create({
      data: {
        description: plan.description,
        isPublic: plan.isPublic,
        name: plan.name,
        userId: plan.userId,
      },
      select: { id: true },
    });

    const rows = plan.trackIds.map((trackId, pos) => ({
      pos,
      trackId,
      userPlaylistId: playlist.id,
    }));

    for (let start = 0; start < rows.length; start += INSERT_CHUNK_SIZE) {
      await prisma.userPlaylistTrack.createMany({
        data: rows.slice(start, start + INSERT_CHUNK_SIZE),
      });
    }

    trackRows += rows.length;
  }

  return {
    communityUsers: communityUsers.length,
    playlists: plans.length,
    publicPlaylists: plans.filter((plan) => plan.isPublic).length,
    tracks: trackRows,
  };
}

async function loadTrackPool(prisma: PrismaClient): Promise<number[]> {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
    `SELECT t.id FROM tracks t JOIN albums a ON a.id = t.album_id
     WHERE a.image_url IS NOT NULL ORDER BY random() LIMIT ${TRACK_POOL_SIZE}`,
  );

  return rows.map((row) => row.id);
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const reset = process.argv.slice(2).includes('--reset');
  const logger = { info: (message: string) => console.log(`[seed-playlists] ${message}`) };

  try {
    const result = await runSeedUserPlaylists(prisma, { logger, reset });
    logger.info(
      `Done. communityUsers=${result.communityUsers} playlists=${result.playlists} public=${result.publicPlaylists} tracks=${result.tracks}`,
    );
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
