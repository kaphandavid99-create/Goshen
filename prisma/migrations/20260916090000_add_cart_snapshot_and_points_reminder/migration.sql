-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "lastPointsReminderAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."CartSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartSnapshot_userId_key" ON "public"."CartSnapshot"("userId");

-- AddForeignKey
ALTER TABLE "public"."CartSnapshot" ADD CONSTRAINT "CartSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
