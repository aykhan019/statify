import { PrismaClient } from '@prisma/client';
import { parseIngestArgs } from './args';
import { runIngest, type IngestLogger } from './run';

const CONSOLE_LOGGER: IngestLogger = {
  info(message) {
    console.log(`[ingest] ${message}`);
  },
  warn(message) {
    console.warn(`[ingest] ${message}`);
  },
  error(message) {
    console.error(`[ingest] ${message}`);
  },
};

async function main(): Promise<void> {
  const args = parseIngestArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  try {
    await runIngest(prisma, { ...args, logger: CONSOLE_LOGGER });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
