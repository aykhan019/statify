import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  HEADERS,
  IdempotencyKeySchema,
  RecordListenRequestSchema,
  type RecordListenRequest,
  type RecordListenResponse,
} from '@statify/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ListeningHistoryService } from './listening-history.service';

@Controller('me/history')
@UseGuards(JwtAuthGuard, CsrfGuard)
export class HistoryController {
  constructor(private readonly service: ListeningHistoryService) {}

  @Post()
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
}

function extractIdempotencyKey(request: Request): string | undefined {
  const raw = request.get(HEADERS.IDEMPOTENCY);
  if (raw === undefined) {
    return undefined;
  }

  return IdempotencyKeySchema.parse(raw);
}
