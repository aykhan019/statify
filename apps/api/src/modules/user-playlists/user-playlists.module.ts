import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublicUserPlaylistsController } from './public-user-playlists.controller';
import { UserPlaylistsController } from './user-playlists.controller';
import { UserPlaylistsRepository } from './user-playlists.repository';
import { UserPlaylistsService } from './user-playlists.service';

@Module({
  imports: [AuthModule],
  controllers: [UserPlaylistsController, PublicUserPlaylistsController],
  providers: [UserPlaylistsRepository, UserPlaylistsService],
})
export class UserPlaylistsModule {}
