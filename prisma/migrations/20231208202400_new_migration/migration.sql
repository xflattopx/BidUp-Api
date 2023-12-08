/*
  Warnings:

  - The primary key for the `WinningBid` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deliveryRequestId` on the `WinningBid` table. All the data in the column will be lost.
  - Added the required column `delivery_request_id` to the `WinningBid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WinningBid" DROP CONSTRAINT "WinningBid_deliveryRequestId_fkey";

-- AlterTable
ALTER TABLE "WinningBid" DROP CONSTRAINT "WinningBid_pkey",
DROP COLUMN "deliveryRequestId",
ADD COLUMN     "delivery_request_id" INTEGER NOT NULL,
ADD CONSTRAINT "WinningBid_pkey" PRIMARY KEY ("delivery_request_id");

-- AddForeignKey
ALTER TABLE "WinningBid" ADD CONSTRAINT "WinningBid_delivery_request_id_fkey" FOREIGN KEY ("delivery_request_id") REFERENCES "DeliveryRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
