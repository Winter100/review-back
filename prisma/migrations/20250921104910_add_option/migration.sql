/*
  Warnings:

  - You are about to drop the column `reviewId` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mainImgaeUrl` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "reviewId";

-- AlterTable
ALTER TABLE "public"."review_images" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "mainImgaeUrl" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_key" ON "public"."categories"("category");
