CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS artists_name_trgm_idx
  ON artists USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS albums_name_trgm_idx
  ON albums USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tracks_name_trgm_idx
  ON tracks USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tracks_preview_url_not_null_idx
  ON tracks (id)
  WHERE preview_url IS NOT NULL;
