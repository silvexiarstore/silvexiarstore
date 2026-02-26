CREATE TABLE "HomeHeroSlide" (
  "id" TEXT NOT NULL,
  "badge" TEXT,
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "ctaLabel" TEXT NOT NULL DEFAULT 'Explore Now',
  "ctaLink" TEXT NOT NULL DEFAULT '/shop',
  "desktopImage" TEXT NOT NULL,
  "mobileImage" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeHeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomeProductSection" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeProductSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomeProductSection_slug_key" ON "HomeProductSection"("slug");
CREATE INDEX "HomeHeroSlide_isActive_orderIndex_idx" ON "HomeHeroSlide"("isActive", "orderIndex");
CREATE INDEX "HomeProductSection_isActive_orderIndex_idx" ON "HomeProductSection"("isActive", "orderIndex");
