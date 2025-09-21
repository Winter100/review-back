import { UsersService } from './../../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_KEY } from '../constant/configKey';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.refreshToken as string;
        },
      ]),
      secretOrKey: configService.get<string>(
        CONFIG_KEY.refreshTokenKey,
      ) as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { email: string; sub: string }) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, updatedAt, role, ...result } = user;
    return { ...result };
  }
}
