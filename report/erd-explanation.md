# Relational model

This document accompanies `docs/erd.dbml` (the diagram source) and `docs/erd.png` (the rendered image). It explains the entities, their keys, their relationships, and the normalization rationale behind each design choice.

## 1. Overview

The Statify schema is split into two zones that share a single PostgreSQL database but never write to each other's rows:

- **MPD-derived catalog** (`artists`, `albums`, `tracks`, `track_artists`, `mpd_playlists`, `mpd_playlist_tracks`): read-mostly. Populated by the ingest CLI from the Spotify Million Playlist Dataset and enriched lazily with iTunes preview metadata. Application code reads from these tables but never updates them through user-facing endpoints.
- **App-layer** (`users`, `refresh_tokens`, `listening_history`, `user_playlists`, `user_playlist_tracks`, `audit_log`, `ingest_checkpoints`): read-write. These hold session state, user activity, user-authored content, the privileged-action audit trail, and the ingest job state.

The two zones meet at exactly three foreign keys: `listening_history.track_id`, `user_playlist_tracks.track_id`, and the iTunes-enrichment columns on `tracks` (`itunes_track_id`, `preview_url`, `preview_fetched_at`). Catalog identity (`tracks.id`) is stable across ingest reruns because the ingest CLI upserts on `tracks.spotify_uri`, so app-layer foreign keys do not get invalidated by re-runs.

## 2. Entities

### 2.1 artists

| Attribute       | Type      | Notes                                                                                        |
| --------------- | --------- | -------------------------------------------------------------------------------------------- |
| id              | int PK    | Surrogate, auto-incremented.                                                                 |
| spotify_uri     | text      | Natural key from MPD. UNIQUE; ingest upserts on this column.                                 |
| name            | text      | Display name, preserving the source casing.                                                  |
| normalized_name | text      | Lower-cased, punctuation-stripped form used for case-insensitive joins during ingest dedupe. |
| created_at      | timestamp | Default `now()`.                                                                             |

**Candidate keys:** `id` (surrogate), `spotify_uri` (natural). The surrogate is preferred for foreign keys so the schema survives a hypothetical change of upstream URI scheme.

**Indexes:** B-tree on `normalized_name` (ingest dedupe), GIN on `name` with `gin_trgm_ops` (fuzzy search bar).

### 2.2 albums

| Attribute         | Type      | Notes                                       |
| ----------------- | --------- | ------------------------------------------- |
| id                | int PK    | Surrogate.                                  |
| spotify_uri       | text      | UNIQUE; natural key.                        |
| name              | text      |                                             |
| primary_artist_id | int FK    | -> `artists.id`. Album-level artist credit. |
| created_at        | timestamp | Default `now()`.                            |

Each album belongs to exactly one primary artist. Featured artists on tracks within the album are recorded in `track_artists` rather than here, because the MPD payload provides featured credits at track granularity, not album granularity.

### 2.3 tracks

| Attribute          | Type      | Notes                                                         |
| ------------------ | --------- | ------------------------------------------------------------- |
| id                 | int PK    | Surrogate.                                                    |
| spotify_uri        | text      | UNIQUE; natural key.                                          |
| name               | text      |                                                               |
| album_id           | int FK    | -> `albums.id`. Each track belongs to exactly one album.      |
| duration_ms        | int       | Track length from MPD payload.                                |
| itunes_track_id    | bigint    | Nullable. Populated on first successful iTunes Search lookup. |
| preview_url        | text      | Nullable. URL of the 30-second preview clip.                  |
| preview_fetched_at | timestamp | Nullable. Cache timestamp; gates TTL-based re-fetch.          |

The three iTunes columns are intentionally co-located on `tracks` rather than in a separate `track_previews` table because the relationship is strictly 1:1, the iTunes payload contains no other fields that we persist, and a single-table read makes the player path one query shorter. Splitting them would have been pure normalization theater.

**Indexes:** B-tree on `album_id`, B-tree on `preview_url`, GIN on `name` with `gin_trgm_ops`, and a partial B-tree on `id` `WHERE preview_url IS NOT NULL` to accelerate the preview-availability filter without scanning the full table.

### 2.4 track_artists

Junction table resolving the many-to-many between `tracks` and `artists`.

| Attribute | Type                   | Notes                    |
| --------- | ---------------------- | ------------------------ |
| track_id  | int FK PK              | -> `tracks.id`.          |
| artist_id | int FK PK              | -> `artists.id`.         |
| role      | track_artist_role enum | `primary` or `featured`. |

