-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCost" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "shippingType" TEXT DEFAULT 'STANDARD';
