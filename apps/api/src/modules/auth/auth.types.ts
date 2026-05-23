import type { AuthUser, UserRole } from '@statify/shared';

export type AuthenticatedUser = AuthUser;

export type AuthTokenType = 'access' | 'refresh';

export interface AuthTokenPayload {
  sub: number;
  email: string;
  displayName: string;
  role: UserRole;
  type: AuthTokenType;
  jti: string;
}

export interface AuthTokenSet {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
  csrfToken: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  tokens: AuthTokenSet;
}

export interface AuthRequestContext {
  userAgent?: string;
  ipAddr?: string;
}

export interface RequestWithUser {
  user?: AuthenticatedUser;
}
