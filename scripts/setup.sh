#!/usr/bin/env bash
#
# setup.sh
# One-shot bootstrap for the monorepo. Run from a fresh clone or after a pull.
#
# Steps:
#   1. pnpm install                        — sync workspace dependencies
#   2. prisma generate                     — regenerate the Prisma client
#   3. prisma migrate deploy               — apply any pending migrations
#   4. pnpm build                          — build shared → db → api → web
#
# Migration policy: this script uses `prisma migrate deploy` (non-interactive,
# applies committed migrations only). If schema.prisma drifts and a new
# migration is needed, run that step manually first:
#
#   pnpm --filter @statify/db run prisma:migrate:dev
#
# Env: reads the project-root .env. NODE_ENV from .env is intentionally
# unset before `pnpm build` so Next.js / NestJS pick the right mode.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

pnpm install
pnpm --filter @statify/db run prisma:generate
pnpm --filter @statify/db run prisma:migrate:deploy

# Build steps decide NODE_ENV themselves; don't leak a dev value from .env.
unset NODE_ENV
pnpm build

echo
echo "setup complete."
echo "  next: pnpm dev          # start api on :4000 and web on :3000"
echo "  seed: pnpm --filter @statify/db run db:seed"
