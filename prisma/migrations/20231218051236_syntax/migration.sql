/*
  Warnings:

  - You are about to drop the column `bidPrice` on the `BidHistory` table. All the data in the column will be lost.
  - You are about to drop the column `bidTime` on the `BidHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BidHistory` table. All the data in the column will be lost.
  - Added the required column `bid_price` to the `BidHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bid_time` to the `BidHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BidHistory" DROP COLUMN "bidPrice",
DROP COLUMN "bidTime",
DROP COLUMN "createdAt",
ADD COLUMN     "bid_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bid_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
