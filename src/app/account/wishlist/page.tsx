import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowLeft } from "lucide-react";
import { formatMoney } from "@/lib/money";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId as string },
    include: { product: { include: { category: true } } },
    orderBy: { id: "desc" },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] py-10 px-3 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/account" className="inline-flex items-center gap-2 text-[#1CA7A6] font-bold uppercase tracking-widest text-xs mb-6 hover:text-[#F2994A] transition-colors">
          <ArrowLeft size={16} /> Back to Account
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <Heart className="text-[#F2994A] animate-float" size={22} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient-brand leading-tight drop-shadow-md">My Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="card-elevated p-12 rounded-2xl text-center">
            <p className="text-xl text-[#6B7280] font-display font-bold">Your wishlist is empty.</p>
            <Link href="/shop" className="mt-4 inline-block bg-[#1CA7A6] text-white font-bold uppercase text-xs tracking-widest px-6 py-3 rounded-full shadow-lg hover:bg-[#F2994A] transition-colors">Explore products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((item) => (
              <Link key={item.id} href={`/product/${item.product.slug}`} className="group card-elevated rounded-xl p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#E8F6F6] mb-2">
                  <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2994A] font-display">{item.product.category?.name || "Premium"}</p>
                <h2 className="font-bold text-[#333] font-display line-clamp-1">{item.product.title}</h2>
                <p className="font-display text-base font-bold mt-1 text-[#1CA7A6]">{formatMoney(item.product.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
