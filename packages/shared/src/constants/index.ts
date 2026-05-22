export const APP_NAME = 'Statify';
export const API_VERSION = 'v1';

export const COOKIE_NAMES = {
  ACCESS: 'sf_access',
  REFRESH: 'sf_refresh',
  CSRF: 'sf_csrf',
} as const;

export const HEADERS = {
  CSRF: 'X-CSRF-Token',
  REQUEST_ID: 'X-Request-Id',
} as const;
