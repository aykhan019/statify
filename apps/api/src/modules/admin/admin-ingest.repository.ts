import { Injectable } from '@nestjs/common';
import type { IngestCheckpoint } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';

const LIST_LIMIT = 50;

@Injectable()
export class AdminIngestRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  listRecent(): Promise<IngestCheckpoint[]> {
    return this.client.ingestCheckpoint.findMany({
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      take: LIST_LIMIT,
    });
  }
}
