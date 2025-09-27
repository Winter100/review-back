import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  SIGNUP_SUCCESS,
  SignUpSuccessResponseDto,
} from './dto/signUp-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User, UserPayload } from './types/payload';
import type { Response } from 'express';
import ms, { StringValue } from 'ms';
import { CONFIG_KEY } from './constant/configKey';
import { SignInResponseDto } from './dto/signIn-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshTokenGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('token')
  @UseGuards(JwtAuthGuard)
  tokens() {
    return [];
  }

  // 로그인
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @ApiOperation({
    summary: '로그인',
  })
  @ApiResponse({
    description: '로그인 성공',
    type: SignInResponseDto,
  })
  async signIn(
    @Req() req: { user: UserPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.setRefreshTokenAndRespond(req.user, res);
  }

  // 액세스 토큰 재발급
  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.setRefreshTokenAndRespond(req.user, res);
  }

  // 회원가입
  @Post('signup')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: '회원가입',
  })
  @ApiConsumes('application/json')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: SIGNUP_SUCCESS.message,
    type: SignUpSuccessResponseDto,
  })
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<SignUpSuccessResponseDto> {
    await this.authService.signUp(signUpDto);
    return SIGNUP_SUCCESS;
  }

  // 유저 및 토큰 반환
  private async setRefreshTokenAndRespond(reqUser: User, res: Response) {
    const { accessToken, refreshToken, user } =
      await this.authService.getTokens(reqUser);

    const expiresIn = this.configService.get<StringValue>(
      CONFIG_KEY.refreshExpirationKey,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: ms(expiresIn || '7d'),
      path: '/',
    });

    return { user, accessToken };
  }
}
