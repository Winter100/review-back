import { PasswordService } from './password.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  /** 회원가입
   * @param {SignUpDto} signUpDto 유저정보
   * @returns 유저
   */
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

  async signOut(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) throw new NotFoundException('해당 유저를 찾을 수 없습니다.');

    return await this.usersService.deleteRefreshToken(userId);
  }

  /** 액세스 토큰, 리프레쉬 토큰 발급 및 유저 얻기
   * @param user 유저정보
   * @returns 유저와 액세스, 리프레쉬 토큰
   */
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

    const hashedRefreshToken = await this.hashToken(refreshToken);
    const expiresAt = this.getExpiresAt(refreshToken);

    await this.usersService.saveRefreshTokenByUserId(
      user.id,
      hashedRefreshToken,
      expiresAt,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, role, updatedAt, ...result } = user;
    const responseUser = {
      ...result,
    };
    return { user: responseUser, accessToken, refreshToken };
  }

  /** 이메일 및 비밀번호 검증
   * @param email 이메일
   * @param password 비밀번호
   * @returns 유저 Or null
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.passwordService.compare(user.password, password))) {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  /** 액세스 토큰 생성
   * @param payload
   * @returns 액세스 토큰
   */
  async createJwtToken(payload: JwtPayLoad) {
    return this.jwtService.signAsync(payload);
  }

  /** 리프레쉬 토큰 생성
   * @param payload
   * @returns 리프레쉬 토큰
   */
  async createRefreshToken(payload: { email: string; sub: string }) {
    const secret = this.configService.get<string>(CONFIG_KEY.refreshTokenKey);
    const expiresIn = this.configService.get<string>(
      CONFIG_KEY.refreshExpirationKey,
    );

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return refreshToken;
  }

  /** 토큰 암호화
   * @param token 토큰
   * @returns 암호화된 토큰
   */
  private async hashToken(token: string) {
    return await this.passwordService.hash(token);
  }

  /** 토큰에서 만료일 추출
   * @param token 토큰
   * @returns {Date} 만료일
   *  */
  private getExpiresAt(token: string) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const decode = this.jwtService.decode(token) as { exp: number };
    return new Date(decode.exp * 1000);
  }
}
