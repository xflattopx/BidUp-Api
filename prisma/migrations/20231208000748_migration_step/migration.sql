/*
  Warnings:

  - You are about to drop the column `bidPrice` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `bidTime` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryRequestId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `bidEndTime` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `dropoffLocation` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `preferredDeliveryTime` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `priceOffer` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DeliveryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bidId` on the `WinningBid` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bid_id]` on the table `WinningBid` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bid_price` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoff_location` to the `DeliveryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickup_location` to the `DeliveryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferred_delivery_time` to the `DeliveryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bid_id` to the `WinningBid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_deliveryRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryRequest" DROP CONSTRAINT "DeliveryRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_userId_fkey";

-- DropForeignKey
ALTER TABLE "WinningBid" DROP CONSTRAINT "WinningBid_bidId_fkey";

-- DropIndex
DROP INDEX "Customer_userId_key";

-- DropIndex
DROP INDEX "Driver_userId_key";

-- DropIndex
DROP INDEX "WinningBid_bidId_key";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "bidPrice",
DROP COLUMN "bidTime",
DROP COLUMN "deliveryRequestId",
DROP COLUMN "driverId",
ADD COLUMN     "bid_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bid_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "delivery_request_id" INTEGER,
ADD COLUMN     "driver_id" INTEGER;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryRequest" DROP COLUMN "bidEndTime",
DROP COLUMN "createdAt",
DROP COLUMN "dropoffLocation",
DROP COLUMN "pickupLocation",
DROP COLUMN "preferredDeliveryTime",
DROP COLUMN "priceOffer",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "bid_end_time" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dropoff_location" TEXT NOT NULL,
ADD COLUMN     "pickup_location" TEXT NOT NULL,
ADD COLUMN     "preferred_delivery_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "price_offer" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "WinningBid" DROP COLUMN "bidId",
ADD COLUMN     "bid_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_user_id_key" ON "Customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_user_id_key" ON "Driver"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "WinningBid_bid_id_key" ON "WinningBid"("bid_id");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_delivery_request_id_fkey" FOREIGN KEY ("delivery_request_id") REFERENCES "DeliveryRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinningBid" ADD CONSTRAINT "WinningBid_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
