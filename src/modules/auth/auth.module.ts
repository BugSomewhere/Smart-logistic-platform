import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '#/modules/auth/auth.service.js';
import { AuthController } from '#/modules/auth/auth.controller.js';
import { AccessTokenStrategy } from '#/modules/auth/strategies/access-token.strategy.js';
import { RefreshTokenStrategy } from '#/modules/auth/strategies/refresh-token.strategy.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({}),JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule { }
