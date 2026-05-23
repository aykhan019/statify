import { getApiBaseUrl } from './config';

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  cookieHeader?: string;
  headers?: HeadersInit;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { cookieHeader, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (cookieHeader !== undefined && cookieHeader.length > 0 && !requestHeaders.has('cookie')) {
    requestHeaders.set('cookie', cookieHeader);
  }

  const response = await fetch(new URL(path, getApiBaseUrl()), {
    ...init,
    headers: requestHeaders,
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError(getErrorMessage(body, response.statusText), response.status, body);
  }

  return body as T;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'object' &&
    body.error !== null &&
    'message' in body.error &&
    typeof body.error.message === 'string'
  ) {
    return body.error.message;
  }

  return fallback;
}
