import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminAlbumsController } from './admin-albums.controller';
import { AdminAlbumsRepository } from './admin-albums.repository';
import { AdminAlbumsService } from './admin-albums.service';
import { AdminArtistsController } from './admin-artists.controller';
import { AdminArtistsRepository } from './admin-artists.repository';
import { AdminArtistsService } from './admin-artists.service';
import { AdminAuditController } from './admin-audit.controller';
import { AdminIngestController } from './admin-ingest.controller';
import { AdminIngestRepository } from './admin-ingest.repository';
import { AdminIngestService } from './admin-ingest.service';
import { AdminTracksController } from './admin-tracks.controller';
import { AdminTracksRepository } from './admin-tracks.repository';
import { AdminTracksService } from './admin-tracks.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminIngestController,
    AdminAuditController,
    AdminArtistsController,
    AdminAlbumsController,
    AdminTracksController,
  ],
  providers: [
    AdminIngestRepository,
    AdminIngestService,
    AdminUsersRepository,
    AdminUsersService,
    AdminArtistsRepository,
    AdminArtistsService,
    AdminAlbumsRepository,
    AdminAlbumsService,
    AdminTracksRepository,
    AdminTracksService,
    AuditLogRepository,
    AuditLogService,
  ],
  exports: [AuditLogService],
})
export class AdminModule {}
