/*
  Warnings:

  - Made the column `title` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "public"."CategoryType" ADD VALUE 'TRAVEL';

-- AlterTable
ALTER TABLE "public"."categories" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
