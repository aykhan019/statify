import { Injectable, Logger } from '@nestjs/common';
import { runIngest, type IngestLogger, type IngestRunOptions } from '@statify/db';
import type {
  IngestRunsListResponse,
  TriggerIngestRunRequest,
  TriggerIngestRunResponse,
} from '@statify/shared';
import { PrismaService } from '../../database/prisma.service';
import { toIngestCheckpoint } from './admin-ingest.mapper';
import { AdminIngestRepository } from './admin-ingest.repository';
import { AuditLogService } from './audit-log.service';

const DEFAULT_DATA_DIR = './data/mpd';
const DEFAULT_BATCH_SIZE = 500;

@Injectable()
export class AdminIngestService {
  private readonly logger = new Logger('AdminIngest');
  private runStartedAt: Date | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: AdminIngestRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(): Promise<IngestRunsListResponse> {
    const rows = await this.repository.listRecent();
    return {
      data: rows.map(toIngestCheckpoint),
      running: this.runStartedAt !== null,
      startedAt: this.runStartedAt === null ? null : this.runStartedAt.toISOString(),
    };
  }

  async trigger(
    actorId: number,
    input: TriggerIngestRunRequest,
  ): Promise<TriggerIngestRunResponse> {
    if (this.runStartedAt !== null) {
      return {
        accepted: false,
        message: `An ingest run is already in progress (started at ${this.runStartedAt.toISOString()}).`,
      };
    }

    const options: IngestRunOptions = {
      dataDir: input.dataDir ?? DEFAULT_DATA_DIR,
      slices: input.slices ?? null,
      resume: input.resume,
      batchSize: input.batchSize ?? DEFAULT_BATCH_SIZE,
      logger: this.buildLogger(),
    };

    this.runStartedAt = new Date();

    await this.auditLog.record({
      actorUserId: actorId,
      action: 'admin.ingest.triggered',
      targetTable: 'ingest_checkpoints',
      targetId: null,
      metadata: {
        dataDir: options.dataDir,
        slices: options.slices,
        resume: options.resume,
        batchSize: options.batchSize,
      },
    });

    void this.executeInBackground(options);

    return {
      accepted: true,
      message: 'Ingest run started in the background.',
    };
  }

  private async executeInBackground(options: IngestRunOptions): Promise<void> {
    try {
      const result = await runIngest(this.prisma, options);
      this.logger.log(
        `Ingest finished: processed=${result.processed} skipped=${result.skipped} artists=${result.totals.artists} albums=${result.totals.albums} tracks=${result.totals.tracks} playlists=${result.totals.playlists}`,
      );
    } catch (error) {
      this.logger.error(`Ingest run failed: ${toMessage(error)}`);
    } finally {
      this.runStartedAt = null;
    }
  }

  private buildLogger(): IngestLogger {
    const logger = this.logger;
    return {
      info(message) {
        logger.log(message);
      },
      warn(message) {
        logger.warn(message);
      },
      error(message) {
        logger.error(message);
      },
    };
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
