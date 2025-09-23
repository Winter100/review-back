import { CreateReviewDto } from './dto/create-review.dto';
import { ImageService } from './../supabase/image.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessedFile } from './types/image-type';
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
  ) {}

  // 리뷰 생성
  async createReview(
    user: UserPayload,
    createReviewDto: CreateReviewDto,
    files: Express.Multer.File[],
  ) {
    let imgaeUrls: string[] = [];

    if (files && files.length > 0) {
      imgaeUrls = await this.isImageSave(files);
    }

    return await this.reviewRepository.create(user, createReviewDto, imgaeUrls);
  }

  // 리뷰 상세
  async findById(id: string) {
    const review = await this.reviewRepository.findById(id);

    if (!review) throw new NotFoundException();

    return review;
  }

  async findByCategory(query: QueryReviewDto) {
    const { cursor, limit, rating, category, page } = query;

    const where: Prisma.ReviewWhereInput = {};

    if (category) {
      where.category = { name: { in: category as CategoryType[] } };
    }

    if (rating) {
      where.rating = {
        gte: rating,
      };
    }

    const queryOptions: Prisma.ReviewFindManyArgs = {
      where,
      include: reviewWithDetailsInclude,
      omit: {
        authorId: true,
        categoryId: true,
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      queryOptions.skip = 1;
      queryOptions.cursor = { id: cursor };
    }

    const reviews = await this.reviewRepository.findByCategory(queryOptions);
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
  async findAll() {}
  async update() {}

  async delete(id: string) {
    // 저장된 리뷰의 authId와 jwt의 id비교 하기
    return await this.reviewRepository.delete(id);
  }

  private async isImageSave(files: Express.Multer.File[]) {
    const processedFiles: ProcessedFile[] =
      await this.imageService.processMultipleFile(files);

    const uploadPromises = processedFiles.map((file) =>
      this.imageService.uploadFile(file, 'reviews'),
    );

    return await Promise.all(uploadPromises);
  }
}
