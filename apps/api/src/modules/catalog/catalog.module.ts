import { Module } from '@nestjs/common';
import { AlbumsController } from './albums.controller';
import { AlbumsRepository } from './albums.repository';
import { AlbumsService } from './albums.service';
import { ArtistsController } from './artists.controller';
import { ArtistsRepository } from './artists.repository';
import { ArtistsService } from './artists.service';
import { TracksController } from './tracks.controller';
import { TracksRepository } from './tracks.repository';
import { TracksService } from './tracks.service';

@Module({
  controllers: [AlbumsController, ArtistsController, TracksController],
  providers: [
    AlbumsRepository,
    AlbumsService,
    ArtistsRepository,
    ArtistsService,
    TracksRepository,
    TracksService,
  ],
})
export class CatalogModule {}
