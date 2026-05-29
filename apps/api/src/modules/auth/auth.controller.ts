import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  AccountDeleteRequest,
  AccountDeleteRequestSchema,
  AppError,
  AuthResponse,
  COOKIE_NAMES,
  ErrorCode,
  LoginRequest,
  LoginRequestSchema,
  PasswordChangeRequest,
  PasswordChangeRequestSchema,
  ProfileUpdateRequest,
  ProfileUpdateRequestSchema,
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

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async logout(
    @Req() request: Request & RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const user = getAuthenticatedUser(request);
    await this.authService.logout(getCookie(request, COOKIE_NAMES.REFRESH), user.id);
    this.cookieService.clearAuthCookies(response);
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async changePassword(
    @Body(new ZodValidationPipe(PasswordChangeRequestSchema)) body: PasswordChangeRequest,
    @Req() request: Request & RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const user = getAuthenticatedUser(request);
    await this.authService.changePassword(user.id, body);
    this.cookieService.clearAuthCookies(response);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async updateProfile(
    @Body(new ZodValidationPipe(ProfileUpdateRequestSchema)) body: ProfileUpdateRequest,
    @Req() request: Request & RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const user = getAuthenticatedUser(request);
    const session = await this.authService.updateProfile(user.id, body, getRequestContext(request));
    this.cookieService.setAuthCookies(response, session.tokens);

    return { user: session.user };
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async deleteAccount(
    @Body(new ZodValidationPipe(AccountDeleteRequestSchema)) body: AccountDeleteRequest,
    @Req() request: Request & RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const user = getAuthenticatedUser(request);
    await this.authService.deleteAccount(user.id, body.currentPassword);
    this.cookieService.clearAuthCookies(response);
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