**Composite primary key:** `(track_id, artist_id)`. A track may not list the same artist twice with different roles; if both `primary` and `featured` apply, `primary` wins. This is deliberate: it forbids the ambiguous case where a single artist appears twice in the credits.

### 2.5 mpd_playlists

| Attribute     | Type      | Notes                                                |
| ------------- | --------- | ---------------------------------------------------- |
| id            | int PK    | Surrogate.                                           |
| mpd_pid       | int       | UNIQUE; the playlist id used by the MPD source JSON. |
| name          | text      |                                                      |
| collaborative | boolean   | Default `false`.                                     |
| modified_at   | timestamp | Last-modified marker from the MPD payload.           |
| num_followers | int       | Cached counts from the source payload.               |
| num_edits     | int       |                                                      |
| duration_ms   | bigint    | Sum of track durations, stored to avoid a recompute. |

The `mpd_pid` uniqueness lets the ingest CLI run idempotently: re-running a slice upserts existing rows by `mpd_pid` rather than creating duplicates.

### 2.6 mpd_playlist_tracks

Junction table resolving the many-to-many between `mpd_playlists` and `tracks`, preserving positional order.

| Attribute   | Type      | Notes                  |
| ----------- | --------- | ---------------------- |
| playlist_id | int FK PK | -> `mpd_playlists.id`. |
| track_id    | int FK    | -> `tracks.id`.        |
| pos         | int PK    | 0-indexed position.    |

**Composite primary key:** `(playlist_id, pos)`. This shape makes (a) duplicate-position inserts impossible and (b) similar-playlist Jaccard set operations efficient because the leading column matches the predicate.

A secondary index on `track_id` supports the inverse lookup ("which playlists contain this track") used by the Discover query.

### 2.7 users

| Attribute     | Type           | Notes                                    |
| ------------- | -------------- | ---------------------------------------- |
| id            | int PK         | Surrogate.                               |
| email         | text           | UNIQUE; natural login identifier.        |
| password_hash | text           | Argon2id hash.                           |
| display_name  | text           |                                          |
| role          | user_role enum | `user` (default) or `admin`.             |
| created_at    | timestamp      | Default `now()`.                         |
| last_login_at | timestamp      | Nullable; refreshed on successful login. |
| deleted_at    | timestamp      | Nullable; soft-delete tombstone.         |
| banned_at     | timestamp      | Nullable; admin-ban tombstone.           |

**Soft delete and ban** are stored as nullable timestamps rather than booleans so the schema records _when_ the state changed without an extra table. The auth lookup filters `deleted_at IS NULL AND banned_at IS NULL`, so a deleted or banned user gets a generic `INVALID_CREDENTIALS` error rather than a state-distinguishing message. Listening history of soft-deleted users is intentionally retained for population-level analytics; if hard-deletion is later required, the existing `ON DELETE RESTRICT` cascade chain enforces an explicit purge path.

### 2.8 refresh_tokens

| Attribute  | Type      | Notes                                                                               |
| ---------- | --------- | ----------------------------------------------------------------------------------- |
| id         | int PK    | Surrogate.                                                                          |
| user_id    | int FK    | -> `users.id`. One user has many active tokens (one per device).                    |
| token_hash | text      | UNIQUE. SHA-256 of the raw refresh token; the raw value never reaches the database. |
| expires_at | timestamp | Hard expiry; rotation issues a new row.                                             |
| revoked_at | timestamp | Nullable; non-null means logged-out or invalidated.                                 |
| user_agent | text      | Nullable diagnostic.                                                                |
| ip_addr    | text      | Nullable diagnostic.                                                                |
| created_at | timestamp | Default `now()`.                                                                    |

**Why this table exists:** access JWTs are stateless and short-lived; refresh tokens need server-side revocation for logout, password change, ban, and role change. Storing only the hash means a database read does not expose any usable token.

### 2.9 listening_history

| Attribute          | Type                  | Notes                                                        |
| ------------------ | --------------------- | ------------------------------------------------------------ |
| id                 | int PK                | Surrogate.                                                   |
| user_id            | int FK                | -> `users.id`.                                               |
| track_id           | int FK                | -> `tracks.id`.                                              |
| played_at          | timestamp             | Default `now()`. Server-assigned to avoid client-clock skew. |
| source             | listening_source enum | `preview` (real play) or `seed` (dev fixture).               |
| duration_played_ms | int                   | Captured at the point the event is recorded.                 |
| idempotency_key    | text                  | Nullable. Client-supplied to deduplicate retries.            |

