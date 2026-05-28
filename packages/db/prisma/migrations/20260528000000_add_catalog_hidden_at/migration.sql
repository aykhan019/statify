-- AlterTable
ALTER TABLE "artists" ADD COLUMN     "hidden_at" TIMESTAMP(3);
ALTER TABLE "albums"  ADD COLUMN     "hidden_at" TIMESTAMP(3);
ALTER TABLE "tracks"  ADD COLUMN     "hidden_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "artists_hidden_at_idx" ON "artists"("hidden_at");
CREATE INDEX "albums_hidden_at_idx"  ON "albums"("hidden_at");
CREATE INDEX "tracks_hidden_at_idx"  ON "tracks"("hidden_at");
