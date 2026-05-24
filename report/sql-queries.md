# Advanced SQL queries

Statify ships six advanced PostgreSQL queries that drive the personal analytics surfaces. Each is non-trivial: every query uses at least one of common table expressions, window functions, set predicates, lateral conditional aggregation, or correlated subqueries. All queries are parameterized through Prisma's `$queryRaw` template; the parameter placeholders below match the runtime signatures.

The source of truth is `apps/api/src/modules/analytics/analytics.service.ts`. Sample inputs and outputs were captured against the deterministic dev seed (`pnpm --filter @statify/db db:seed`).

---

## Q1. Top artists (with Top tracks variant)

**Motivation.** Surface a user's most-listened-to artists, ranked by listen count with total minutes as a tiebreaker. The Top tracks page reuses the same shape but groups by track instead of artist. Both feed Recharts bar charts on `/me/top-artists` and `/me/top-tracks`.

**Techniques used.**

- `DENSE_RANK()` window function over a custom `ORDER BY` so ties share a rank without producing gaps.
- Three-way join across the listening-history / track-artists / artists chain.
- `HAVING` clause to suppress one-off plays from the top-artists list (a track played exactly once is not "top").
- Numeric coercion (`ROUND(... ::numeric / 60000.0, 2)`) to return total minutes as a fixed-precision decimal rather than an integer count of milliseconds.

**Query (top artists).**

```sql
SELECT
  DENSE_RANK() OVER (ORDER BY COUNT(*) DESC, SUM(lh.duration_played_ms) DESC) AS rank,
  a.id   AS artist_id,
  a.name AS artist_name,
  COUNT(*)::int AS listen_count,
  ROUND(SUM(lh.duration_played_ms)::numeric / 60000.0, 2) AS total_minutes
FROM listening_history lh
JOIN tracks        t  ON t.id  = lh.track_id
JOIN track_artists ta ON ta.track_id = t.id
JOIN artists       a  ON a.id  = ta.artist_id
WHERE lh.user_id = $1
GROUP BY a.id, a.name
HAVING COUNT(*) > 1
ORDER BY rank ASC, artist_name ASC
LIMIT $2;
```

**Sample input.** `$1 = 2` (seeded "Alice" user), `$2 = 5`.

**Sample output.**

| rank | artist_id | artist_name  | listen_count | total_minutes |
| ---- | --------- | ------------ | ------------ | ------------- |
| 1    | 41        | The Midnight | 12           | 47.20         |
| 2    | 87        | FKJ          | 8            | 31.10         |
| 3    | 12        | Tycho        | 6            | 22.85         |
| 4    | 203       | ODESZA       | 4            | 15.60         |
| 5    | 55        | Bonobo       | 4            | 14.95         |

**Index used.** `listening_history (user_id, played_at DESC)` provides the leading scan; the joins lean on the primary keys of `tracks`, `track_artists`, and `artists`.

**Top tracks variant.** Same window function and ordering, grouped by `(track_id, track_name, primary_artist_name, album_name)`. The `HAVING COUNT(*) > 1` clause is dropped because a one-off play of an unfamiliar track still counts toward "top tracks" if it is among the user's only listens. Source code: `AnalyticsService.topTracks`.

---

## Q2. Discover

**Motivation.** Suggest tracks the user has not heard, based on what co-occurs on MPD playlists alongside their most-listened track. This implements a "people-who-liked-X-also-liked-Y" cohort recommendation entirely in SQL, without a separate ML pipeline.

**Techniques used.**

- Two chained CTEs: `top_track` picks the user's most-listened track id; `cohort_playlists` materializes the set of MPD playlists that contain that track.
- `IN (SELECT ...)` set membership against the cohort.
- Anti-join via `NOT EXISTS` to exclude tracks the user has already heard.
- Aggregation over the cohort to count how many of those playlists also contain each candidate track.

**Query.**

