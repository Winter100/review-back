import { Prisma } from '@prisma/client';

export const reviewWithDetailsInclude =
  Prisma.validator<Prisma.ReviewInclude>()({
    category: {
      select: {
        name: true,
        title: true,
      },
    },
    author: {
      select: {
        nickname: true,
        profileImageUrl: true,
      },
    },
    tags: {
      select: {
        name: true,
      },
    },
  });

export type ReviewWithDetilas = Prisma.ReviewGetPayload<{
  include: typeof reviewWithDetailsInclude;
}>;
