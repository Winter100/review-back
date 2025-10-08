import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserPayload } from 'src/auth/types/payload';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyCategoryReviewDto } from 'src/review/dto/my-category-review.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* 프로필 정보 */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: { user: UserPayload }) {
    return await this.usersService.getProfile(req.user.id);
  }

  /* 프로필 업데이트 */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: { user: UserPayload },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(req.user.id, updateUserDto);
  }

  /* 유저가 작성한 리뷰 가져오기 */
  @Get(':id/reviews')
  async findAllReviewByUserId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() myCategoryReviewDto: MyCategoryReviewDto,
  ) {
    return await this.usersService.findReviewByUserIdAndCategory(
      id,
      myCategoryReviewDto?.category,
      myCategoryReviewDto?.cursor,
    );
  }
}
