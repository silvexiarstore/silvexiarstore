import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ShopFilters from "@/components/ShopFilters";
import { MotionDiv } from "@/components/MotionDiv";
import { ShoppingBag, SlidersHorizontal, PackageOpen } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: {
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
    search?: string;
    shipping?: string;
    shipMin?: string;
    shipMax?: string;
    deliveryMin?: string;
    deliveryMax?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  
  const categorySlug = params.category;
  const minPrice = params.min ? parseFloat(params.min) : undefined;
  const maxPrice = params.max ? parseFloat(params.max) : undefined;
  const sort = params.sort || "latest";
  const searchQuery = params.search;
  const shippingMethod = params.shipping;
  const shippingMin = params.shipMin ? parseFloat(params.shipMin) : undefined;
  const shippingMax = params.shipMax ? parseFloat(params.shipMax) : undefined;
  const deliveryMin = params.deliveryMin ? parseInt(params.deliveryMin, 10) : undefined;
  const deliveryMax = params.deliveryMax ? parseInt(params.deliveryMax, 10) : undefined;

  // 1. Build Query
  const whereClause: Prisma.ProductWhereInput = {};
  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }
  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }
  if (shippingMethod === "FREE" || shippingMethod === "FAST" || shippingMethod === "SUPER_FAST") {
    const shippingPriceFilter: Prisma.DecimalNullableFilter = {};
    if (shippingMin !== undefined) shippingPriceFilter.gte = shippingMin;
    if (shippingMax !== undefined) shippingPriceFilter.lte = shippingMax;

    if (shippingMethod === "FREE") {
      whereClause.freeShippingEnabled = true;
      if (shippingMin !== undefined || shippingMax !== undefined) {
        whereClause.freeShippingPrice = shippingPriceFilter;
      }
      if (deliveryMin !== undefined) whereClause.freeShippingMaxDeliveryDays = { gte: deliveryMin };
      if (deliveryMax !== undefined) whereClause.freeShippingMinDeliveryDays = { lte: deliveryMax };
    } else if (shippingMethod === "FAST") {
      whereClause.fastShippingEnabled = true;
      if (shippingMin !== undefined || shippingMax !== undefined) {
        whereClause.fastShippingPrice = shippingPriceFilter;
      }
      if (deliveryMin !== undefined) whereClause.fastShippingMaxDeliveryDays = { gte: deliveryMin };
      if (deliveryMax !== undefined) whereClause.fastShippingMinDeliveryDays = { lte: deliveryMax };
    } else {
      whereClause.superFastShippingEnabled = true;
      if (shippingMin !== undefined || shippingMax !== undefined) {
        whereClause.superFastPrice = shippingPriceFilter;
      }
      if (deliveryMin !== undefined) whereClause.superFastMaxDeliveryDays = { gte: deliveryMin };
      if (deliveryMax !== undefined) whereClause.superFastMinDeliveryDays = { lte: deliveryMax };
    }
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = {};
  switch (sort) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    default: orderBy = { createdAt: "desc" };
  }

  // 2. Fetch Data
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: whereClause, orderBy, include: { category: true } }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] text-[#333] font-sans">
      
      <div className="border-b border-[#E8F6F6] py-12 md:py-16 px-4 text-center bg-white/60 backdrop-blur-md">
        <div className="max-w-2xl mx-auto animate-fade-up">
          <h2 className="text-[#1CA7A6] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 font-display">
            {categorySlug ? categorySlug.replace('-', ' ') : "Catalogue"}
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient-brand mb-3 leading-tight drop-shadow-md">
            {searchQuery ? `Results for "${searchQuery}"` : "The Collection"}
          </h1>
          <p className="text-sm md:text-base text-[#6B7280] font-sans">
            Explore curated products with fast filtering and clean discovery.
          </p>
        </div>
      </div>

      <div className="w-full px-2 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 glass-surface p-6 rounded-2xl shadow-lg border border-[#F2994A] animate-pop">
              <div className="flex items-center gap-2 mb-6 text-[#F2994A]">
                <SlidersHorizontal size={18} />
                <h2 className="font-bold text-xs uppercase tracking-widest font-display">Filter By</h2>
              </div>
              <ShopFilters categories={categories} />
            </div>
          </aside>

          <main className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white/80 rounded-2xl border border-dashed border-[#E8F6F6] animate-fade-up">
                <PackageOpen size={40} className="mx-auto mb-3 text-[#6B7280]/60" />
                <p className="text-lg font-bold text-[#333] font-display">No products found</p>
                <Link href="/shop" className="text-[#1CA7A6] font-bold uppercase text-xs tracking-widest mt-4 inline-block hover:underline">Reset Catalogue</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {products.map((product: typeof products[number], idx: number) => (
                  <MotionDiv 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col items-center animate-fade-up"
                  >
                    <Link href={`/product/${product.slug}`} className="group w-full text-center">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#E8F6F6] mb-3 shadow-sm group-hover:shadow-lg transition-all duration-300 border border-[#E8F6F6] group-hover:-translate-y-1">
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {product.isNew && (
                            <span className="bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] px-2 py-1 font-bold uppercase tracking-widest rounded-full shadow-sm font-display">New</span>
                          )}
                          {product.oldPrice && (
                            <span className="bg-[#F2994A] text-white text-[8px] md:text-[10px] px-2 py-1 font-bold uppercase tracking-widest rounded-full shadow-lg font-display">Sale</span>
                          )}
                        </div>

                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover transition duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                              <ShoppingBag size={18} className="text-[#1CA7A6]" />
                           </div>
                        </div>
                      </div>
                      
                      <div className="px-2">
                        <p className="text-[9px] text-[#1CA7A6] font-bold uppercase tracking-widest mb-1 font-display">
                          {product.category?.name || "Premium"}
                        </p>
                        <h3 className="text-base font-bold text-[#333] font-display group-hover:text-[#1CA7A6] transition-colors line-clamp-1 mb-1 tracking-tight">
                          {product.title}
                        </h3>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl md:text-3xl font-bold text-[#F2994A] font-display">
                            {formatMoney(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[15px] text-[#6B7280] line-through font-medium">
                              {formatMoney(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </MotionDiv>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
      
      <div className="py-12 text-center border-t border-[#E8F6F6] mt-12">
        <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest font-display">Silvexiar Curated Boutique</p>
      </div>

    </div>
  );
}
