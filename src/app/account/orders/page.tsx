import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CreditCard, CheckCircle2, Timer, Zap, Gift, Rocket } from "lucide-react";
import { formatMoney } from "@/lib/money";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId as string },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  // تحديد ستايل حالة الطلبية
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { color: 'text-green-500', bg: 'bg-green-500/10', icon: <CheckCircle2 size={24} />, label: 'DELIVERED' };
      case 'SHIPPED': return { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Truck size={24} />, label: 'IN TRANSIT' };
      default: return { color: 'text-amber-600', bg: 'bg-amber-600/10', icon: <Timer size={24} />, label: 'PROCESSING' };
    }
  };

  // تحديد ستايل نوع الشحن (Shipping Method)
  const getShippingStyle = (order: any) => {
    const shippingMethod = order.shippingMethod || "FREE";

    switch (shippingMethod) {
      case "SUPER_FAST":
        return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Rocket size={24} />, label: 'SUPER EXPRESS' };
      case "FAST":
        return { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Zap size={24} />, label: 'PRIORITY EXPRESS' };
      case "FREE":
      default:
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <Gift size={24} />, label: 'FREE SHIPPING' };
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] py-10 pb-32 font-sans">
      <div className="max-w-2xl mx-auto px-3 sm:px-6">
        {/* Back Link */}
        <Link href="/account" className="flex items-center gap-2 text-[#1CA7A6] font-bold uppercase tracking-widest text-xs mb-8 hover:text-[#F2994A] transition-colors">
          <ArrowLeft size={18} /> Back to Account
        </Link>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-gradient-brand mb-12 leading-tight drop-shadow-md">My Orders</h1>

        {orders.length === 0 ? (
          <div className="card-elevated p-16 rounded-3xl text-center">
             <p className="text-2xl text-[#6B7280] font-display font-bold mb-8">No orders yet.</p>
             <Link href="/shop" className="bg-[#1CA7A6] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-[#F2994A] transition-colors">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => {
              const status = getStatusDetails(order.status);
              const ship = getShippingStyle(order);

              return (
                <div key={order.id} className="card-elevated rounded-3xl overflow-hidden group">
                  
                  {/* --- TOP HEADER: BIG STATUS CARDS --- */}
                  <div className="p-6 bg-[#E8F6F6]/60 border-b border-[#E8F6F6]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* 1. Logistic Status */}
                      <div className={`flex flex-col justify-center gap-2 p-4 rounded-xl ${status.bg} border border-[#E8F6F6] shadow-sm`}>
                        <div className={status.color}>{status.icon}</div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 font-display">Status</p>
                          <p className={`text-base font-bold ${status.color} font-display`}>{status.label}</p>
                        </div>
                      </div>

                      {/* 2. Payment Status */}
                      <div className={`flex flex-col justify-center gap-2 p-4 rounded-xl ${order.paymentStatus === 'PAID' ? 'bg-black' : 'bg-amber-100'} border border-[#E8F6F6] shadow-sm`}>
                        <CreditCard size={22} className={order.paymentStatus === 'PAID' ? 'text-[#F2994A]' : 'text-amber-800'} />
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 font-display ${order.paymentStatus === 'PAID' ? 'text-[#E8F6F6]' : 'text-amber-800/60'}`}>Finance</p>
                          <p className={`text-base font-bold font-display ${order.paymentStatus === 'PAID' ? 'text-white' : 'text-amber-900'}`}>{order.paymentStatus}</p>
                        </div>
                      </div>

                      {/* 3. Shipping Method (NEW) */}
                      <div className={`flex flex-col justify-center gap-2 p-4 rounded-xl ${ship.bg} border border-[#E8F6F6] shadow-sm`}>
                        <div className={ship.color}>{ship.icon}</div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 font-display">Method</p>
                          <p className={`text-base font-bold font-display ${ship.color}`}>{ship.label}</p>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-1">
                            {Number(order.shippingCost || 0) > 0 ? `+${formatMoney(order.shippingCost)}` : "No extra cost"}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* --- MIDDLE: ITEMS LIST --- */}
                  <div className="p-7">
                      <div className="flex flex-col sm:flex-row justify-between items-end border-b border-[#E8F6F6] pb-6 mb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-display">Reference</p>
                          <p className="text-base font-bold text-[#333] font-display">#{order.id.slice(0, 12).toUpperCase()}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-display">Date</p>
                          <p className="text-base font-bold text-[#333] font-display">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                    <div className="space-y-7">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-5 items-center">
                          <div className="relative h-24 w-20 rounded-xl overflow-hidden bg-[#E8F6F6] border border-[#F2994A]/20 shrink-0">
                            <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-[#333] font-display mb-1">{item.product.title}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#1CA7A6] uppercase tracking-widest bg-[#E8F6F6] px-2 py-1 rounded-full">Qty: {item.quantity}</span>
                              <span className="text-base font-bold text-[#F2994A] font-display">{formatMoney(item.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* --- BOTTOM: TOTAL --- */}
                  <div className="px-7 py-7 bg-[#E8F6F6]/40 border-t border-[#E8F6F6] flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 text-[#1CA7A6] font-bold uppercase tracking-widest text-xs">
                      <Package size={16} /> Premium Logistics
                    </div>
                    <div className="text-right mt-3 sm:mt-0">
                       <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 font-display">Total</p>
                       <p className="text-3xl font-bold text-[#F2994A] font-display">{formatMoney(order.totalAmount)}</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
