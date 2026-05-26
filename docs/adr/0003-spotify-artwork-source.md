# ADR-003: Spotify Artwork Source

**Project:** Statify, Music Streaming Analytics App
**Date:** 2026-05-25
**Status:** Accepted
**Authors:** Aykhan Ahmadzada (decision owner)
**Supersedes (in part):** ADR-002 §2.6 and §5 where iTunes artwork backfill was listed as the entity media source.

## 1. Context

ADR-002 made real media a first-class part of the frontend redesign, but it reused iTunes artwork because the iTunes preview lookup already existed. The database already stores MPD-derived Spotify URIs on artists, albums, and tracks. Those URIs make Spotify the better source for album and artist artwork because the backfill can resolve entities directly instead of text-searching by track title and artist name.

iTunes remains the preview source. Its search API is still useful for resolving 30-second `previewUrl` values on tracks, but it should not be the canonical artwork source after this decision.

## 2. Decision

Use the Spotify Web API as the canonical bulk artwork source for albums and artists.

- Authentication uses Spotify's Client Credentials Flow: `POST https://accounts.spotify.com/api/token` with HTTP Basic credentials and `grant_type=client_credentials`, then `Authorization: Bearer <token>` on Web API requests.
- Album artwork is fetched through `GET /v1/albums?ids=...` in chunks of at most 20 IDs.
- Artist artwork is fetched through `GET /v1/artists?ids=...` in chunks of at most 50 IDs.
- The backfill reads `spotify:album:<id>` from `albums.spotify_uri` and `spotify:artist:<id>` from `artists.spotify_uri`.
- The backfill writes the first returned image URL to `albums.image_url` and `artists.image_url`.
- The backfill is idempotent by default: rows with existing `image_url` values are skipped unless `--overwrite-existing` is passed.
- The backfill handles Spotify rate limiting by retrying `429` responses after the response `Retry-After` header delay. Requests are also paced locally to avoid bursts.
- Required environment variables are `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
- Development-mode Spotify apps require the app owner to have an active Spotify Premium subscription.

Official references:

- Spotify Client Credentials Flow: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
- Spotify quota modes: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify rate limits and `Retry-After`: https://developer.spotify.com/documentation/web-api/concepts/rate-limits
- Get Several Albums: https://developer.spotify.com/documentation/web-api/reference/get-multiple-albums
- Get Several Artists: https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists

## 3. Consequences

**Positive**

- Artwork backfill becomes deterministic because album and artist Spotify IDs are already in the database.
- Artist artwork is no longer permanently NULL after ingest.
- Album artwork no longer depends on whether a matching iTunes track lookup succeeds.
- The script can run repeatedly without changing already curated artwork.

**Negative**

- A Spotify application is now required for production artwork backfill.
- The script must account for Spotify's rolling-window rate limits because the exact allowed request rate is not fixed in code-facing docs.
- Track-level `image_url` is no longer populated by iTunes preview lookup. UI surfaces should keep falling back from track artwork to album artwork.

## 4. Migration

- `.env.example` documents `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
- `packages/db/src/scripts/backfill-media.ts` becomes the Spotify album and artist artwork backfill.
- `packages/db/package.json` exposes `pnpm --filter @statify/db db:backfill-media`.
- The iTunes adapter and cache stop persisting artwork while continuing to persist `itunes_track_id`, `preview_url`, and `preview_fetched_at`.