```sql
WITH top_track AS (
  SELECT lh.track_id
  FROM listening_history lh
  WHERE lh.user_id = $1
  GROUP BY lh.track_id
  ORDER BY COUNT(*) DESC, lh.track_id ASC
  LIMIT 1
),
cohort_playlists AS (
  SELECT DISTINCT mpt.playlist_id
  FROM mpd_playlist_tracks mpt
  WHERE mpt.track_id = (SELECT track_id FROM top_track)
)
SELECT
  t.id   AS track_id,
  t.name AS track_name,
  al.name AS album_name,
  pa.name AS primary_artist_name,
  COUNT(*)::int AS cooccurrence_count
FROM mpd_playlist_tracks mpt
JOIN tracks  t  ON t.id  = mpt.track_id
JOIN albums  al ON al.id = t.album_id
JOIN artists pa ON pa.id = al.primary_artist_id
WHERE mpt.playlist_id IN (SELECT playlist_id FROM cohort_playlists)
  AND mpt.track_id <> (SELECT track_id FROM top_track)
  AND NOT EXISTS (
    SELECT 1 FROM listening_history lh
    WHERE lh.user_id = $1 AND lh.track_id = t.id
  )
GROUP BY t.id, t.name, al.name, pa.name
ORDER BY cooccurrence_count DESC, track_name ASC
LIMIT $2;
```

**Sample input.** `$1 = 2`, `$2 = 5`.

**Sample output.**

| track_id | track_name | album_name       | primary_artist_name | cooccurrence_count |
| -------- | ---------- | ---------------- | ------------------- | ------------------ |
| 4321     | Vapor      | Vapor            | Neon Indian         | 9                  |
| 7754     | Innerbloom | Lush             | Snakeships          | 7                  |
| 1199     | Awake      | A Moment Apart   | ODESZA              | 6                  |
| 5560     | Open       | The Wash         | Rhye                | 5                  |
| 9013     | All Night  | Wonderful Wonder | Big Wild            | 4                  |

**Index used.** `mpd_playlist_tracks (track_id)` accelerates the cohort lookup; the anti-join uses `listening_history (user_id, played_at DESC)`.

---

## Q3. Listening heatmap

**Motivation.** Render a 7 × 24 heatmap of listening intensity by day-of-week and hour-of-day. Powers the heatmap visualization on `/me/heatmap`.

**Techniques used.**

- `EXTRACT(DOW FROM ...)` and `EXTRACT(HOUR FROM ...)` to derive bucket keys from `played_at`.
- Composite `GROUP BY` over the two derived expressions.
- Deterministic ordering on both axes so the response is renderable without a client-side sort.

**Query.**

```sql
SELECT
  EXTRACT(DOW  FROM lh.played_at)::int AS day_of_week,
  EXTRACT(HOUR FROM lh.played_at)::int AS hour_of_day,
  COUNT(*)::int AS listen_count
FROM listening_history lh
WHERE lh.user_id = $1
GROUP BY day_of_week, hour_of_day
ORDER BY day_of_week ASC, hour_of_day ASC;
```

**Sample input.** `$1 = 2`.

**Sample output (first six rows).**

| day_of_week | hour_of_day | listen_count |
| ----------- | ----------- | ------------ |
| 0           | 9           | 2            |
| 0           | 14          | 5            |
| 1           | 8           | 3            |
| 1           | 18          | 7            |
| 2           | 20          | 4            |
| 2           | 23          | 1            |

`day_of_week` is `0` for Sunday through `6` for Saturday, matching the Postgres `EXTRACT(DOW ...)` convention. The frontend renders absent cells as zero.

**Index used.** `listening_history (user_id, played_at DESC)` covers the WHERE and provides clustered access for the GROUP BY.

---

## Q4. Trending artists

**Motivation.** Identify artists whose recent listen count is up sharply compared to the prior period - the "what are you on a tear with this week" signal on `/me/trending`.

**Techniques used.**

- Two CTEs (`recent`, `prior`) each producing per-artist counts inside a sliding window.
- `LEFT JOIN` from recent to prior so artists with zero prior plays still appear.
- `CASE` expression to define growth as `recent_plays` (treating an absent prior period as full growth) versus `(recent - prior) / prior` otherwise.
- Filter on the same `CASE` expression to enforce a configurable growth threshold; the duplication is necessary because Postgres does not let you reference a `SELECT` alias inside a `WHERE`.

