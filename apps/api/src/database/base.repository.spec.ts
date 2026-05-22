import { describe, expect, it } from 'vitest';
import { BaseRepository } from './base.repository';
import type { DatabaseClient } from './database.types';

class TestRepository extends BaseRepository {
  constructor(client: DatabaseClient) {
    super(client);
  }

  getClient(): DatabaseClient {
    return this.client;
  }
}

describe('BaseRepository', () => {
  it('stores the database client used by a concrete repository', () => {
    const client = {} as DatabaseClient;
    const repository = new TestRepository(client);

    expect(repository.getClient()).toBe(client);
  });
});
