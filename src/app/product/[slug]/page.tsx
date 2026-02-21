
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShieldCheck, Globe, Star, Package, Truck, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import WishlistButton from "@/components/WishlistButton";
import ReviewForm from "@/components/ReviewForm";
import ProductActions from "@/components/ProductActions";
import ProductImageGallery from "@/components/ProductImageGallery";

type ContentSection = {
  id: string;
  type: "text" | "image";
  text: string;
  style: "normal" | "bold" | "italic";
  image: string;
  caption: string;
};

function extractContentSections(specifications: unknown): ContentSection[] {
  if (!specifications || typeof specifications !== "object") return [];
  if (!("contentSections" in specifications)) return [];

  const value = specifications as { contentSections?: unknown };
  if (!Array.isArray(value.contentSections)) return [];

  return value.contentSections
    .filter((item): item is ContentSection => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: String(item.id || ""),
      type: (item.type === "image" ? "image" : "text") as "image" | "text",
      text: String(item.text || ""),
      style: (item.style === "bold" || item.style === "italic" ? item.style : "normal") as "normal" | "bold" | "italic",
      image: String(item.image || ""),
      caption: String(item.caption || ""),
    }))
    .filter((item) => (item.type === "text" ? item.text.trim() : item.image.trim()));
}

function textStyleClass(style: ContentSection["style"]) {
  if (style === "bold") return "font-bold";
  if (style === "italic") return "italic";
  return "font-medium";
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const session = await getSession();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc: number, rev: typeof product.reviews[number]) => acc + rev.rating, 0) / product.reviews.length
      : 0;

  const contentSections = extractContentSections(product.specifications);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8]">
      {/* Breadcrumb */}
      <nav className="py-6 px-6 max-w-7xl mx-auto border-b border-[#E8F6F6]">
        <div className="flex items-center gap-3 text-sm font-bold text-[#6B7280]">
          <Link href="/" className="hover:text-[#1CA7A6] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1CA7A6] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#1CA7A6]">{product.category?.name || "Collection"}</span>
        </div>
      </nav>

      <div className="w-full max-w-none px-3 sm:px-6 py-12">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Image Gallery */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E8F6F6] bg-white">
              <div className="absolute top-6 right-6 z-20">
                <WishlistButton productId={product.id} />
              </div>
              <ProductImageGallery images={product.images} title={product.title} />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-600">
              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="text-[#F2994A]"
                      fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#6B7280]">
                  {avgRating.toFixed(1)} • {product.reviews.length} reviews
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-gradient-brand leading-tight drop-shadow-md">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4 pb-6 border-b-2 border-[#E8F6F6]">
                <span className="text-5xl font-extrabold text-[#1CA7A6] font-display">
                  {formatMoney(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-2xl text-[#6B7280] line-through font-display">
                    {formatMoney(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#E8F6F6] shadow-lg">
                <p className="text-lg text-[#444444] leading-relaxed whitespace-pre-line wrap-break-word font-medium font-sans">
                  {product.description}
                </p>
              </div>



              {/* Product Actions */}
              <ProductActions product={JSON.parse(JSON.stringify(product))} />

              {/* Payment Methods (below Add to Bag) */}
              {(() => {
                const PAYMENT_METHODS = [
                  {
                    name: "PayPal",
                    src: "https://cdn.webfastcdn.com/image/payment/Paypal.svg",
                  },
                  {
                    name: "American Express",
                    src: "https://cdn.webfastcdn.com/image/payment/American_Express.svg",
                  },
                  {
                    name: "Visa",
                    src: "https://cdn.webfastcdn.com/image/payment/Visa.svg",
                  },
                  {
                    name: "Discover",
                    src: "https://cdn.webfastcdn.com/image/payment/Discover.svg",
                  },
                  {
                    name: "Mastercard",
                    src: "https://cdn.webfastcdn.com/image/payment/Mastercard.svg",
                  },
                  {
                    name: "Diners Club",
                    src: "https://cdn.webfastcdn.com/image/payment/Diners_Club.svg",
                  },
                  {
                    name: "Klarna",
                    src: "https://cdn.webfastcdn.com/image/payment/Klarna.svg",
                  },
                ];
                return (
                  <div className="flex items-center gap-3 flex-wrap justify-center mt-6 mb-2">
                    {PAYMENT_METHODS.map((payment) => (
                      <img
                        key={payment.name}
                        src={payment.src}
                        alt={payment.name}
                        width={40}
                        height={28}
                        className="w-15 h-10 object-contain rounded-sm p-0.5 bg-white/90 hover:scale-110 transition-transform duration-200"
                      />
                    ))}
                  </div>
                );
              })()}

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#E8F6F6] shadow-md hover:shadow-lg transition-all">
                  <Truck className="text-[#1CA7A6]" size={24} />
                  <span className="text-xs font-bold text-center text-[#333333] font-display">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#E8F6F6] shadow-md hover:shadow-lg transition-all">
                  <ShieldCheck className="text-[#F2994A]" size={24} />
                  <span className="text-xs font-bold text-center text-[#333333] font-display">Secure Quality</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#E8F6F6] shadow-md hover:shadow-lg transition-all">
                  <Award className="text-[#1CA7A6]" size={24} />
                  <span className="text-xs font-bold text-center text-[#333333] font-display">Trusted Brand</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        {contentSections.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-600">
              <span className="inline-block px-4 py-2 rounded-full bg-[#E8F6F6] text-[#1CA7A6] font-bold text-xs uppercase tracking-wider mb-4 animate-in fade-in zoom-in-95 duration-600 font-display">
                Product Details
              </span>
              <h2 className="text-4xl font-bold text-gradient-brand mb-2 font-display">More Information</h2>
              <p className="text-[#6B7280] font-sans">Everything you need to know about this product</p>
            </div>

            <div className="space-y-6">
              {contentSections.map((section, idx) => (
                <div
                  key={section.id}
                  className="rounded-2xl bg-white border-2 border-[#E8F6F6] shadow-lg hover:shadow-xl transition-all p-8 animate-in fade-in slide-in-from-bottom-4 duration-600"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {section.type === "text" ? (
                    <p className={`text-lg text-[#444444] leading-relaxed whitespace-pre-line wrap-break-word font-sans ${textStyleClass(section.style)}`}>
                      {section.text}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full min-h-80 md:min-h-120 bg-white rounded-2xl overflow-hidden border-2 border-[#E8F6F6] shadow-lg">
                        <Image
                          src={section.image}
                          alt={section.caption || product.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      {section.caption && (
                        <p className="text-sm text-[#6B7280] text-center italic font-sans">{section.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="border-t-2 border-[#E8F6F6] pt-20">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-600">
            <span className="inline-block px-4 py-2 rounded-full bg-[#FEF3E8] text-[#F2994A] font-bold text-xs uppercase tracking-wider mb-4 animate-in fade-in zoom-in-95 duration-600 font-display">
              Customer Feedback
            </span>
            <h2 className="text-4xl font-bold text-gradient-brand font-display">What Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Rating Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-[#E8F6F6] text-center animate-in fade-in zoom-in-95 duration-600">
                <p className="text-6xl font-extrabold text-[#1CA7A6] mb-4 font-display">
                  {avgRating.toFixed(1)}
                </p>
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className="text-[#F2994A]"
                      fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wider font-display">
                  Based on {product.reviews.length} verified reviews
                </p>
              </div>

              {session ? (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-100">
                  <ReviewForm productId={product.id} />
                </div>
              ) : (
                <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-[#E8F6F6] shadow-lg text-center">
                  <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wider mb-4 font-display">
                    Login to write a review
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-2 bg-[#1CA7A6] text-white rounded-lg font-bold text-sm hover:bg-[#178E8D] transition-colors font-display"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-8">
              {product.reviews.length === 0 ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-[#E8F6F6] rounded-2xl p-16 text-center">
                  <div>
                    <Package size={48} className="text-[#6B7280] mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-[#6B7280] font-display">No reviews yet</p>
                    <p className="text-sm text-[#999999] font-sans">Be the first to review this product</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map((rev: typeof product.reviews[number], idx: number) => (
                    <div
                      key={rev.id}
                      className="bg-white p-7 rounded-2xl shadow-lg border-2 border-[#E8F6F6] hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-600"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-[#333333] uppercase text-sm mb-2 font-display">
                            {rev.user.fullName}
                          </p>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className="text-[#F2994A]"
                                fill={i < rev.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#6B7280] uppercase font-display">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#444444] leading-relaxed whitespace-pre-line wrap-break-word font-sans">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
