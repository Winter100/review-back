import { UpdateReviewDto } from './../../dto/update-review.dto';
import { QueryReviewDto } from './../../dto/query-review.dto';
import { UserPayload } from './../../../auth/types/payload';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';
import { CategoryType } from '@prisma/client';

export interface IReviewRepository {
  /** 리뷰 생성
   *
   * @param user
   * @param categoryId
   * @param dto
   */
  create(
    user: UserPayload,
    categoryId: number,
    dto: CreateReviewDto,
  ): Promise<any>;

  /** 리뷰 아이디로 리뷰 찾기
   *
   * @param id
   */
  findById(id: string): Promise<any>;

  /** 쿼리로 리뷰들 찾기
   *
   * @param queryReviewDto
   */
  findByCategory(queryReviewDto: QueryReviewDto): Promise<any[]>;

  /** 리뷰 수정
   *
   * @param reviewId
   * @param categoryId
   * @param updateReviewDto
   */
  update(
    reviewId: string,
    categoryId: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<any>;

  /** 리뷰 삭제
   *
   * @param id
   */
  delete(reviewId: string);

  /** 카테고리 값 조회
   * @param category
   */
  findCategoryData(category: CategoryType);

  /** 카테고리 별 리뷰 갯수
   *
   */
  countReviewByCategory();

  /** 카테고리별 유저가 작성한 리뷰 갯수 */
  countUserReviewsByCategory(userId: string);

  /** 리뷰 좋아요 */
  likeReview(reviewId: string, userId: string);

  unLikeReview(reviewId: string, userId: string);

  findLikeReview(reviewId: string, userId: string);

  /** 이번주 인기 리뷰 조회 */
  getWeeklyPopularReviews();
}
