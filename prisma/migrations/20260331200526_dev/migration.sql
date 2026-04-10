-- AlterTable
ALTER TABLE "LightspeedOrder" ALTER COLUMN "deliveryAddress" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "lightspeed_order_config" ADD COLUMN     "deliveryFee" INTEGER;
