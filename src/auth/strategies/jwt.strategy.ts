import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayLoad, User } from '../types/payload';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEY } from '../constant/configKey';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>(CONFIG_KEY.accessTokenKey) as string,
    });
  }

  validate(payload: JwtPayLoad): User {
    return {
      id: payload.sub,
      nickname: payload.nickname,
      email: payload.email,
    };
  }
}
