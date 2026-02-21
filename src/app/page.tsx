// page.tsx - Silvexiar Homepage Redesign
// Design System: #1CA7A6 (teal) + #F2994A (orange) on #F8F9FA base
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/money";
import HeroSlider from "@/components/HeroSlider";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Headphones,
  Heart,
  Clock,
  Award,
  Repeat,
  ChevronRight,
  Quote,
  Sparkles,
  Package,
  Zap,
} from "lucide-react";

type ProductItem = Awaited<
  ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>
>[number];
type CategoryItem = Awaited<ReturnType<typeof prisma.category.findMany>>[number];

/* ═══════════════════════════════════════════════════════
   FEATURES SECTION — #F8F9FA background (50% rule)
   ═══════════════════════════════════════════════════════ */
function FeaturesSection() {
  const features = [
    {
      icon: <Truck size={24} />,
      label: "Free Shipping",
      desc: "On all orders over $50",
      color: "primary" as const,
    },
    {
      icon: <Repeat size={24} />,
      label: "Easy Returns",
      desc: "30-day hassle-free policy",
      color: "accent" as const,
    },
    {
      icon: <Shield size={24} />,
      label: "Secure Payment",
      desc: "100% protected checkout",
      color: "primary" as const,
    },
    {
      icon: <Headphones size={24} />,
      label: "24/7 Support",
      desc: "We're always here to help",
      color: "accent" as const,
    },
  ];

  return (
    <section className="bg-[#F8F9FA] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 group"
              data-reveal
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${
                  f.color === "primary"
                    ? "bg-[rgba(28,167,166,0.10)] text-[#1CA7A6]"
                    : "bg-[rgba(242,153,74,0.10)] text-[#F2994A]"
                }`}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-[#333333] text-sm mb-1">
                {f.label}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CURATED COLLECTION — White background
   ═══════════════════════════════════════════════════════ */
function CuratedCollection({ products }: { products: ProductItem[] }) {
  const featured = products.slice(0, 4);

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(28,167,166,0.10)] text-[#1CA7A6] font-semibold text-xs uppercase tracking-wider mb-4">
            Curated For You
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1CA7A6] mb-3">
            Featured Collection
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto text-sm">
            Thoughtfully selected pieces that combine quality with contemporary
            design.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {featured.map((product: ProductItem) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group"
              data-reveal
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[rgba(0,0,0,0.06)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-[#F8F9FA] flex items-center justify-center">
                    <Package size={40} className="text-[#1CA7A6] opacity-30" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#333333] text-sm line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {product.category?.name}
                  </p>
                </div>
                <span className="font-bold text-[#1CA7A6] text-sm">
                  {formatMoney(product.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[#1CA7A6] font-semibold text-sm border-b-2 border-[#1CA7A6] pb-0.5 hover:gap-3 transition-all duration-200"
          >
            View Full Collection <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CATEGORY SHOWCASE — #F8F9FA background (50% rule)
   ═══════════════════════════════════════════════════════ */
function CategoryShowcase({ categories }: { categories: CategoryItem[] }) {
  return (
    <section className="bg-[#F8F9FA] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
          data-reveal
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(242,153,74,0.10)] text-[#F2994A] font-semibold text-xs uppercase tracking-wider mb-4">
              Shop By Category
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1CA7A6]">
              Browse Categories
            </h2>
          </div>
          <p className="text-[#6B7280] max-w-md text-sm">
            Explore our carefully curated categories, each designed to match
            your unique style.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.slice(0, 4).map((category: CategoryItem, index: number) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)]"
              data-reveal
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-[#1CA7A6] to-[#178E8D]" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0C4A4A]/80 via-[#0C4A4A]/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-[#F2994A] transition-colors duration-200">
                  Shop Now{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCT GRID — White background
   ═══════════════════════════════════════════════════════ */
function ProductGrid({
  products,
  title,
}: {
  products: ProductItem[];
  title: string;
}) {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-14" data-reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1CA7A6] mb-3">
            {title}
          </h2>
          <div className="w-16 h-1 bg-[#F2994A] mx-auto rounded-full" />
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 gap-y-8">
          {products.slice(0, 8).map((product: ProductItem) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group"
              data-reveal
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F9FA] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-[#F8F9FA] flex items-center justify-center">
                    <Package size={32} className="text-[#1CA7A6] opacity-30" />
                  </div>
                )}

                {/* Sale Badge */}
                {product.oldPrice && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#F2994A] text-white text-[10px] font-bold shadow-sm">
                    -
                    {Math.round(
                      (1 - Number(product.price) / Number(product.oldPrice)) * 100
                    )}
                    %
                  </span>
                )}

                {/* Wishlist */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#6B7280] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-[#F2994A] hover:bg-white shadow-sm">
                  <Heart size={14} />
                </button>
              </div>

              <div className="mt-3.5 space-y-1">
                <h3 className="font-semibold text-[#333333] text-sm line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {product.category?.name}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-bold text-[#1CA7A6]">
                    {formatMoney(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-xs text-[#6B7280] line-through">
                      {formatMoney(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More CTA */}
        <div className="text-center mt-14">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 bg-[#1CA7A6] text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#178E8D] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(28,167,166,0.2)] transition-all duration-200 group"
          >
            View All Products{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS SECTION — #F8F9FA background (50% rule)
   ═══════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Verified Buyer",
      text: "Absolutely love the quality! The shipping was fast and the product exceeded my expectations. Will definitely order again.",
      rating: 5,
      avatar: "SM",
    },
    {
      name: "James K.",
      role: "Repeat Customer",
      text: "Best online shopping experience I've had. The customer service team was incredibly helpful and responsive.",
      rating: 5,
      avatar: "JK",
    },
    {
      name: "Emily R.",
      role: "Verified Buyer",
      text: "The attention to detail is remarkable. Every product I've ordered has been exactly as described. Highly recommend!",
      rating: 5,
      avatar: "ER",
    },
  ];

  return (
    <section className="bg-[#F8F9FA] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(242,153,74,0.10)] text-[#F2994A] font-semibold text-xs uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1CA7A6] mb-3">
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto text-sm">
            Real reviews from real customers who trust Silvexiar.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
              data-reveal
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-[10px] bg-[rgba(28,167,166,0.10)] flex items-center justify-center mb-5">
                <Quote size={18} className="text-[#1CA7A6]" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-[#F2994A] fill-[#F2994A]"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-[#444444] text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <div className="w-10 h-10 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA SECTION — White background
   ═══════════════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="relative bg-[#F8F9FA] rounded-[20px] p-10 md:p-16 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] overflow-hidden"
          data-reveal
        >
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[rgba(28,167,166,0.06)] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[rgba(242,153,74,0.06)] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-[14px] bg-[rgba(242,153,74,0.10)] flex items-center justify-center mx-auto mb-6">
              <Sparkles size={28} className="text-[#F2994A]" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-[#1CA7A6] mb-4">
              Ready to Discover More?
            </h2>
            <p className="text-[#6B7280] mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Join thousands of happy customers and explore our full collection
              of premium products.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#F2994A] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(242,153,74,0.25)] hover:bg-[#E0872F] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(242,153,74,0.3)] transition-all duration-200"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1CA7A6] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(28,167,166,0.2)] hover:bg-[#178E8D] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(28,167,166,0.25)] transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   Background distribution:
   - Hero: full-bleed image (not counted)
   - Features: #F8F9FA ✓
   - Curated: white
   - Categories: #F8F9FA ✓
   - Best Sellers: white
   - Testimonials: #F8F9FA ✓
   - CTA: white (inner card is #F8F9FA)
   - Newsletter: #F8F9FA ✓
   → ~50% of page area uses #F8F9FA
   ═══════════════════════════════════════════════════════ */
export default async function Home() {
  const products = await prisma.product.findMany({
    take: 16,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const categories = await prisma.category.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <HeroSlider />
      <FeaturesSection />
      <CuratedCollection products={products} />
      <CategoryShowcase categories={categories} />
      <ProductGrid products={products} title="Best Sellers" />
      <TestimonialsSection />
      <CTASection />

    </div>
  );
}
