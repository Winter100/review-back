/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `review_images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `review_images` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `review_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."review_images" DROP COLUMN "imageUrl",
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "review_images_key_key" ON "public"."review_images"("key");
