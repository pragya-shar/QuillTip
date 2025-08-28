/*
  Warnings:

  - You are about to drop the column `color` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_DocumentToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collaborations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `versions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashedPassword` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_DocumentToTag" DROP CONSTRAINT "_DocumentToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DocumentToTag" DROP CONSTRAINT "_DocumentToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."collaborations" DROP CONSTRAINT "collaborations_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."collaborations" DROP CONSTRAINT "collaborations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."versions" DROP CONSTRAINT "versions_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."versions" DROP CONSTRAINT "versions_documentId_fkey";

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "color",
DROP COLUMN "createdAt",
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "image",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "hashedPassword" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_DocumentToTag";

-- DropTable
DROP TABLE "public"."collaborations";

-- DropTable
DROP TABLE "public"."comments";

-- DropTable
DROP TABLE "public"."documents";

-- DropTable
DROP TABLE "public"."versions";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ArticleToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "public"."articles"("slug");

-- CreateIndex
CREATE INDEX "articles_authorId_idx" ON "public"."articles"("authorId");

-- CreateIndex
CREATE INDEX "articles_published_publishedAt_idx" ON "public"."articles"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "_ArticleToTag_B_index" ON "public"."_ArticleToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "public"."tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- AddForeignKey
ALTER TABLE "public"."articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
