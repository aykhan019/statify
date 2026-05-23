-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banned_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_banned_at_idx" ON "users"("banned_at");
