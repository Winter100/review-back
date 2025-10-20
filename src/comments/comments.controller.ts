import { CommentsService } from './comments.service';
import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayload } from 'src/auth/types/payload';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':reviewId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Req() req: { user: UserPayload },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { content, parentId } = createCommentDto;
    return await this.commentsService.create(
      reviewId,
      req.user.id,
      content,
      parentId,
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: { user: UserPayload },
  ) {
    return await this.commentsService.deleteComment(commentId, req.user.id);
  }
}
