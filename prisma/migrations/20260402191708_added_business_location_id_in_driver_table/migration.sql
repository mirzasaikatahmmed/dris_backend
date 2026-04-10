/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `drivers` table. All the data in the column will be lost.
  - Added the required column `businessLocationId` to the `drivers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_restaurantId_fkey";

-- DropIndex
DROP INDEX "drivers_restaurantId_idx";

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "restaurantId",
ADD COLUMN     "businessLocationId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "drivers_businessLocationId_idx" ON "drivers"("businessLocationId");