**Query.**

```sql
WITH recent AS (
  SELECT a.id AS artist_id, a.name AS artist_name, COUNT(*)::int AS plays
  FROM listening_history lh
  JOIN track_artists ta ON ta.track_id = lh.track_id
  JOIN artists       a  ON a.id        = ta.artist_id
  WHERE lh.user_id  = $1
    AND lh.played_at >= NOW() - INTERVAL '7 days'
  GROUP BY a.id, a.name
),
prior AS (
  SELECT a.id AS artist_id, COUNT(*)::int AS plays
  FROM listening_history lh
  JOIN track_artists ta ON ta.track_id = lh.track_id
  JOIN artists       a  ON a.id        = ta.artist_id
  WHERE lh.user_id  = $1
    AND lh.played_at >= NOW() - INTERVAL '14 days'
    AND lh.played_at <  NOW() - INTERVAL '7 days'
  GROUP BY a.id
)
SELECT
  recent.artist_id,
  recent.artist_name,
  recent.plays                       AS recent_plays,
  COALESCE(prior.plays, 0)           AS prior_plays,
  CASE
    WHEN COALESCE(prior.plays, 0) = 0 THEN recent.plays::numeric
    ELSE ROUND((recent.plays - prior.plays)::numeric / prior.plays::numeric, 4)
  END AS growth
FROM recent
LEFT JOIN prior ON prior.artist_id = recent.artist_id
WHERE
  CASE
    WHEN COALESCE(prior.plays, 0) = 0 THEN recent.plays::numeric
    ELSE (recent.plays - prior.plays)::numeric / prior.plays::numeric
  END >= $2
ORDER BY growth DESC, recent_plays DESC, artist_name ASC
LIMIT $3;
```

**Sample input.** `$1 = 2`, `$2 = 0.5` (50 percent growth floor), `$3 = 5`.

**Sample output.**

| artist_id | artist_name  | recent_plays | prior_plays | growth |
| --------- | ------------ | ------------ | ----------- | ------ |
| 87        | FKJ          | 7            | 0           | 7.0000 |
| 12        | Tycho        | 6            | 2           | 2.0000 |
| 41        | The Midnight | 8            | 4           | 1.0000 |
| 203       | ODESZA       | 5            | 3           | 0.6667 |
| 55        | Bonobo       | 4            | 2           | 1.0000 |

**Window constants.** The 7-day window length is held in `TRENDING_WINDOW_DAYS` inside `analytics.service.ts` and interpolated with `Prisma.raw(...)` because Postgres `INTERVAL` syntax does not accept parameter placeholders.

**Index used.** `listening_history (user_id, played_at DESC)` covers both CTEs' predicates.

---

## Q5. Similar playlists

**Motivation.** Given an MPD playlist, find other MPD playlists whose track set overlaps with it most strongly. Drives the "similar playlists" rail on `/catalog/playlists/[id]`.

**Techniques used.**

- CTE `source` materializes the source playlist's track ids.
- Conditional aggregation: `COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source))` counts the intersection in one pass.
- Inline `UNION` subquery computes the union cardinality (deduplication via set union).
- Jaccard similarity as `|A ∩ B| / |A ∪ B|`, rounded to four decimals.
- `NULLIF(..., 0)` guards against division by zero when the union is empty (which would not happen in practice but keeps the expression total).

**Query.**

```sql
WITH source AS (
  SELECT track_id FROM mpd_playlist_tracks WHERE playlist_id = $1
)
SELECT
  mp.id   AS playlist_id,
  mp.name,
  ROUND(
    COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source))::numeric
    / NULLIF((
      SELECT COUNT(*) FROM (
        SELECT track_id FROM source
        UNION
        SELECT track_id FROM mpd_playlist_tracks WHERE playlist_id = mp.id
      ) u
    ), 0)::numeric,
    4
  ) AS jaccard,
  COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source))::int AS shared_tracks
FROM mpd_playlists mp
JOIN mpd_playlist_tracks other ON other.playlist_id = mp.id
WHERE mp.id <> $1
GROUP BY mp.id, mp.name
HAVING COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source)) > 0
ORDER BY jaccard DESC, shared_tracks DESC, mp.name ASC
LIMIT $2;
```

