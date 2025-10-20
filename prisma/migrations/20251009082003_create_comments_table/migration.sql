-- CreateTable
CREATE TABLE "public"."comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_reviewId_parentId_idx" ON "public"."comments"("reviewId", "parentId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
