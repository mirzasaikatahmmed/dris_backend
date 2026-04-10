-- DropForeignKey
ALTER TABLE "LightspeedOrder" DROP CONSTRAINT "LightspeedOrder_driverId_fkey";

-- AddForeignKey
ALTER TABLE "LightspeedOrder" ADD CONSTRAINT "LightspeedOrder_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
