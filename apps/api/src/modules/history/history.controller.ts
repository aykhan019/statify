import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  HEADERS,
  IdempotencyKeySchema,
  ListeningHistoryListQuerySchema,
  RecordListenRequestSchema,
  type ListeningHistoryListQuery,
  type ListeningHistoryListResponse,
  type RecordListenRequest,
  type RecordListenResponse,
  type TrackPlayCountResponse,
} from '@statify/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ListeningHistoryService } from './listening-history.service';

@Controller('me/history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly service: ListeningHistoryService) {}

  @Post()
  @UseGuards(CsrfGuard)
  record(
    @Body(new ZodValidationPipe(RecordListenRequestSchema)) body: RecordListenRequest,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<RecordListenResponse> {
    return this.service.record({
      ...body,
      userId: user.id,
      idempotencyKey: extractIdempotencyKey(request),
    });
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(ListeningHistoryListQuerySchema))
    query: ListeningHistoryListQuery,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ListeningHistoryListResponse> {
    return this.service.listForUser(user.id, query.page, query.limit);
  }

  @Get('track/:trackId/count')
  count(
    @Param('trackId', ParseIntPipe) trackId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TrackPlayCountResponse> {
    return this.service.countByUserAndTrack(user.id, trackId);
  }
}

function extractIdempotencyKey(request: Request): string | undefined {
  const raw = request.get(HEADERS.IDEMPOTENCY);
  if (raw === undefined) {
    return undefined;
  }

  return IdempotencyKeySchema.parse(raw);
}
