const DEFAULT_API_BASE_URL = 'http://localhost:4000';

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  return value === undefined || value.length === 0 ? DEFAULT_API_BASE_URL : value;
}
