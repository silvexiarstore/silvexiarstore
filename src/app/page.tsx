import prisma from "@/lib/prisma";
import HeroSlider, { HeroSlideItem } from "@/components/HeroSlider";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/money";
import { ArrowRight, Package, Sparkles, Star } from "lucide-react";
import { Prisma } from "@prisma/client";

type ProductWithCategory = Awaited<
  ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>
>[number];

type CategoryItem = Awaited<ReturnType<typeof prisma.category.findMany>>[number];

type HeroSlideRow = {
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
};

type HomeSectionRow = {
  id: string;
  name: string;
  slug: string;
  productIds: string[];
  showTitle: boolean;
  orderIndex: number;
  isActive: boolean;
};

type LayoutRow = {
  id: string;
  key: string;
  label: string;
  orderIndex: number;
  isActive: boolean;
};

function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_70px_rgba(15,23,42,0.14)] transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[4/5] bg-slate-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400">
            <Package size={34} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-black text-cyan-700">
          {product.category?.name || "Silvexiar"}
        </p>
        <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">{product.title}</h3>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-black text-orange-500">{formatMoney(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through">{formatMoney(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductSection({ title, products, showTitle }: { title: string; products: ProductWithCategory[]; showTitle: boolean }) {
  if (products.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-9">
          <div>
            {showTitle && (
              <>
                <p className="text-[10px] uppercase tracking-[0.28em] font-black text-cyan-600 mb-3">Curated Rail</p>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">{title}</h2>
              </>
            )}
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-700 hover:text-cyan-700"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryBanner({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-[#f0ffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-white">Shop by Mood</h2>
          <Sparkles size={20} className="text-cyan-200" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="relative h-44 rounded-2xl overflow-hidden border border-cyan-200/25 group"
            >
              {category.image ? (
                <Image src={category.image} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-cyan-600 to-teal-700" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#052D2D]/75 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-sm font-black">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    "Fast global delivery",
    "Secured checkout",
    "Daily curated products",
    "Dedicated support",
  ];

  return (
    <section className="py-10 bg-slate-100 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-white p-4 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center gap-2">
            <Star size={14} className="text-orange-500 fill-orange-500" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-[0.08em]">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [latestProducts, categories, heroSlides, homeSections, layoutBlocks] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.category.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.$queryRaw<HeroSlideRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeHeroSlide"
      WHERE "isActive" = true
      ORDER BY "orderIndex" ASC
    `),
    prisma.$queryRaw<HomeSectionRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeProductSection"
      WHERE "isActive" = true
      ORDER BY "orderIndex" ASC
    `),
    prisma.$queryRaw<LayoutRow[]>(Prisma.sql`
      SELECT *
      FROM "HomeLayoutBlock"
      WHERE "isActive" = true
      ORDER BY "orderIndex" ASC
    `),
  ]);

  const heroData: HeroSlideItem[] = heroSlides.map((slide: HeroSlideRow) => ({
    id: slide.id,
    badge: slide.badge,
    title: slide.title,
    subtitle: slide.subtitle,
    ctaLabel: slide.ctaLabel,
    ctaLink: slide.ctaLink,
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage,
    desktopImages: Array.isArray(slide.desktopImages) && slide.desktopImages.length > 0 ? slide.desktopImages : [slide.desktopImage],
    mobileImages: Array.isArray(slide.mobileImages) && slide.mobileImages.length > 0 ? slide.mobileImages : [slide.mobileImage],
    showText: slide.showText !== false,
    frameBadges: Array.isArray(slide.frameBadges) ? slide.frameBadges : [],
    frameTitles: Array.isArray(slide.frameTitles) ? slide.frameTitles : [],
    frameSubtitles: Array.isArray(slide.frameSubtitles) ? slide.frameSubtitles : [],
    frameShowText: Array.isArray(slide.frameShowText) ? slide.frameShowText : [],
  }));

  const productsById = new Map(latestProducts.map((product: ProductWithCategory) => [product.id, product]));

  const sectionViews = homeSections.map((section: HomeSectionRow) => ({
    title: section.name,
    showTitle: section.showTitle !== false,
    products: section.productIds
      .map((id: string) => productsById.get(id))
      .filter((product: ProductWithCategory | undefined): product is ProductWithCategory => Boolean(product)),
  }));

  const defaultLayout: LayoutRow[] = [
    { id: "d1", key: "HERO", label: "Hero Slider", orderIndex: 0, isActive: true },
    { id: "d2", key: "TRUST", label: "Trust Strip", orderIndex: 1, isActive: true },
    { id: "d3", key: "CATEGORIES", label: "Categories", orderIndex: 2, isActive: true },
    ...sectionViews.map((section, idx) => ({
      id: `ds-${idx}`,
      key: `SECTION:${idx}`,
      label: section.title,
      orderIndex: idx + 3,
      isActive: true,
    })),
  ];

  const blocks = layoutBlocks.length > 0 ? layoutBlocks : defaultLayout;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {blocks.map((block: LayoutRow, index: number) => {
        if (block.key === "HERO") return <HeroSlider key={`${block.key}-${index}`} slides={heroData} />;
        if (block.key === "TRUST") return <TrustStrip key={`${block.key}-${index}`} />;
        if (block.key === "CATEGORIES") return <CategoryBanner key={`${block.key}-${index}`} categories={categories} />;

        if (block.key.startsWith("SECTION:")) {
          const sectionIndex = Number(block.key.split(":")[1]);
          const section = sectionViews[sectionIndex];
          if (!section || section.products.length === 0) return null;
          return (
            <div key={`${block.key}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <ProductSection title={section.title} products={section.products} showTitle={section.showTitle} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
