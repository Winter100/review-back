import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/types/payload';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: { user: User }) {
    return await this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  // 프로필 업데이트
  async updateProfile(
    @Req() req: { user: User },
    @Body() updateProfileDto: Prisma.UserUpdateInput,
  ) {
    await this.usersService.update(req.user.id, updateProfileDto);
  }
}
