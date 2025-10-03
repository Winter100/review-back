import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/types/payload';
import { Prisma } from '@prisma/client';

@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* 프로필 정보 */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: { user: User }) {
    return await this.usersService.getProfile(req.user.id);
  }

  /* 프로필 업데이트 */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: { user: User },
    @Body() updateProfileDto: Prisma.UserUpdateInput,
  ) {
    await this.usersService.update(req.user.id, updateProfileDto);
  }

  /* 유저가 작성한 리뷰 가져오기 */
  @Get(':id/reviews')
  async findAllReviewByUserId(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.findAllReviewByUserId(id);
  }
}
