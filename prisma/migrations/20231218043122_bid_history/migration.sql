/*
  Warnings:

  - You are about to drop the column `user_id` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the `WinningBid` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeliveryRequest" DROP CONSTRAINT "DeliveryRequest_user_id_fkey";

-- DropForeignKey
ALTER TABLE "WinningBid" DROP CONSTRAINT "WinningBid_bid_id_fkey";

-- DropForeignKey
ALTER TABLE "WinningBid" DROP CONSTRAINT "WinningBid_delivery_request_id_fkey";

-- AlterTable
ALTER TABLE "DeliveryRequest" DROP COLUMN "user_id",
ADD COLUMN     "customer_id" INTEGER;

-- DropTable
DROP TABLE "WinningBid";

-- CreateTable
CREATE TABLE "BidHistory" (
    "id" SERIAL NOT NULL,
    "bid_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "delivery_request_id" INTEGER NOT NULL,
    "bidPrice" DOUBLE PRECISION NOT NULL,
    "bidTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_bid_history_bid_id" ON "BidHistory"("bid_id");

-- CreateIndex
CREATE INDEX "idx_bid_history_driver_id" ON "BidHistory"("driver_id");

-- CreateIndex
CREATE INDEX "idx_bid_history_delivery_request_id" ON "BidHistory"("delivery_request_id");

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidHistory" ADD CONSTRAINT "BidHistory_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidHistory" ADD CONSTRAINT "BidHistory_delivery_request_id_fkey" FOREIGN KEY ("delivery_request_id") REFERENCES "DeliveryRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidHistory" ADD CONSTRAINT "BidHistory_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
