-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_driver_id_fkey";

-- AlterTable
ALTER TABLE "DeliveryRequest" ADD COLUMN     "initial_price_offer" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
