import { PrismaClient } from '@prisma/client';
import { runSeed, type SeedLogger } from '../src/seed/run';

const CONSOLE_LOGGER: SeedLogger = {
  info(message) {
    console.log(`[seed] ${message}`);
  },
  warn(message) {
    console.warn(`[seed] ${message}`);
  },
};

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const result = await runSeed(prisma, { logger: CONSOLE_LOGGER });
    console.log('[seed] Done.', result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