**Uniqueness:** `(user_id, idempotency_key)` is UNIQUE. The `user_id` scoping is deliberate so two users can independently use the same client-generated key without collision.

**Index:** `(user_id, played_at DESC)` is the workhorse for Recent listens, Top artists, Top tracks, Heatmap, and Trending artists. Track-side reverse lookup uses the secondary index on `track_id`.

### 2.10 user_playlists

| Attribute   | Type      | Notes                                                 |
| ----------- | --------- | ----------------------------------------------------- |
| id          | int PK    | Surrogate.                                            |
| user_id     | int FK    | -> `users.id`.                                        |
| name        | text      |                                                       |
| description | text      | Nullable.                                             |
| is_public   | boolean   | Default `false`. Gates inclusion in community browse. |
| created_at  | timestamp | Default `now()`.                                      |
| updated_at  | timestamp | Auto-updated on mutation.                             |

### 2.11 user_playlist_tracks

| Attribute        | Type      | Notes                   |
| ---------------- | --------- | ----------------------- |
| user_playlist_id | int FK PK | -> `user_playlists.id`. |
| track_id         | int FK    | -> `tracks.id`.         |
| pos              | int PK    | 0-indexed position.     |
| added_at         | timestamp | Default `now()`.        |

Identical shape to `mpd_playlist_tracks` but with an `added_at` column. Drag-and-drop reorder rewrites the affected `pos` values inside a single transaction.

### 2.12 audit_log

| Attribute     | Type      | Notes                                                                                                     |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| id            | int PK    | Surrogate.                                                                                                |
| actor_user_id | int FK    | Nullable. -> `users.id` with `ON DELETE SET NULL` so deleting a user keeps the historical action visible. |
| action        | text      | E.g. `user.ban`, `user.role_change`, `admin.ingest_trigger`.                                              |
| target_table  | text      | The affected table name.                                                                                  |
| target_id     | text      | The affected row's id, as a string to accommodate composite keys.                                         |
| metadata      | jsonb     | Action-specific payload (e.g., old and new role, ingest data dir).                                        |
| created_at    | timestamp | Default `now()`.                                                                                          |

**Why nullable actor:** system actions (cron, ingest CLI) have no human actor. Recording the row but leaving `actor_user_id` NULL keeps the audit trail honest rather than fabricating an "admin" actor.

### 2.13 ingest_checkpoints

| Attribute        | Type      | Notes                                   |
| ---------------- | --------- | --------------------------------------- |
| id               | int PK    | Surrogate.                              |
| slice_filename   | text      | UNIQUE. One row per MPD slice file.     |
| playlists_total  | int       | Slice size declared in the payload.     |
| playlists_done   | int       | Default 0; advanced as batches commit.  |
| artists_upserted | int       | Default 0.                              |
| albums_upserted  | int       | Default 0.                              |
| tracks_upserted  | int       | Default 0.                              |
| started_at       | timestamp | Default `now()`.                        |
| completed_at     | timestamp | Nullable; flips on success.             |
| error_message    | text      | Nullable; last failure for diagnostics. |

This table is a sidecar for the ingest CLI: `--resume` reads it to skip completed slices and continue from the last known-good checkpoint within an incomplete slice.

## 3. Relationships

| From                                  | To                | Cardinality   | FK action          |
| ------------------------------------- | ----------------- | ------------- | ------------------ |
| albums.primary_artist_id              | artists.id        | N:1           | RESTRICT / CASCADE |
| tracks.album_id                       | albums.id         | N:1           | RESTRICT / CASCADE |
| track_artists.track_id                | tracks.id         | N:1           | RESTRICT / CASCADE |
| track_artists.artist_id               | artists.id        | N:1           | RESTRICT / CASCADE |
| mpd_playlist_tracks.playlist_id       | mpd_playlists.id  | N:1           | RESTRICT / CASCADE |
| mpd_playlist_tracks.track_id          | tracks.id         | N:1           | RESTRICT / CASCADE |
| refresh_tokens.user_id                | users.id          | N:1           | RESTRICT / CASCADE |
| listening_history.user_id             | users.id          | N:1           | RESTRICT / CASCADE |
| listening_history.track_id            | tracks.id         | N:1           | RESTRICT / CASCADE |
| user_playlists.user_id                | users.id          | N:1           | RESTRICT / CASCADE |
| user_playlist_tracks.user_playlist_id | user_playlists.id | N:1           | RESTRICT / CASCADE |
| user_playlist_tracks.track_id         | tracks.id         | N:1           | RESTRICT / CASCADE |
| audit_log.actor_user_id               | users.id          | N:1, nullable | SET NULL / CASCADE |

