import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReviewService } from './review.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { UserPayload } from 'src/auth/types/payload';
import { QueryReviewDto } from './dto/query-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FindOneParamsDto } from './dto/find-one-params.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /* 리뷰 생성 */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Req() req: { user: UserPayload },
    @Body()
    createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewService.createReview(req.user, createReviewDto);
  }

  /* 쿼리로 리뷰들 조회 (무한스크롤) */
  @Get()
  async findByCategory(@Query() query: QueryReviewDto) {
    return await this.reviewService.findByCategory(query);
  }

  /* 리뷰 상세 정보 */
  @Get(':id')
  async findById(@Param() param: FindOneParamsDto) {
    return await this.reviewService.findById(param.id);
  }

  /* 리뷰 아이디로 수정용 리뷰 정보 조회 */
  @Get(':id/edit')
  @UseGuards(JwtAuthGuard)
  async finyByIdEdit(
    @Param() param: FindOneParamsDto,
    @Req() req: { user: UserPayload },
  ) {
    return await this.reviewService.findEditReviewByAuthorId(
      param.id,
      req.user.id,
    );
  }

  /* 리뷰 업데이트 */
  @Patch(':id/update')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Req() req: { user: UserPayload },
    @Param() param: FindOneParamsDto,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewService.update(req.user, param.id, updateReviewDto);
  }

  /* 리뷰 삭제 */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param() param: FindOneParamsDto,
    @Req() req: { user: UserPayload },
  ) {
    return await this.reviewService.delete(param.id, req.user);
  }

  /* 카테고리 별 총 리뷰 갯수 */
  @Get('category/count')
  async countReviewByCategory() {
    return await this.reviewService.countReviewByCategory();
  }

  /* 리뷰의 댓글 가져오기 */
  @Get(':reviewId/comments')
  async findAllCommentByReviewId(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
  ) {
    return await this.reviewService.findAllCommentByReviewId(reviewId);
  }

  @Post(':reviewId/like')
  @UseGuards(JwtAuthGuard)
  async toggleReviewLike(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Req() req: { user: UserPayload },
  ) {
    return await this.reviewService.toggleReviewLike(reviewId, req.user.id);
  }

  @Get(':reviewId/like')
  @UseGuards(JwtAuthGuard)
  async findLikeReview(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Req() req: { user: UserPayload },
  ) {
    return await this.reviewService.findLikeReview(reviewId, req.user.id);
  }

  /* 이번주 인기 리뷰 조회 */
  @Get('popular/weekly')
  async getWeeklyPopularReview() {
    return await this.reviewService.getWeeklyPopularReviews();
  }
}
