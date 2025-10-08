import { ReviewService } from './../review/review.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly reviewService: ReviewService,
  ) {}

  /* 이메일로 유저 찾기 */
  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  /* 유저 아이디로 유저 찾기 */
  async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    const countCategory = await this.getMyStats(id);
    if (!user) throw new NotFoundException();

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, role, updatedAt, ...result } = user;

    return { user: { ...result }, categories: countCategory };
  }

  async getMyStats(userId: string) {
    return this.reviewService.countReviewByUserCategory(userId);
  }

  /* 유저 아이디로 작성한 리뷰 찾기 (내용포함) (무한 스크롤) */
  // 확인 후 변경
  // async findReviewByUserIdAndCategory(
  //   authorId: string,
  //   category?: CategoryType,
  //   cursor?: string,
  // ) {
  //   return await this.reviewService.findByCategory({
  //     authorId,
  //     category: [category || ''],
  //     cursor,
  //     limit: 15,
  //   });
  // }
  async findReviewByUserIdAndCategory(
    authorId: string,
    category?: CategoryType,
    cursor?: string,
  ) {
    return await this.reviewService.findReviewByUserIdAndCategory(
      authorId,
      category,
      cursor,
    );
  }

  async deleteRefreshToken(userId: string) {
    return await this.userRepository.deleteRefreshToken(userId);
  }

  /* 유저 생성 */
  async create(data: Prisma.UserCreateInput): Promise<{ email: string }> {
    return await this.userRepository.create({ ...data });
  }

  /* 유저 업데이트 */
  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  /* 리프레쉬 토큰 DB 저장 */
  async saveRefreshTokenByUserId(
    userId: string,
    hashRefreshToken: string,
    expiresAt: Date,
  ) {
    await this.userRepository.upsertRefreshToken(
      userId,
      hashRefreshToken,
      expiresAt,
    );
  }
}
