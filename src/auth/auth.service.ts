import { PasswordService } from './password.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad, User } from './types/payload';
import { CONFIG_KEY } from './constant/configKey';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, nickname } = signUpDto;
    const user = await this.usersService.findByEmail(email);

    if (user) throw new ConflictException('이미 존재하는 이메일입니다.');

    const hash = await this.passwordService.hash(password);

    return await this.usersService.create({
      email,
      password: hash,
      nickname,
    });
  }

  async getTokens(user: User) {
    const accessTokenPayload = {
      sub: user.id,
      nickname: user.nickname,
      email: user.email,
    };
    const refreshTokenPayload = { email: user.email, sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.createJwtToken(accessTokenPayload),
      this.createRefreshToken(refreshTokenPayload),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, role, updatedAt, ...result } = user;
    const responseUser = {
      ...result,
    };
    return { user: responseUser, accessToken, refreshToken };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.passwordService.compare(user.password, password))) {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async createJwtToken(payload: JwtPayLoad) {
    return this.jwtService.signAsync(payload);
  }

  async createRefreshToken(payload: { email: string; sub: string }) {
    const secret = this.configService.get<string>(CONFIG_KEY.refreshTokenKey);
    const expiresIn = this.configService.get<string>(
      CONFIG_KEY.refreshExpirationKey,
    );

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    await this.usersService.saveRefreshToken(payload.sub, refreshToken);

    return refreshToken;
  }
}
