ALTER TABLE "Order"
ADD COLUMN "paypalInvoiceId" TEXT;

CREATE UNIQUE INDEX "Order_paypalInvoiceId_key" ON "Order"("paypalInvoiceId");
