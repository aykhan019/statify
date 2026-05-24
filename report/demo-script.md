# Statify, In-Class Demo Script

**Duration target:** 10 minutes presentation + 2 minutes questions.
**Presenter cadence:** one minute per section, twelve sections, one buffer minute.
**Browser:** Chrome at 1440x900, zoom 100 percent. DevTools closed.

This script is the click-by-click walkthrough for the in-class demo. It assumes the production URLs are live (web on Vercel, API on Render warmed by the cron-job.org ping) and the seeded demo data is loaded. If a step fails, the recovery path is in section 13.

---

## 0. Pre-flight (do these before the room is full)

1. Open the web app's production URL in a fresh incognito window.
2. Open a second tab to Neon's SQL console with the demo database selected (for the live SQL section).
3. Open a third tab to the GitHub repo's main page (for the architecture section).
4. Confirm the Render service is warm: hit `/api/v1/healthz` and verify a 200 within 200 ms.
5. Have the two demo accounts open in a password manager:
   - **`demo@statify.local`** (regular user, populated listening history)
   - **`admin@statify.local`** (admin role, no listening history of its own)
6. Set the browser tab in a presentation-friendly state. Hide bookmarks bar.

---

## 1. Cold start: signup (90 seconds, M1)

Goal: prove the auth flow is honest end-to-end, not a button labeled "Login".

1. Navigate to `/` and click **Sign up** in the top-right.
2. Fill the form with a throwaway email (`presenter+demo@example.com`), display name "Presenter", and a 12-character password.
3. Submit. Land on `/me` with the sidebar visible and the audience seeing the empty-state Recent Listens page.
4. **Talking point:** "Passwords are hashed with Argon2id; the refresh token is rotated on every refresh; the access token is a 15-minute httpOnly JWT. The frontend never reads a password or a token."

**Recovery:** if signup fails, skip to step 2 with the seeded `demo@statify.local` account and explain login instead.

---

## 2. Catalog browsing and the audio player (90 seconds, M2 and M3)

Goal: show the read path through the catalog plus the audio player as a singleton.

1. Sidebar -> **Catalog** -> **Tracks**.
2. Scroll. Point out that the list keeps loading (infinite scroll, cursor-paginated).
3. Use the duration filter to clamp to "3 to 4 minutes". Note the result count drops.
4. Click a track with a preview-available indicator. Land on the track detail page.
5. Press play on the audio player. The 30-second iTunes preview starts.
6. Navigate away to **Catalog -> Artists**. The audio player keeps playing in the bottom sticky bar.
7. **Talking point:** "The audio player is a singleton Zustand store rendered in the (app) layout, so route navigation never interrupts playback. The play event fires exactly once per session per track via an idempotency key; duplicate POSTs are no-ops by virtue of `(user_id, idempotency_key)` UNIQUE on `listening_history`."

---

## 3. Global search (45 seconds, M4)

Goal: show trigram fuzzy search across three entity types.

1. Click the global search bar in the top header.
2. Type **`odeza`** (intentionally misspelled). Show the results panel: artists, albums, tracks each ranked by trigram similarity.
3. Click the top artist result, land on the artist detail page.
4. **Talking point:** "The search bar is backed by three GIN indexes with `gin_trgm_ops` on `artists.name`, `albums.name`, and `tracks.name`. Without those indexes, every keystroke would scan the full catalog."

---

## 4. Log out and switch to the seeded user (30 seconds)

Goal: get into a user with realistic listening history for analytics.

1. Click the avatar -> **Logout**.
2. Click **Login**. Enter `demo@statify.local` and the demo password.
3. Land on `/me`. The Recent listens page now shows several pages of seeded plays.

---

## 5. Recent listens and per-track counts (45 seconds, M3)

Goal: show the listening-history read path.

1. Stay on `/me` (Recent listens). Scroll once.
2. Click a track. On the track detail page, point out the **Play count** for this user.
3. **Talking point:** "The `(user_id, played_at DESC)` index on `listening_history` is the single most important index in the schema. Recent listens uses it directly; the next five surfaces all use it indirectly."

---

## 6. Top artists and top tracks (60 seconds, M5, Q1)

Goal: first advanced SQL query, live.

1. Sidebar -> **My stats** -> **Top artists**.
2. Show the Recharts bar chart and the ranked table.
3. **Talking point:** "This is the first advanced query: `DENSE_RANK()` over the listening-history window, grouped by artist, ordered by listen count with total minutes as the tiebreaker. The HAVING clause suppresses one-off plays."
4. Sidebar -> **Top tracks**. Same shape, grouped by track instead.

---

## 7. Discover (60 seconds, M5, Q2)

Goal: cohort-based recommendation from MPD co-occurrence.

1. Sidebar -> **Discover**.
2. Point out: every track shown is one the user has never played but appears on many MPD playlists alongside the user's top track.
3. **Talking point:** "Two chained CTEs. The first picks the user's most-listened track; the second materializes the MPD playlists that contain it. The outer query counts how many of those playlists also contain each candidate track, and excludes tracks the user has already heard via `NOT EXISTS`."

---

## 8. Listening heatmap and trending artists (60 seconds, M5, Q3 and Q4)

Goal: two more analytics surfaces.

