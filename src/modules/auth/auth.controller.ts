import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '#/modules/auth/auth.service.js';
import { LoginDto } from '#/modules/auth/dto/login.dto.js';
import { RegisterDto } from '#/modules/auth/dto/register.dto.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { CurrentUser } from '#/common/decorators/current-user.decorator.js';
import { Public } from '#/common/decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@CurrentUser() user: { userId: string, refreshToken: string }) {
    return this.authService.refreshTokens(user.userId, user.refreshToken)
  }

  @Post('logout')
  logout(@CurrentUser('userId') userId: string) {
    return this.authService.logout(userId)
  }
}
