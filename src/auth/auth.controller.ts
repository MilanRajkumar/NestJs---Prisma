import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Public } from 'src/decorators/public.decorators';
import { GetCurrentUser } from 'src/decorators/get-current-user-id.decorator';
import { RefreshTokenGuard } from 'src/guards';
import { Tokens } from './types';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() authDto: AuthDto,
  ) {
    try {
      const resp = await this.authService.login(authDto);
      return response.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: resp,
      });
    } catch (error) {
      return response.status(500).json({
        message: error.message,
      });
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('email') email: string): Promise<boolean> {
    return this.authService.logout(email);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('email') email: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(email, refreshToken);
  }
}
