-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('FOOD', 'ETC');

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "price" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_images" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews_tags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "reviews_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "category" "public"."CategoryType" NOT NULL,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_images" ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews_tags" ADD CONSTRAINT "reviews_tags_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
