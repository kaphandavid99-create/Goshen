-- CreateTable
CREATE TABLE "public"."PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "public"."PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_visitorId_createdAt_idx" ON "public"."PageView"("visitorId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
