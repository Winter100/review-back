import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  SIGNUP_SUCCESS,
  SignUpSuccessResponseDto,
} from './dto/signUp-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './types/payload';
import type { Response } from 'express';
import ms, { StringValue } from 'ms';
import { CONFIG_KEY } from './constant/configKey';
import { SignInResponseDto } from './dto/signIn-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
  })
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
    @Req() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.signIn(
      req.user,
    );

    const expiresIn = this.configService.get<StringValue>(
      CONFIG_KEY.refreshExpirationKey,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: ms(expiresIn || '7d'),
    });
    return { user, accessToken };
  }
}
