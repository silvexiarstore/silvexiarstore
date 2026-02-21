-- Remove STANDARD from ShippingMethod enum and default order method to FREE
CREATE TYPE "ShippingMethod_new" AS ENUM ('FREE', 'FAST', 'SUPER_FAST');

ALTER TABLE "Order"
ALTER COLUMN "shippingMethod" DROP DEFAULT;

UPDATE "Order"
SET "shippingMethod" = 'FREE'
WHERE "shippingMethod"::text = 'STANDARD';

ALTER TABLE "Order"
ALTER COLUMN "shippingMethod" TYPE "ShippingMethod_new"
USING ("shippingMethod"::text::"ShippingMethod_new");

ALTER TABLE "Order"
ALTER COLUMN "shippingMethod" SET DEFAULT 'FREE';

DROP TYPE "ShippingMethod";
ALTER TYPE "ShippingMethod_new" RENAME TO "ShippingMethod";
