-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "repeatPurchaseNotifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_status_receivedAt_repeatPurchaseNotifiedAt_idx" ON "public"."Order"("status", "receivedAt", "repeatPurchaseNotifiedAt");