1. Sidebar -> **Heatmap**. Show the 7x24 grid. Hover over a cell.
2. **Talking point:** "Composite GROUP BY on `EXTRACT(DOW)` and `EXTRACT(HOUR)`. Cells with zero plays are rendered client-side."
3. Sidebar -> **Trending**. Show the artist list with growth percentages.
4. **Talking point:** "Two sliding-window CTEs over the last seven days versus the prior seven, joined left so artists with zero prior plays still appear. The CASE expression handles the divide-by-zero edge."

---

## 9. Similar playlists and hidden gems (45 seconds, M5, Q5 and Q6)

Goal: the last two advanced queries.

1. Sidebar -> **Catalog -> Playlists**. Click any MPD playlist.
2. On the detail page, scroll to the **Similar playlists** rail.
3. **Talking point:** "Jaccard similarity computed inline: a FILTER aggregate counts the intersection, a UNION subquery counts the union, the ratio is rounded to four decimals."
4. Sidebar -> **Explore -> Hidden gems**.
5. **Talking point:** "LEFT JOIN to `listening_history` followed by `WHERE lh.id IS NULL` is the anti-join idiom for tracks nobody has played. The HAVING clause sets the minimum-playlist-count floor."

---

## 10. User playlists (45 seconds, M6)

Goal: show the user-authored content path.

1. Sidebar -> **My playlists** -> **New playlist**.
2. Name it **"Demo playlist"**, leave description blank, leave **Public** toggle off.
3. On the empty playlist page, click **Add tracks**. Search "midnight", add three.
4. Drag-and-drop reorder two tracks. The order persists.
5. Toggle **Public** on. Open a second incognito window to `/community` (no login). The playlist appears in the public feed.
6. **Talking point:** "Composite PK on `(user_playlist_id, pos)` forbids duplicate positions inside a playlist. Reorder is a single transactional positional rewrite."

---

## 11. Admin console (90 seconds, M7)

Goal: prove the admin surface is real and audit-logged.

1. Logout. Login as `admin@statify.local`.
2. Sidebar now shows **Admin** at the bottom.
3. **Admin -> Users.** Search "demo". Click **Change role** on the demo user, toggle to admin, save. The audit-log toast appears.
4. **Admin -> Audit log.** The role-change action is the most recent row. Filter by `action = user.role_change` and confirm.
5. **Admin -> Ingest.** Show the checkpoints table; explain that triggering an ingest run from here calls the same `runIngest` the CLI uses, in-process, with a single-slot guard.
6. **Talking point:** "Every privileged action writes an `audit_log` row in the same transaction as the state mutation. The role gate is layered: middleware checks the access cookie, the server-rendered admin layout checks the role, and the API enforces it via `@Roles('admin')`."

**Recovery:** if a role-change demo is too risky on live data, demonstrate the audit-log viewer with the existing seeded actions instead.

---

## 12. Live SQL: the advanced queries (45 seconds)

Goal: show that the queries are not fabricated for the report.

1. Switch to the Neon SQL console tab.
2. Paste the top-artists query from `report/sql-queries.md` Q1, substituting `$1 = 2` and `$2 = 5`.
3. Run it. The result matches the UI numbers from section 6.
4. **Talking point:** "The advanced queries are pure SQL. The frontend is a thin rendering layer over `prisma.$queryRaw` calls with bound parameters."

---

## 13. Recovery procedures (do not demo these; reference only)

| If this fails                                   | Do this                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Signup (section 1)                              | Skip to section 2 with `demo@statify.local`.                                                                                          |
| Audio playback (section 2)                      | Continue without audio. The play event will not fire; mention this and point at the seeded history for the analytics sections.        |
| Search bar returns nothing (section 3)          | Re-run with `tycho` (exact match against the seed).                                                                                   |
| Heatmap is empty (section 8)                    | Mention this in the demo script: "the seeded user only listens during business hours, so the early-morning cells are zero by design". |
| Admin role-change is too sensitive (section 11) | Demonstrate the audit-log viewer alone; do not mutate live state.                                                                     |
| Audio player breaks between sections            | Refresh the tab. The player state resets, the rest of the session is intact.                                                          |

---

## 14. Q&A anchors (be ready for these)

- **"How does the system handle duplicate plays?"** `(user_id, idempotency_key)` UNIQUE on `listening_history`. The client generates one key per session per track; retries are no-ops.
- **"What if a user changes their email?"** Email is the natural login identifier; the application id is a separate surrogate integer. All foreign keys reference the surrogate, so email mutations are a single-column update.
- **"How big is the database?"** Target 150 to 300 MB on Neon free tier, after a 10k to 25k MPD-playlist subset. The full MPD would be roughly 33 GB and is out of scope by design.
- **"Why six queries instead of five?"** The rubric minimum is five; we kept the sixth as a buffer in case any query was deemed insufficiently "advanced" during grading.
- **"What if iTunes goes down?"** The `tracks.preview_url` is cached persistently. Existing previews continue to play; new lookups silently degrade to "preview unavailable" until the seven-day retry.
- **"How would you scale this?"** The current bottleneck is Neon's free-tier compute. The schema and the queries are not the bottleneck. A move to a paid Neon tier or a self-hosted Postgres would multiply capacity without any schema change.

---

## 15. Closing (15 seconds)

"That's Statify. Repository link is on the board. The relational model write-up, the SQL query catalog, and the final report all live under `report/` in the repo. Thanks."

Click to the GitHub repo tab as you close.
