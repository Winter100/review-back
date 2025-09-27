import { Prisma, User } from '@prisma/client';

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete();
  findByEmail(email: string): Promise<User | null>;
  findById(email: string): Promise<User | null>;
}
