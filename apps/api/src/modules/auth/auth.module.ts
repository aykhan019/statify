import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { CsrfGuard } from './guards/csrf.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordService } from './password.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthCookieService,
    AuthRepository,
    AuthService,
    AuthTokenService,
    CsrfGuard,
    JwtAuthGuard,
    PasswordService,
    RolesGuard,
  ],
  exports: [AuthService, CsrfGuard, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
