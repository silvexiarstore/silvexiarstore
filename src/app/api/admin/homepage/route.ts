import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

type SlideInput = {
  badge?: string | null;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  desktopImage?: string;
  mobileImage?: string;
  desktopImages?: string[];
  mobileImages?: string[];
  showText?: boolean;
  frameBadges?: string[];
  frameTitles?: string[];
  frameSubtitles?: string[];
  frameShowText?: boolean[];
  isActive?: boolean;
};

type SectionInput = {
  name?: string;
  productIds?: string[];
  showTitle?: boolean;
  isActive?: boolean;
};

type LayoutInput = {
  key?: string;
  label?: string;
  isActive?: boolean;
};

type SlideRow = {
  id: string;
  badge: string | null;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
  desktopImages: string[] | null;
  mobileImages: string[] | null;
  showText: boolean;
  frameBadges: string[] | null;
  frameTitles: string[] | null;
  frameSubtitles: string[] | null;
  frameShowText: boolean[] | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SectionRow = {
  id: string;
  name: string;
  slug: string;
  productIds: string[];
  showTitle: boolean;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type LayoutRow = {
  id: string;
  key: string;
  label: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [slides, sections, layout, products] = await Promise.all([
    prisma.$queryRaw<SlideRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeHeroSlide"
      ORDER BY "orderIndex" ASC
    `),
    prisma.$queryRaw<SectionRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeProductSection"
      ORDER BY "orderIndex" ASC
    `),
    prisma.$queryRaw<LayoutRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeLayoutBlock"
      ORDER BY "orderIndex" ASC
    `),
    prisma.product.findMany({
      select: { id: true, title: true, slug: true, price: true, images: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const normalizedSlides = slides.map((slide) => ({
    ...slide,
    desktopImages:
      Array.isArray(slide.desktopImages) && slide.desktopImages.length > 0
        ? slide.desktopImages
        : slide.desktopImage
          ? [slide.desktopImage]
          : [],
    mobileImages:
      Array.isArray(slide.mobileImages) && slide.mobileImages.length > 0
        ? slide.mobileImages
        : slide.mobileImage
          ? [slide.mobileImage]
          : [],
    showText: slide.showText !== false,
    frameBadges: Array.isArray(slide.frameBadges) ? slide.frameBadges : [],
    frameTitles: Array.isArray(slide.frameTitles) ? slide.frameTitles : [],
    frameSubtitles: Array.isArray(slide.frameSubtitles) ? slide.frameSubtitles : [],
    frameShowText: Array.isArray(slide.frameShowText) ? slide.frameShowText : [],
  }));

  return NextResponse.json({ slides: normalizedSlides, sections, layout, products });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slides = Array.isArray(body?.slides) ? (body.slides as SlideInput[]) : [];
    const sections = Array.isArray(body?.sections) ? (body.sections as SectionInput[]) : [];
    const layout = Array.isArray(body?.layout) ? (body.layout as LayoutInput[]) : [];

    const cleanedSlides = slides
      .map((slide) => {
        const desktopImages = Array.isArray(slide.desktopImages)
          ? slide.desktopImages.filter((url) => typeof url === "string" && url.trim())
          : [];
        const mobileImages = Array.isArray(slide.mobileImages)
          ? slide.mobileImages.filter((url) => typeof url === "string" && url.trim())
          : [];

        const desktopFallback = String(slide.desktopImage || desktopImages[0] || "").trim();
        const mobileFallback = String(slide.mobileImage || mobileImages[0] || "").trim();

        return {
          badge: (slide.badge || "").trim() || null,
          title: String(slide.title || "").trim(),
          subtitle: String(slide.subtitle || "").trim(),
          ctaLabel: String(slide.ctaLabel || "Explore Now").trim(),
          ctaLink: String(slide.ctaLink || "/shop").trim(),
          desktopImage: desktopFallback,
          mobileImage: mobileFallback,
          desktopImages: desktopImages.length > 0 ? desktopImages : desktopFallback ? [desktopFallback] : [],
          mobileImages: mobileImages.length > 0 ? mobileImages : mobileFallback ? [mobileFallback] : [],
          showText: slide.showText !== false,
          frameBadges: Array.isArray(slide.frameBadges)
            ? slide.frameBadges.map((v) => String(v || "").trim())
            : [],
          frameTitles: Array.isArray(slide.frameTitles)
            ? slide.frameTitles.map((v) => String(v || "").trim())
            : [],
          frameSubtitles: Array.isArray(slide.frameSubtitles)
            ? slide.frameSubtitles.map((v) => String(v || "").trim())
            : [],
          frameShowText: Array.isArray(slide.frameShowText)
            ? slide.frameShowText.map((v) => Boolean(v))
            : [],
          isActive: slide.isActive !== false,
        };
      })
      .filter((slide) => slide.desktopImage && slide.mobileImage)
      .map((slide, index) => ({ ...slide, orderIndex: index }));

    const slugUsage = new Map<string, number>();
    const cleanedSections = sections
      .filter((section) => section.name && String(section.name).trim())
      .map((section, index) => {
        const baseSlug = slugify(String(section.name)) || `section-${index + 1}`;
        const seen = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, seen + 1);
        const slug = seen === 0 ? baseSlug : `${baseSlug}-${seen + 1}`;

        return {
          name: String(section.name).trim(),
          slug,
          productIds: Array.isArray(section.productIds)
            ? section.productIds.filter((id) => typeof id === "string" && id.trim())
            : [],
          showTitle: section.showTitle !== false,
          orderIndex: index,
          isActive: section.isActive !== false,
        };
      });

    const allowedKeys = new Set<string>(["HERO", "TRUST", "CATEGORIES"]);
    cleanedSections.forEach((_, index) => allowedKeys.add(`SECTION:${index}`));

    const cleanedLayout = layout
      .map((item) => ({
        key: String(item.key || "").trim().toUpperCase(),
        label: String(item.label || "").trim(),
        isActive: item.isActive !== false,
      }))
      .filter((item) => item.key && allowedKeys.has(item.key))
      .map((item, index) => ({
        ...item,
        orderIndex: index,
        label: item.label || item.key,
      }));

    const finalLayout =
      cleanedLayout.length > 0
        ? cleanedLayout
        : [
            { key: "HERO", label: "Hero Slider", orderIndex: 0, isActive: true },
            { key: "TRUST", label: "Trust Strip", orderIndex: 1, isActive: true },
            { key: "CATEGORIES", label: "Categories", orderIndex: 2, isActive: true },
            ...cleanedSections.map((section, index) => ({
              key: `SECTION:${index}`,
              label: section.name,
              orderIndex: index + 3,
              isActive: true,
            })),
          ];

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM "HomeHeroSlide"`;
      await tx.$executeRaw`DELETE FROM "HomeProductSection"`;
      await tx.$executeRaw`DELETE FROM "HomeLayoutBlock"`;

      for (const slide of cleanedSlides) {
        await tx.$executeRaw`
          INSERT INTO "HomeHeroSlide" (
            "id", "badge", "title", "subtitle", "ctaLabel", "ctaLink", "desktopImage", "mobileImage",
            "desktopImages", "mobileImages", "showText", "frameBadges", "frameTitles", "frameSubtitles", "frameShowText",
            "orderIndex", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()},
            ${slide.badge},
            ${slide.title},
            ${slide.subtitle},
            ${slide.ctaLabel},
            ${slide.ctaLink},
            ${slide.desktopImage},
            ${slide.mobileImage},
            ${slide.desktopImages},
            ${slide.mobileImages},
            ${slide.showText},
            ${slide.frameBadges},
            ${slide.frameTitles},
            ${slide.frameSubtitles},
            ${slide.frameShowText},
            ${slide.orderIndex},
            ${slide.isActive},
            NOW(),
            NOW()
          )
        `;
      }

      for (const section of cleanedSections) {
        await tx.$executeRaw`
          INSERT INTO "HomeProductSection" (
            "id", "name", "slug", "productIds", "showTitle", "orderIndex", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()},
            ${section.name},
            ${section.slug},
            ${section.productIds},
            ${section.showTitle},
            ${section.orderIndex},
            ${section.isActive},
            NOW(),
            NOW()
          )
        `;
      }

      for (const block of finalLayout) {
        await tx.$executeRaw`
          INSERT INTO "HomeLayoutBlock" (
            "id", "key", "label", "orderIndex", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()},
            ${block.key},
            ${block.label},
            ${block.orderIndex},
            ${block.isActive},
            NOW(),
            NOW()
          )
        `;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_HOMEPAGE_SAVE_ERROR", error);
    return NextResponse.json({ error: "Failed to save homepage settings" }, { status: 500 });
  }
}
