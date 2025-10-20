-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."review_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_likes_reviewId_userId_key" ON "public"."review_likes"("reviewId", "userId");

-- AddForeignKey
ALTER TABLE "public"."review_likes" ADD CONSTRAINT "review_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_likes" ADD CONSTRAINT "review_likes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
