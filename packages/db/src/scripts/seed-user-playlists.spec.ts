import { describe, expect, it } from 'vitest';
import { buildCommunityUsers, generatePlaylistPlan } from './seed-user-playlists';

function seededRng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const trackPool = Array.from({ length: 1000 }, (_, index) => index + 1);

describe('generatePlaylistPlan', () => {
  it('creates 2-5 playlists per community user plus the current user mix', () => {
    const plans = generatePlaylistPlan({
      communityUserIds: [10, 20, 30],
      currentUserId: 1,
      rng: seededRng(11),
      trackPool,
    });

    const communityPlans = plans.filter((plan) => plan.userId !== 1);
    const currentPlans = plans.filter((plan) => plan.userId === 1);

    for (const userId of [10, 20, 30]) {
      const count = communityPlans.filter((plan) => plan.userId === userId).length;
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(5);
    }

    // The current user always gets the fixed set with a public/private mix (mostly public).
    expect(currentPlans).toHaveLength(5);
    expect(currentPlans.some((plan) => plan.isPublic)).toBe(true);
    expect(currentPlans.some((plan) => !plan.isPublic)).toBe(true);
    expect(currentPlans.filter((plan) => plan.isPublic).length).toBeGreaterThan(
      currentPlans.filter((plan) => !plan.isPublic).length,
    );
  });

  it('produces valid playlists: distinct names per user, bounded distinct tracks', () => {
    const plans = generatePlaylistPlan({
      communityUserIds: [10],
      currentUserId: null,
      rng: seededRng(3),
      trackPool,
    });

    const names = plans.map((plan) => plan.name);
    expect(new Set(names).size).toBe(names.length);

    for (const plan of plans) {
      expect(plan.name.length).toBeLessThanOrEqual(120);
      expect(plan.trackIds.length).toBeGreaterThanOrEqual(12);
      expect(plan.trackIds.length).toBeLessThanOrEqual(28);
      expect(new Set(plan.trackIds).size).toBe(plan.trackIds.length);
      expect(plan.trackIds.every((id) => trackPool.includes(id))).toBe(true);
    }
  });

  it('omits the current user when none is provided', () => {
    const plans = generatePlaylistPlan({
      communityUserIds: [10],
      currentUserId: null,
      rng: seededRng(5),
      trackPool,
    });

    expect(plans.every((plan) => plan.userId === 10)).toBe(true);
  });

  it('throws when the track pool is empty', () => {
    expect(() =>
      generatePlaylistPlan({ communityUserIds: [10], currentUserId: 1, trackPool: [] }),
    ).toThrow(/track pool/);
  });
});

describe('buildCommunityUsers', () => {
  it('keeps the base named users first and generates the rest with unique emails', () => {
    const users = buildCommunityUsers(40);

    expect(users).toHaveLength(40);
    expect(users[0]?.email).toBe('maya.rivers@statify.demo');
    expect(new Set(users.map((user) => user.email)).size).toBe(40);
    expect(users.every((user) => user.displayName.length > 0)).toBe(true);
  });

  it('returns just the requested base users when the count is small', () => {
    expect(buildCommunityUsers(3)).toHaveLength(3);
  });
});
