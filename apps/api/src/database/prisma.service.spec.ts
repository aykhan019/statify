import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '../config/config.service';
import type {
  DatabaseTransactionClient,
  DatabaseTransactionHandler,
  DatabaseTransactionOptions,
} from './database.types';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects and disconnects once across repeated lifecycle calls', async () => {
    const service = createService();
    const connect = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const disconnect = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    Object.defineProperty(service, '$connect', { value: connect });
    Object.defineProperty(service, '$disconnect', { value: disconnect });

    await service.connect();
    await service.connect();
    await service.disconnect();
    await service.disconnect();

    expect(connect).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('runs work inside an interactive transaction with options', async () => {
    const service = createService();
    const transactionClient = { user: {} } as DatabaseTransactionClient;
    const transaction = vi.fn(
      async (handler: DatabaseTransactionHandler<string>, _options?: DatabaseTransactionOptions) =>
        handler(transactionClient),
    );
    const options = { maxWait: 1000, timeout: 5000 };

    Object.defineProperty(service, '$transaction', { value: transaction });

    const result = await service.transaction(async (client) => {
      expect(client).toBe(transactionClient);
      return 'committed';
    }, options);

    expect(result).toBe('committed');
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), options);
  });
});

function createService(): PrismaService {
  return new PrismaService({
    databaseUrl: 'postgresql://statify:statify@localhost:5432/statify?schema=public',
    isProduction: false,
  } as ConfigService);
}
