import { CommentsService } from './../comments/comments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ImageService } from './../supabase/image.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './repositories/review.repository';
import { UserPayload } from 'src/auth/types/payload';
import { QueryReviewDto } from './dto/query-review.dto';
import { CategoryType, Prisma } from '@prisma/client';
import { reviewWithDetailsInclude } from './types/review-repository-type';

@Injectable()
export class ReviewService {
  constructor(
    private readonly imageService: ImageService,
    private readonly reviewRepository: ReviewRepository,
    private readonly prismaService: PrismaService,
    private readonly commentsService: CommentsService,
  ) {}

  /* 리뷰 생성 */
  async createReview(user: UserPayload, createReviewDto: CreateReviewDto) {
    const categoryData = await this.reviewRepository.findCategoryData(
      createReviewDto.category,
    );

    if (!categoryData) throw new BadRequestException('Invalid category');

    return await this.reviewRepository.create(
      user,
      categoryData.id,
      createReviewDto,
    );
  }

  /* 리뷰 상세 정보 */
  async findById(id: string) {
    const review = await this.reviewRepository.findById(id);

    if (!review) throw new NotFoundException(`${id}가 존재하지 않습니다.`);

    return review;
  }

  /**
   * 리뷰를 수정할때 리뷰 데이터
   * @param reviewId 리뷰 아이디
   * @param authorId 작성자 아이디
   */
  async findEditReviewByAuthorId(reviewId: string, authorId: string) {
    return await this.isReviewAuthor(reviewId, authorId);
  }

  /* 카테고리에 따른 리뷰 찾기 (무한스크롤) */
  async findByCategory(query: QueryReviewDto) {
    const { limit } = query;
    const reviews = await this.reviewRepository.findByCategory(query);
    const hasNextPage = reviews.length > limit;
    const dataToSend = hasNextPage ? reviews.slice(0, limit) : reviews;
    const nextCursor =
      dataToSend.length > 0 ? dataToSend[dataToSend.length - 1].id : null;

    return {
      data: dataToSend,
      meta: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  /* 리뷰 업데이트 */
  async update(
    user: UserPayload,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    /* 작성자 권한 확인 */
    await this.isReviewAuthor(reviewId, user.id);

    const { category } = updateReviewDto;
    if (!category) throw new BadRequestException();

    /* 카테고리 값 확인 */
    const categoryData = await this.reviewRepository.findCategoryData(category);
    if (!categoryData) throw new BadRequestException('Invalid category');

    /* 레포지토리를 통한 업데이트 */
    return await this.reviewRepository.update(
      reviewId,
      categoryData.id,
      updateReviewDto,
    );
  }

  /* 리뷰 삭제 */
  async delete(reviewId: string, user: UserPayload) {
    const review = await this.isReviewAuthor(reviewId, user.id);

    try {
      await this.reviewRepository.delete(reviewId);
    } catch {
      throw new InternalServerErrorException(
        '리뷰 삭제 중 오류가 발생했습니다.',
      );
    }

    try {
      if (review.images && review.images.length >= 1) {
        const imageKeys = review.images.map((image) => image.key);
        await this.imageService.deleteImage(imageKeys);
      }

      return { message: `${reviewId}가 삭제가 완료되었습니다` };
    } catch (e) {
      console.error(`${reviewId} 스토리지 제거 중 에러 - ${e}`);
      throw new InternalServerErrorException(
        `${reviewId} 이미지 스토리지 삭제 중 오류가 발생했습니다.`,
      );
    }
  }

  /* 카테고리 별 총 리뷰 갯수 */
  async countReviewByCategory() {
    return await this.reviewRepository.countReviewByCategory();
  }

  /** 이번주 인기 리뷰 조회 - Todo
   *
   * - "좋아요" 순으로 3개
   * - 레디스 또는 인 메모리 캐싱
   * - 일주일? 기간 설정해서 조회 해주기.
   */
  async getWeeklyPopularReviews() {}

  /* 유저가 작성한 리뷰를 카테고리별로 집계 */
  async countReviewByUserCategory(userId: string): Promise<
    Array<{
      categoryId: number;
      categoryName: CategoryType;
      categoryTitle: string;
      categoryDescription: string;
      count: number;
    }>
  > {
    return await this.reviewRepository.countUserReviewsByCategory(userId);
  }

  /* 리뷰에 작성된 댓글 가져오기 */
  async findAllCommentByReviewId(reviewId: string) {
    return await this.commentsService.findAll(reviewId);
  }

  /* 리뷰 좋아요 토글 */
  async toggleReviewLike(reviewId: string, userId: string) {
    const review = await this.findById(reviewId);
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다');

    const existingLike = await this.reviewRepository.findLikeReview(
      reviewId,
      userId,
    );

    if (existingLike) {
      return this.reviewRepository.unLikeReview(reviewId, userId);
    } else {
      return this.reviewRepository.likeReview(reviewId, userId);
    }
  }

  async findLikeReview(reviewId: string, userId: string) {
    const review = await this.findById(reviewId);
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다');

    const liked = await this.reviewRepository.findLikeReview(reviewId, userId);
    return { liked: !!liked };
  }

  /* 유저가 작성한 리뷰중 카테고리를 기준으로 데이터 가져오기 */
  async findReviewByUserIdAndCategory(
    authorId: string,
    category?: CategoryType,
    cursor?: string,
  ) {
    const limit = 15;
    const where: Prisma.ReviewWhereInput = {};

    if (authorId) {
      where.authorId = authorId;
    }
    if (category) {
      where.category = { name: category };
    }

    const queryOptions: Prisma.ReviewFindManyArgs = {
      where,
      include: reviewWithDetailsInclude,
      omit: {
        authorId: true,
        categoryId: true,
      },
      take: (limit || 15) + 1,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      queryOptions.skip = 1;
      queryOptions.cursor = { id: cursor };
    }

    const reviews = await this.prismaService.review.findMany(queryOptions);

    const hasNextPage = reviews.length > limit;
    const dataToSend = hasNextPage ? reviews.slice(0, limit) : reviews;
    const nextCursor =
      dataToSend.length > 0 ? dataToSend[dataToSend.length - 1].id : null;

    return {
      data: dataToSend,
      meta: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  /* 리뷰 아이디로 리뷰 검색 -> 작성자 아이디와 요청 아이디 비교 */
  private async isReviewAuthor(reviewId: string, id: string) {
    const review = await this.findById(reviewId);
    const isAuthor = review.author.id === id;
    if (!isAuthor) throw new ForbiddenException('권한이 없습니다.');
    return review;
  }
}
