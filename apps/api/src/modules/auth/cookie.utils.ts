import type { Request } from 'express';

export function getCookie(request: Request, name: string): string | undefined {
  return parseCookieHeader(request.headers.cookie)[name];
}

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (header === undefined || header.trim() === '') {
    return {};
  }

  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf('=');
        if (separator === -1) {
          return [part, ''];
        }

        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}
