-- CreateEnum
CREATE TYPE "track_artist_role" AS ENUM ('primary', 'featured');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "listening_source" AS ENUM ('preview', 'seed');

-- CreateTable
CREATE TABLE "artists" (
    "id" SERIAL NOT NULL,
    "spotify_uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" SERIAL NOT NULL,
    "spotify_uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primary_artist_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" SERIAL NOT NULL,
    "spotify_uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "album_id" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "itunes_track_id" BIGINT,
    "preview_url" TEXT,
    "preview_fetched_at" TIMESTAMP(3),

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_artists" (
    "track_id" INTEGER NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "role" "track_artist_role" NOT NULL DEFAULT 'primary',

    CONSTRAINT "track_artists_pkey" PRIMARY KEY ("track_id","artist_id")
);

-- CreateTable
CREATE TABLE "mpd_playlists" (
    "id" SERIAL NOT NULL,
    "mpd_pid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "collaborative" BOOLEAN NOT NULL DEFAULT false,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "num_followers" INTEGER NOT NULL,
    "num_edits" INTEGER NOT NULL,
    "duration_ms" BIGINT NOT NULL,

    CONSTRAINT "mpd_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mpd_playlist_tracks" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "pos" INTEGER NOT NULL,

    CONSTRAINT "mpd_playlist_tracks_pkey" PRIMARY KEY ("playlist_id","pos")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "ip_addr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "listening_source" NOT NULL DEFAULT 'preview',
    "duration_played_ms" INTEGER NOT NULL,
    "idempotency_key" TEXT,

    CONSTRAINT "listening_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_playlists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_playlist_tracks" (
    "user_playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "pos" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_playlist_tracks_pkey" PRIMARY KEY ("user_playlist_id","pos")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest_checkpoints" (
    "id" SERIAL NOT NULL,
    "slice_filename" TEXT NOT NULL,
    "playlists_total" INTEGER NOT NULL,
    "playlists_done" INTEGER NOT NULL DEFAULT 0,
    "artists_upserted" INTEGER NOT NULL DEFAULT 0,
    "albums_upserted" INTEGER NOT NULL DEFAULT 0,
    "tracks_upserted" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "ingest_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_spotify_uri_key" ON "artists"("spotify_uri");

-- CreateIndex
CREATE INDEX "artists_normalized_name_idx" ON "artists"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "albums_spotify_uri_key" ON "albums"("spotify_uri");

-- CreateIndex
CREATE INDEX "albums_primary_artist_id_idx" ON "albums"("primary_artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_spotify_uri_key" ON "tracks"("spotify_uri");

-- CreateIndex
CREATE INDEX "tracks_album_id_idx" ON "tracks"("album_id");

-- CreateIndex
CREATE INDEX "tracks_preview_url_idx" ON "tracks"("preview_url");

-- CreateIndex
CREATE INDEX "track_artists_artist_id_idx" ON "track_artists"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "mpd_playlists_mpd_pid_key" ON "mpd_playlists"("mpd_pid");

-- CreateIndex
CREATE INDEX "mpd_playlist_tracks_track_id_idx" ON "mpd_playlist_tracks"("track_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "listening_history_user_id_played_at_idx" ON "listening_history"("user_id", "played_at" DESC);

-- CreateIndex
CREATE INDEX "listening_history_track_id_idx" ON "listening_history"("track_id");

-- CreateIndex
CREATE UNIQUE INDEX "listening_history_user_id_idempotency_key_key" ON "listening_history"("user_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "user_playlists_user_id_idx" ON "user_playlists"("user_id");

-- CreateIndex
CREATE INDEX "user_playlist_tracks_track_id_idx" ON "user_playlist_tracks"("track_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_user_id_created_at_idx" ON "audit_log"("actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_log_target_table_target_id_idx" ON "audit_log"("target_table", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingest_checkpoints_slice_filename_key" ON "ingest_checkpoints"("slice_filename");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_primary_artist_id_fkey" FOREIGN KEY ("primary_artist_id") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mpd_playlist_tracks" ADD CONSTRAINT "mpd_playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "mpd_playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mpd_playlist_tracks" ADD CONSTRAINT "mpd_playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_playlists" ADD CONSTRAINT "user_playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_playlist_tracks" ADD CONSTRAINT "user_playlist_tracks_user_playlist_id_fkey" FOREIGN KEY ("user_playlist_id") REFERENCES "user_playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_playlist_tracks" ADD CONSTRAINT "user_playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
