/*
  Warnings:

  - The `deliveryAddress` column on the `LightspeedOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LightspeedOrder" DROP COLUMN "deliveryAddress",
ADD COLUMN     "deliveryAddress" JSONB;