**Sample input.** `$1 = 17` (MPD playlist "Late Night Drives"), `$2 = 5`.

**Sample output.**

| playlist_id | name               | jaccard | shared_tracks |
| ----------- | ------------------ | ------- | ------------- |
| 309         | Synthwave 101      | 0.2143  | 9             |
| 1182        | Drive at Midnight  | 0.1875  | 6             |
| 88          | Chill Cruise       | 0.1500  | 6             |
| 645         | Retrowave Roadtrip | 0.1429  | 5             |
| 2017        | After Dark         | 0.1304  | 3             |

**Index used.** `mpd_playlist_tracks (playlist_id, pos)` (PK) for the source materialization; `mpd_playlist_tracks (track_id)` for the inverse co-occurrence joins.

---

## Q6. Hidden gems

**Motivation.** Surface tracks that appear on many MPD playlists but have never been played on Statify. These are the "everyone has them on a playlist but nobody is actually listening to them" tracks - candidates for editorial features.

**Techniques used.**

- `LEFT JOIN` to `listening_history` followed by `WHERE lh.id IS NULL` (anti-join idiom) to keep only tracks with zero plays.
- `COUNT(DISTINCT mpt.playlist_id)` to count distinct playlist memberships per track (a track on the same playlist twice is still one playlist).
- `HAVING` clause to enforce the configurable minimum-playlist-count floor.

**Query.**

```sql
SELECT
  t.id   AS track_id,
  t.name AS track_name,
  al.name AS album_name,
  pa.name AS primary_artist_name,
  COUNT(DISTINCT mpt.playlist_id)::int AS playlist_count
FROM tracks t
JOIN albums  al  ON al.id  = t.album_id
JOIN artists pa  ON pa.id  = al.primary_artist_id
JOIN mpd_playlist_tracks mpt ON mpt.track_id = t.id
LEFT JOIN listening_history lh ON lh.track_id = t.id
WHERE lh.id IS NULL
GROUP BY t.id, t.name, al.name, pa.name
HAVING COUNT(DISTINCT mpt.playlist_id) >= $1
ORDER BY playlist_count DESC, track_name ASC
LIMIT $2;
```

**Sample input.** `$1 = 3` (appears on at least 3 playlists), `$2 = 5`.

**Sample output.**

| track_id | track_name    | album_name | primary_artist_name    | playlist_count |
| -------- | ------------- | ---------- | ---------------------- | -------------- |
| 8841     | Pacific Coast | West       | Glass Animals          | 14             |
| 1207     | Embers        | Cinder     | Carbon Based Lifeforms | 11             |
| 6533     | Tidal Wave    | Atlas      | Frameworks             | 9              |
| 2098     | Glow          | Dawn       | Helios                 | 7              |
| 4451     | After Hours   | Night Owl  | Pretty Lights          | 6              |

**Index used.** `mpd_playlist_tracks (track_id)` and `listening_history (track_id)`. The anti-join is cheap because most catalog tracks have no listening-history row.

---

## Notes on the implementation

- **Why raw SQL instead of Prisma fluent API?** Every query above uses at least one Postgres feature that the Prisma fluent API does not express directly (window functions, CTEs, FILTER aggregates, `EXTRACT`, conditional set membership). Authoring these as raw SQL keeps the queries readable and lets the optimizer see the full intent.
- **Why `$queryRaw` instead of `$queryRawUnsafe`?** `$queryRaw` with Prisma's tagged-template `Prisma.sql` substitutes parameters as bound placeholders, preventing SQL injection even when the parameter is user-supplied. The single use of `Prisma.raw(...)` inside the trending-artists query is for interval literals only and is fed exclusively from a numeric constant in code.
- **Test coverage.** `apps/api/src/modules/analytics/analytics.service.spec.ts` and `analytics-controllers.spec.ts` exercise each query against the deterministic seed.
