import { Injectable } from '@nestjs/common';
import { IUserRepository } from './interfaces/user.repository.interface';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({ data });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }
  async findById(id: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async deleteRefreshToken(userId: string) {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: {
        refreshToken: undefined,
      },
    });
  }

  async upsertRefreshToken(userId: string, token: string, expiresAt: Date) {
    await this.prismaService.refreshToken.upsert({
      where: { userId: userId },
      create: {
        userId,
        token,
        expiresAt,
      },
      update: {
        token,
        expiresAt,
      },
    });
  }

  delete() {
    throw new Error('Method not implemented.');
  }
}
