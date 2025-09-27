import { Role } from '@prisma/client';

export type JwtPayLoad = {
  sub: string;
  email: string;
  nickname: string;
};

export type JwtRefreshPayLoad = {
  email: string;
  sub: string;
  refreshToken: string;
};

export type UserPayload = {
  id: string;
  email: string;
  nickname: string;
};

export type User = {
  id: string;
  nickname: string;
  email: string;
  profileImageUrl?: string | null;
  introduction?: string | null;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
};
