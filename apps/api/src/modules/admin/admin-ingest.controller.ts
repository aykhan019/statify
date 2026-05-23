import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  TriggerIngestRunRequestSchema,
  type IngestRunsListResponse,
  type TriggerIngestRunRequest,
  type TriggerIngestRunResponse,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AdminIngestService } from './admin-ingest.service';

@Controller('admin/ingest/runs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminIngestController {
  constructor(private readonly service: AdminIngestService) {}

  @Get()
  list(): Promise<IngestRunsListResponse> {
    return this.service.list();
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(CsrfGuard)
  trigger(
    @Body(new ZodValidationPipe(TriggerIngestRunRequestSchema)) body: TriggerIngestRunRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TriggerIngestRunResponse> {
    return this.service.trigger(actor.id, body);
  }
}
