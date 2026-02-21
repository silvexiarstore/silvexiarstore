/*
  Warnings:

  - You are about to drop the column `shippingType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isFastShipping` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isFreeShipping` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPrice` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('FREE', 'FAST', 'SUPER_FAST', 'STANDARD');

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingType",
ADD COLUMN     "maxDeliveryDays" INTEGER,
ADD COLUMN     "minDeliveryDays" INTEGER,
ADD COLUMN     "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isFastShipping",
DROP COLUMN "isFreeShipping",
DROP COLUMN "shippingPrice",
ADD COLUMN     "fastShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fastShippingMaxDeliveryDays" INTEGER,
ADD COLUMN     "fastShippingMinDeliveryDays" INTEGER,
ADD COLUMN     "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freeShippingMaxDeliveryDays" INTEGER,
ADD COLUMN     "freeShippingMinDeliveryDays" INTEGER,
ADD COLUMN     "superFastMaxDeliveryDays" INTEGER,
ADD COLUMN     "superFastMinDeliveryDays" INTEGER,
ADD COLUMN     "superFastPrice" DECIMAL(65,30),
ADD COLUMN     "superFastShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "fastShippingPrice" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
