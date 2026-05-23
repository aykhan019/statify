import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserPlaylistsController } from './user-playlists.controller';
import { UserPlaylistsRepository } from './user-playlists.repository';
import { UserPlaylistsService } from './user-playlists.service';

@Module({
  imports: [AuthModule],
  controllers: [UserPlaylistsController],
  providers: [UserPlaylistsRepository, UserPlaylistsService],
})
export class UserPlaylistsModule {}
