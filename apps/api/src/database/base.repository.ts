import type { DatabaseClient } from './database.types';

export abstract class BaseRepository {
  protected constructor(protected readonly client: DatabaseClient) {}
}
