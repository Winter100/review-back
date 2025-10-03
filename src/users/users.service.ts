import { ReviewService } from './../review/review.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

  /* 유저 아이디로 프로필 찾기 */
  async getProfile(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException();
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return { ...result };
  }

  /* 유저 아이디로 작성한 리뷰 찾기 (내용포함) (무한 스크롤) */
  async findAllReviewByUserId(authorId: string) {
    const reviews = await this.reviewService.findByCategory({
      authorId,
      limit: 15,
    });
    const count = await this.reviewService.countReviewByUserId(authorId);
    return {
      reviews,
      count,
    };
  }

  async deleteRefreshToken(userId: string) {
    return await this.userRepository.deleteRefreshToken(userId);
  }

  // /* 유저 아이디로 작성한 리뷰의 총 숫자 */
  // async findAllReviewByUserId(userId: string) {
  //   // Todo 해당 유저의 리뷰수 카운트 해주기
  //   const data = await this.reviewService.countReviewByUserId(userId);
  //   console.log(data);
  //   return data;
  // }

  /* 유저 생성 */
  async create(data: Prisma.UserCreateInput): Promise<{ email: string }> {
    return await this.userRepository.create({ ...data });
  }

  /* 유저 업데이트 */
  async update(id: string, data: Prisma.UserUpdateInput) {
    // 이미지가 있다면 이미지를 바꾸고 업데이트, 그게 아니라면 그대로 업데이트?
    await this.userRepository.update(id, data);
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
