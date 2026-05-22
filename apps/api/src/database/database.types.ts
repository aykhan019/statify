import type { Prisma } from '@prisma/client';
import type { PrismaService } from './prisma.service';

export type DatabaseTransactionClient = Prisma.TransactionClient;
export type DatabaseClient = PrismaService | DatabaseTransactionClient;

export interface DatabaseTransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export type DatabaseTransactionHandler<T> = (client: DatabaseTransactionClient) => Promise<T>;
