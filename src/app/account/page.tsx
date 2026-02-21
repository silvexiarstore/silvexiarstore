
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Settings, LogOut, Sparkles, ChevronRight, Heart } from "lucide-react";


export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { _count: { select: { orders: true } } }
  });
  if (!user) redirect("/login");

  const menuItems = [
    { name: "My Orders", href: "/account/orders", icon: <Package size={28} />, desc: "Track your acquisitions" },
    { name: "My Wishlist", href: "/account/wishlist", icon: <Heart size={28} />, desc: "Saved favorites" },
    { name: "My Addresses", href: "/account/addresses", icon: <MapPin size={28} />, desc: "Shipping destinations" },
    { name: "Settings", href: "/account/settings", icon: <Settings size={28} />, desc: "Personalize profile" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] pb-24 pt-8 font-sans">
      <div className="max-w-2xl mx-auto px-3 sm:px-6">
        {/* Welcome Header */}
        <header className="mb-10 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-[#F2994A] animate-float" size={22} />
            <span className="text-[#1CA7A6] text-xs font-bold uppercase tracking-[0.3em] font-display">Silvexiar Member</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-gradient-brand leading-tight drop-shadow-md">
            Hello, <span className="text-[#333]">{user.fullName.split(' ')[0]}</span>
          </h1>
        </header>

        {/* Stats Card */}
        <div className="mb-10">
          <div className="relative card-elevated p-8 rounded-3xl flex flex-col items-center text-center overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#1CA7A6]/10 rounded-full blur-2xl" />
            <p className="text-[#1CA7A6] text-xs font-bold uppercase tracking-widest mb-2 font-display">Total Orders</p>
            <h3 className="text-5xl sm:text-6xl font-display font-extrabold text-[#1CA7A6] drop-shadow-lg">{user._count.orders}</h3>
          </div>
        </div>

        {/* Navigation Cards */}
        <nav className="grid grid-cols-1 gap-5">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group card-elevated p-6 rounded-2xl flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E8F6F6] rounded-xl text-[#1CA7A6] group-hover:bg-[#1CA7A6] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-display font-bold text-[#333] group-hover:text-[#1CA7A6] transition-colors">{item.name}</h4>
                  <p className="text-xs text-[#6B7280] font-medium uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-[#B0BEC5] group-hover:text-[#F2994A] transition-colors" size={28} />
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <form action="/api/auth/logout" method="POST" className="mt-10">
          <button className="w-full py-5 rounded-full border-2 border-[#F2994A]/30 text-[#F2994A] font-bold uppercase tracking-widest text-sm hover:bg-[#F2994A]/10 hover:text-[#1CA7A6] transition-all flex items-center justify-center gap-2 animate-sheen">
            <LogOut size={18} /> Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
