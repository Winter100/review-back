import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from './interface/comments.repository.interface';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    reviewId: string,
    authorId: string,
    content: string,
    parentId?: number,
  ) {
    return await this.prismaService.comment.create({
      data: {
        content,
        authorId,
        reviewId,
        parentId,
      },
    });
  }

  async softDelete(commentId: number) {
    return await this.prismaService.comment.update({
      where: { id: commentId },
      data: {
        content: '삭제된 댓글입니다',
        deletedAt: new Date(),
      },
    });
  }

  async hardDelete(commentId: number) {
    return await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }

  async countActiveReplies(commentId: number) {
    return await this.prismaService.comment.count({
      where: {
        parentId: commentId,
      },
    });
  }

  async findAll(reviewId: string) {
    return this.prismaService.comment.findMany({
      where: {
        reviewId,
        parentId: null,
        // deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async findByCommentId(commentId: number) {
    return await this.prismaService.comment.findUnique({
      where: {
        id: commentId,
        deletedAt: null,
      },
    });
  }
}
