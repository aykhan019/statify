import { Injectable, type NestMiddleware } from '@nestjs/common';
import { HEADERS } from '@statify/shared';
import type { NextFunction, Request, Response } from 'express';
import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import { v4 as uuidv4 } from 'uuid';

type RequestIdCarrier = IncomingMessage & {
  id?: unknown;
  requestId?: string;
};

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = resolveRequestId(request);

    assignRequestId(request, requestId);
    response.setHeader(HEADERS.REQUEST_ID, requestId);
    next();
  }
}

export function resolveRequestId(request: IncomingMessage): string {
  return getExistingRequestId(request) ?? getIncomingRequestId(request) ?? uuidv4();
}

export function assignRequestId(request: IncomingMessage, requestId: string): void {
  Object.assign(request as RequestIdCarrier, { id: requestId, requestId });
}

export function getRequestId(request: IncomingMessage): string {
  const existing = (request as RequestIdCarrier).requestId;
  if (existing !== undefined) {
    return existing;
  }

  return getExistingRequestId(request) ?? getIncomingRequestId(request) ?? '';
}

function getExistingRequestId(request: IncomingMessage): string | undefined {
  const id = (request as RequestIdCarrier).id;

  return typeof id === 'string' && id.trim() !== '' ? id : undefined;
}

function getIncomingRequestId(request: IncomingMessage): string | undefined {
  const header = getHeader(request, HEADERS.REQUEST_ID);
  const trimmed = Array.isArray(header) ? header[0]?.trim() : header?.trim();

  return trimmed === '' ? undefined : trimmed;
}

function getHeader(request: IncomingMessage, headerName: string): IncomingHttpHeaders[string] {
  if (isExpressRequest(request)) {
    return request.get(headerName);
  }

  return request.headers[headerName.toLowerCase()];
}

function isExpressRequest(request: IncomingMessage): request is Request {
  return typeof (request as Partial<Request>).get === 'function';
}
