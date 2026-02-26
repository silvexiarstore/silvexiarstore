DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ComplaintIssueType') THEN
    CREATE TYPE "ComplaintIssueType" AS ENUM ('NOT_RECEIVED', 'DAMAGED', 'WRONG_ITEM', 'DEFECTIVE', 'MISSING_PARTS', 'OTHER');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ComplaintStatus') THEN
    CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ReturnComplaint" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "issueType" "ComplaintIssueType" NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "itemTitle" TEXT,
  "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
  "adminReply" TEXT,
  "adminRepliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReturnComplaint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReturnComplaint_orderId_idx" ON "ReturnComplaint"("orderId");
CREATE INDEX IF NOT EXISTS "ReturnComplaint_status_createdAt_idx" ON "ReturnComplaint"("status", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ReturnComplaint_orderId_fkey'
  ) THEN
    ALTER TABLE "ReturnComplaint"
    ADD CONSTRAINT "ReturnComplaint_orderId_fkey"
    FOREIGN KEY ("orderId")
    REFERENCES "Order"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;
