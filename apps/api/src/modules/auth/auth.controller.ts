import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  AppError,
  AuthResponse,
  COOKIE_NAMES,
  ErrorCode,
  LoginRequest,
  LoginRequestSchema,
  RegisterRequest,
  RegisterRequestSchema,
} from '@statify/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, RequestWithUser } from './auth.types';
import { getCookie } from './cookie.utils';
import { CsrfGuard } from './guards/csrf.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: AuthCookieService,
  ) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema)) body: RegisterRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const session = await this.authService.register(body, getRequestContext(request));

    this.cookieService.setAuthCookies(response, session.tokens);

    return { user: session.user };
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) body: LoginRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const session = await this.authService.login(body, getRequestContext(request));

    this.cookieService.setAuthCookies(response, session.tokens);

    return { user: session.user };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const session = await this.authService.refresh(
      getCookie(request, COOKIE_NAMES.REFRESH),
      getRequestContext(request),
    );

    this.cookieService.setAuthCookies(response, session.tokens);

    return { user: session.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request & RequestWithUser): AuthResponse {
    return { user: getAuthenticatedUser(request) };
  }
}

function getRequestContext(request: Request) {
  return {
    userAgent: request.get('user-agent'),
    ipAddr: request.ip,
  };
}

function getAuthenticatedUser(request: RequestWithUser): AuthenticatedUser {
  if (request.user === undefined) {
    throw new AppError({
      code: ErrorCode.UNAUTHENTICATED,
      message: 'Authentication required',
      httpStatus: HttpStatus.UNAUTHORIZED,
    });
  }

  return request.user;
}
