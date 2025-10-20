import { CommentsRepository } from './repositories/comments.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async create(
    reviewId: string,
    authorId: string,
    content: string,
    parentId?: number,
  ) {
    return await this.commentsRepository.create(
      reviewId,
      authorId,
      content,
      parentId,
    );
  }

  async findAll(reviewId: string) {
    return await this.commentsRepository.findAll(reviewId);
  }

  /** 댓글 삭제
   *
   * @param commentId - 댓글 아이디
   * @param userId - 유저 아이디
   * -  내용은 null, deletedAt이 갱신됩니다.
   */
  async deleteComment(commentId: number, userId: string) {
    const comment = await this.commentsRepository.findByCommentId(commentId);

    if (!comment) throw new NotFoundException(`해당 댓글을 찾을 수 없습니다`);

    if (comment.authorId !== userId)
      throw new ForbiddenException('권한이 없습니다');

    const activeReplyCount =
      await this.commentsRepository.countActiveReplies(commentId);

    if (activeReplyCount > 0) {
      return await this.commentsRepository.softDelete(commentId);
    }

    return await this.commentsRepository.hardDelete(commentId);
  }
}
