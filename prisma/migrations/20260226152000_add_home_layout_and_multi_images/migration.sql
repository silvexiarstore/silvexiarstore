ALTER TABLE "HomeHeroSlide"
ADD COLUMN "desktopImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "mobileImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "HomeHeroSlide"
SET "desktopImages" = ARRAY["desktopImage"],
    "mobileImages" = ARRAY["mobileImage"]
WHERE array_length("desktopImages", 1) IS NULL
   OR array_length("desktopImages", 1) = 0
   OR array_length("mobileImages", 1) IS NULL
   OR array_length("mobileImages", 1) = 0;

CREATE TABLE "HomeLayoutBlock" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeLayoutBlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomeLayoutBlock_key_key" ON "HomeLayoutBlock"("key");
CREATE INDEX "HomeLayoutBlock_isActive_orderIndex_idx" ON "HomeLayoutBlock"("isActive", "orderIndex");
