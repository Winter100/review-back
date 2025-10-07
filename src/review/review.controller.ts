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

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Req() req: { user: UserPayload },
    @Body()
    createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewService.createReview(req.user, createReviewDto);
  }

  @Get()
  async findByCategory(@Query() query: QueryReviewDto) {
    return await this.reviewService.findByCategory(query);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reviewService.findById(id);
  }

  @Get(':id/edit')
  @UseGuards(JwtAuthGuard)
  async finyByIdEdit(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reviewService.findById(id);
  }

  /* 리뷰 업데이트 */
  @Patch(':id/update')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Req() req: { user: UserPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewService.update(req.user, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: UserPayload },
  ) {
    return await this.reviewService.delete(id, req.user);
  }

  @Get('favorite')
  favorite() {}

  /* 카테고리 별 총 리뷰 갯수 */
  @Get('category/count')
  async countReviewByCategory() {
    return await this.reviewService.countReviewByCategory();
  }
}
