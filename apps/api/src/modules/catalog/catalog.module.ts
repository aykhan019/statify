import { Module } from '@nestjs/common';
import { ItunesModule } from '../../integrations/itunes/itunes.module';
import { AuthModule } from '../auth/auth.module';
import { AlbumsController } from './albums.controller';
import { AlbumsRepository } from './albums.repository';
import { AlbumsService } from './albums.service';
import { ArtistsController } from './artists.controller';
import { ArtistsRepository } from './artists.repository';
import { ArtistsService } from './artists.service';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { SearchService } from './search.service';
import { TracksController } from './tracks.controller';
import { TracksRepository } from './tracks.repository';
import { TracksService } from './tracks.service';

@Module({
  imports: [AuthModule, ItunesModule],
  controllers: [AlbumsController, ArtistsController, SearchController, TracksController],
  providers: [
    AlbumsRepository,
    AlbumsService,
    ArtistsRepository,
    ArtistsService,
    SearchRepository,
    SearchService,
    TracksRepository,
    TracksService,
  ],
})
export class CatalogModule {}
