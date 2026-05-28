# Statify P2 merged replacement zip

Extract this zip at the repo root to replace/add only `apps/web` files.

```bash
cd ~/Documents/projects/statify
unzip -o ~/Downloads/statify-p2-merged-replacement.zip -d .
pnpm --filter @statify/shared run build
pnpm --filter @statify/web run typecheck
```

This package preserves auth/API/cookies/server components and does not touch backend code.
