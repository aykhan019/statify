import { Module } from '@nestjs/common';
import { MpdPlaylistsController } from './mpd-playlists.controller';
import { MpdPlaylistsRepository } from './mpd-playlists.repository';
import { MpdPlaylistsService } from './mpd-playlists.service';

@Module({
  controllers: [MpdPlaylistsController],
  providers: [MpdPlaylistsRepository, MpdPlaylistsService],
})
export class MpdPlaylistsModule {}
