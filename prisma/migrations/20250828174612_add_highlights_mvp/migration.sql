-- CreateEnum
CREATE TYPE "public"."InteractionType" AS ENUM ('LIKE', 'SHARE', 'REPORT');

-- CreateTable
CREATE TABLE "public"."highlights" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "startNode" TEXT NOT NULL,
    "endNode" TEXT NOT NULL,
    "color" TEXT DEFAULT '#FFE0B2',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "highlights_articleId_userId_idx" ON "public"."highlights"("articleId", "userId");

-- CreateIndex
CREATE INDEX "highlights_articleId_isPublic_idx" ON "public"."highlights"("articleId", "isPublic");

-- AddForeignKey
ALTER TABLE "public"."highlights" ADD CONSTRAINT "highlights_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."highlights" ADD CONSTRAINT "highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
