import { ImageService } from './../../supabase/image.service';
import { PrismaService } from './../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IReviewRepository } from './interface.ts/review.repository.interface';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UserPayload } from 'src/auth/types/payload';
import { CategoryType, Prisma } from '@prisma/client';
import { QueryReviewDto } from '../dto/query-review.dto';
import { reviewWithDetailsInclude } from '../types/review-repository-type';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async findCategoryData(category: CategoryType) {
    return await this.prismaService.category.findUnique({
      where: { name: category },
    });
  }

  async create(user: UserPayload, categoryId: number, dto: CreateReviewDto) {
    await this.prismaService.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          title: dto.title,
          content: dto.content,
          rating: dto.rating,
          authorId: user.id,
          categoryId: categoryId,
          mainImgaeUrl: dto?.images?.[0] ?? '',
        },
      });

      if (dto.tags && dto.tags.length > 0) {
        const tagData = dto.tags.map((tag) => ({
          name: tag,
          reviewId: review.id,
        }));
        await tx.tag.createMany({
          data: tagData,
        });
      }

      if (dto.images && dto.images.length > 0) {
        const imageData = dto.images.map((key, idx) => ({
          key,
          isMain: idx === 0,
          reviewId: review.id,
        }));
        await tx.reviewImage.createMany({ data: imageData });
      }

      const full = await tx.review.findUnique({
        where: { id: review.id },
        omit: {
          authorId: true,
          categoryId: true,
        },
        include: { images: true, category: true, tags: true },
      });

      return full;
    });
  }
  async findById(id: string) {
    return await this.prismaService.review.findUnique({
      where: { id },
      omit: {
        authorId: true,
        categoryId: true,
      },
      include: {
        author: { select: { id: true, nickname: true, profileImageUrl: true } },
        category: { select: { name: true } },
        images: { select: { key: true, isMain: true } },
        tags: { select: { name: true } },
      },
    });
  }
  async findByCategory(query: QueryReviewDto) {
    const { q, cursor, limit, category, sort, authorId } = query;

    const where: Prisma.ReviewWhereInput = {};

    if (q) {
      where.title = {
        contains: q,
        mode: 'insensitive',
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (category) {
      where.category = { name: { in: category as CategoryType[] } };
    }

    const queryOptions: Prisma.ReviewFindManyArgs = {
      where,
      include: reviewWithDetailsInclude,
      omit: {
        authorId: true,
        categoryId: true,
      },
      take: (limit || 15) + 1,
      orderBy: { createdAt: sort },
    };

    if (cursor) {
      queryOptions.skip = 1;
      queryOptions.cursor = { id: cursor };
    }

    return await this.prismaService.review.findMany(queryOptions);
  }

  async findCategoryCount() {
    return await this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        _count: {
          select: {
            review: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async countReviewByUserId(userId: string) {
    return await this.prismaService.review.count({
      where: {
        authorId: userId,
      },
    });
  }

  async countUserReviewsByCategory(userId: string): Promise<
    Array<{
      categoryId: number;
      categoryName: CategoryType;
      categoryTitle: string;
      categoryDescription: string;
      count: number;
    }>
  > {
    // 1. 모든 카테고리 정보를 먼저 가져오기
    const allCategories = await this.prismaService.category.findMany({
      select: { id: true, name: true, title: true, description: true },
      orderBy: { id: 'asc' },
    });

    // 2. 해당 유저가 작성한 리뷰의 카테고리별 개수 집계
    const grouped = await this.prismaService.review.groupBy({
      by: ['categoryId'],
      where: { authorId: userId },
      _count: { _all: true },
    });

    // 3. 작성된 리뷰의 카테고리별 개수를 Map으로 변환
    const reviewCountByCategory = new Map(
      grouped.map((g) => [g.categoryId, g._count._all]),
    );

    // 4. 모든 카테고리에 대해 결과 생성 (작성하지 않은 카테고리는 count: 0)
    const result = allCategories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      categoryTitle: category.title,
      categoryDescription: category.description,
      count: reviewCountByCategory.get(category.id) || 0,
    }));

    return result;
  }

  findAll(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  async update(
    id: string,
    categoryId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images, tags, category, ...data } = updateReviewDto;

    return await this.prismaService.$transaction(async (tx) => {
      // 기존 이미지 삭제
      await tx.reviewImage.deleteMany({
        where: { reviewId: id },
      });

      // 새로운 이미지 추가
      if (Array.isArray(images) && images.length > 0) {
        await tx.reviewImage.createMany({
          data: images.map((key, i) => ({
            reviewId: id,
            key,
            isMain: i === 0,
          })),
        });
      }

      // 기존 태그 삭제
      await tx.tag.deleteMany({
        where: { reviewId: id },
      });

      // 새로운 태그 추가
      if (Array.isArray(tags) && tags.length > 0) {
        await tx.tag.createMany({
          data: tags.map((name) => ({
            reviewId: id,
            name,
          })),
        });
      }

      // 리뷰 업데이트
      return await tx.review.update({
        where: { id },
        data: {
          ...data,
          categoryId,
          mainImgaeUrl: images?.[0] ?? '',
        },
        omit: {
          authorId: true,
          categoryId: true,
        },
        include: {
          author: {
            select: { id: true, nickname: true, profileImageUrl: true },
          },
          category: { select: { name: true } },
          images: { select: { key: true, isMain: true } },
          tags: { select: { name: true } },
        },
      });
    });
  }
  async delete(): Promise<void> {
    // await this.prismaService.$transaction(async (ctx) => {
    //   await ctx.review.delete({ where: { id } });
    // });
    // throw new Error('Method not implemented.');
  }
}