`ON DELETE RESTRICT` is the default because the schema's invariant is that catalog and user rows cannot be silently orphaned. The single exception is `audit_log.actor_user_id`, where the audit trail must outlive the actor account.

## 4. Many-to-many resolutions

Three M:N relationships are resolved with explicit junction tables rather than implicit Prisma relations:

1. **Tracks <-> Artists** via `track_artists`, with a `role` payload column.
2. **MPD playlists <-> Tracks** via `mpd_playlist_tracks`, with a `pos` payload column.
3. **User playlists <-> Tracks** via `user_playlist_tracks`, with `pos` and `added_at` payload columns.

A junction table is preferred over a Prisma-implicit M:N (a) because each relationship has at least one payload column, (b) so the composite primary key encodes business invariants (position uniqueness within a playlist), and (c) so analytics queries can index the inverse side without going through Prisma metadata tables.

## 5. Normalization

The schema is in **third normal form (3NF)** with one deliberate denormalization (`mpd_playlists.duration_ms`) called out below.

- **1NF:** All attributes are atomic; arrays and JSON are confined to `audit_log.metadata` where the payload is heterogeneous by design and querying it relationally would force the audit table to grow a column per action type.
- **2NF:** Every non-key attribute depends on the whole primary key. The composite-PK tables (`track_artists`, `mpd_playlist_tracks`, `user_playlist_tracks`) carry only payload columns that depend on both parts of the key (`role`, `pos`, `added_at`).
- **3NF:** No transitive dependencies. For example, `albums.name` does not appear on `tracks` even though every track has an album; the join resolves it. The same applies to `artists.name`, `mpd_playlists.name`, and `users.display_name`.

**Deliberate denormalization:**

- `mpd_playlists.duration_ms` is a precomputed sum of its tracks' durations. The MPD source payload supplies it directly, so storing it avoids a recompute on every playlist render. The cost of this denormalization is bounded because user code never mutates MPD playlist membership: the only writers are the ingest CLI, and the CLI recomputes the sum from the same source payload.

**Why surrogate keys throughout:** every entity uses an auto-incremented integer primary key even where a natural key exists (`spotify_uri`, `email`, `mpd_pid`, `slice_filename`). Surrogate keys give foreign keys a stable shape independent of upstream identifier changes, keep join sizes small, and let `UNIQUE` constraints enforce the natural-key invariant without coupling foreign-key shape to it.

## 6. Indexes worth singling out

- `listening_history (user_id, played_at DESC)` is the single most important index in the schema. Recent listens, Top artists, Top tracks, Heatmap, and Trending artists all use it as their entry point.
- `audit_log (actor_user_id, created_at DESC)` mirrors the listening-history shape for the admin audit-log viewer's primary filter.
- Three GIN indexes with `gin_trgm_ops` (on `artists.name`, `albums.name`, `tracks.name`) back the global search bar's substring and fuzzy matching without scanning the catalog. These live in a raw SQL migration because Prisma's schema language does not expose `gin_trgm_ops`.
- The partial index on `tracks (id) WHERE preview_url IS NOT NULL` accelerates the preview-availability filter. A partial index here is far cheaper than a full index on `preview_url` because the cardinality of non-null previews is much lower than the catalog size.

## 7. Constraints worth singling out

- `listening_history (user_id, idempotency_key)` UNIQUE makes duplicate POSTs from a retrying client safe; the server returns the original row's id instead of inserting twice.
- `track_artists` PK `(track_id, artist_id)` forbids the same artist appearing twice on a track.
- `mpd_playlist_tracks` PK `(playlist_id, pos)` and `user_playlist_tracks` PK `(user_playlist_id, pos)` forbid duplicate positions within a playlist.
- All `spotify_uri` and `mpd_pid` UNIQUE constraints make ingest re-runs idempotent.

## 8. Diagram

See `docs/erd.dbml` for the rendering source and `docs/erd.png` for the exported image. The diagram is laid out so that the MPD-derived zone sits on the left and the app-layer zone sits on the right, with the three cross-zone foreign keys clearly visible across the middle.
