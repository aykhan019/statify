import { Module } from '@nestjs/common';
import { TRACK_PREVIEW_PROVIDER } from '../track-preview-provider';
import { ItunesAdapter } from './itunes.adapter';
import { ItunesCache } from './itunes.cache';
import { ItunesClient } from './itunes.client';
import { ItunesRateLimiter } from './itunes-rate-limiter';
import { ItunesService } from './itunes.service';

@Module({
  providers: [
    ItunesAdapter,
    ItunesCache,
    ItunesClient,
    ItunesRateLimiter,
    ItunesService,
    {
      provide: TRACK_PREVIEW_PROVIDER,
      useExisting: ItunesService,
    },
  ],
  exports: [ItunesService, TRACK_PREVIEW_PROVIDER],
})
export class ItunesModule {}
