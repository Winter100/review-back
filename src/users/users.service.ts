import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './../auth/password.service';
import { ImageService } from './../supabase/image.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
    private readonly passwordService: PasswordService,
    private readonly JwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException();
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return { ...result };
  }

  async create(data: Prisma.UserCreateInput): Promise<{ email: string }> {
    return await this.userRepository.create({ ...data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    // 이미지가 있다면 이미지를 바꾸고 업데이트, 그게 아니라면 그대로 업데이트?
    await this.userRepository.update(id, data);
  }

  async uploadFile(file: Express.Multer.File, bucket: string): Promise<string> {
    return this.imageService.uploadFile(file, bucket);
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const hashRefreshToken = await this.passwordService.hash(refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const decode = this.JwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decode.exp * 1000);

    return await this.userRepository.upsertRefreshToken(
      userId,
      hashRefreshToken,
      expiresAt,
    );
  }
}
