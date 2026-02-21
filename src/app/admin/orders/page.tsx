import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteOrderButton from "@/components/DeleteOrderButton";
import { formatMoney } from "@/lib/money";
import { 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PackageCheck,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Hash
} from "lucide-react";

interface Props {
  searchParams?: {
    page?: string;
  };
}

// 1. Helper للتحكم في ألوان وأيقونات الـ Status
const getStatusDetails = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return { color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: <CheckCircle2 size={14} /> };
    case 'SHIPPED':
      return { color: "text-violet-700 bg-violet-50 border-violet-100", icon: <Truck size={14} /> };
    case 'PROCESSING':
      return { color: "text-blue-700 bg-blue-50 border-blue-100", icon: <PackageCheck size={14} /> };
    case 'CANCELLED':
      return { color: "text-rose-700 bg-rose-50 border-rose-100", icon: <XCircle size={14} /> };
    default: // PENDING
      return { color: "text-slate-600 bg-slate-50 border-slate-200", icon: <Clock size={14} /> };
  }
};

const getPaymentDetails = (status: string) => {
  if (status === 'PAID') {
    return { color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: <CreditCard size={14} /> };
  }
  return { color: "text-amber-700 bg-amber-50 border-amber-100", icon: <Clock size={14} /> };
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      take: pageSize,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.ceil(totalOrders / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Link href="/admin" className="text-slate-400 hover:text-sky-400 text-xs font-black tracking-widest uppercase flex items-center gap-2 mb-3 transition-all">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <h1 className="text-4xl font-black tracking-tight">Orders Management</h1>
              <p className="text-slate-400 mt-2 flex items-center gap-2 font-medium">
                <ShoppingBag size={16} /> Total: <span className="text-white">{totalOrders}</span> transactions
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-slate-300 text-sm px-3 font-bold">Page {currentPage} / {totalPages}</span>
              <div className="flex gap-1">
                {hasPrevPage ? (
                  <Link href={`/admin/orders?page=${currentPage - 1}`} className="p-2.5 bg-white/10 text-white hover:bg-sky-500 rounded-xl transition-all">
                    <ChevronRight size={20} className="rotate-180" />
                  </Link>
                ) : (
                  <button disabled className="p-2.5 text-slate-600 cursor-not-allowed"><ChevronRight size={20} className="rotate-180" /></button>
                )}
                {hasNextPage ? (
                  <Link href={`/admin/orders?page=${currentPage + 1}`} className="p-2.5 bg-white/10 text-white hover:bg-sky-500 rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </Link>
                ) : (
                  <button disabled className="p-2.5 text-slate-600 cursor-not-allowed"><ChevronRight size={20} /></button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-32 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShoppingBag size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">No orders yet</h3>
              <p className="text-slate-400 mt-2 font-medium">Waiting for your first customer...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-10 py-6">Order Info</th>
                    <th className="px-6 py-6">Customer</th>
                    <th className="px-6 py-6">Amount</th>
                    <th className="px-6 py-6">Payment</th>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => {
                    const status = getStatusDetails(order.status);
                    const payment = getPaymentDetails(order.paymentStatus);

                    return (
                      <tr key={order.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                        
                        {/* Order ID & Date */}
                        <td className="px-10 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-slate-900 font-black text-sm">
                              <Hash size={12} className="text-slate-300" />
                              <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                              <Calendar size={11} />
                              {new Date(order.createdAt).toLocaleDateString("en-GB")}
                            </div>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                              {order.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">{order.user.fullName}</span>
                              <span className="text-xs text-slate-400 font-medium">{order.user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-base font-black text-slate-900">{formatMoney(order.totalAmount)}</span>
                            <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wide">{order._count.items} Items</span>
                          </div>
                        </td>

                        {/* Payment Badge */}
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${payment.color}`}>
                            {payment.icon}
                            {order.paymentStatus}
                          </div>
                        </td>

                        {/* Shipping Status Badge */}
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${status.color}`}>
                            {status.icon}
                            {order.status}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end items-center gap-3">
                            <Link 
                              href={`/admin/orders/${order.id}`} 
                              className="bg-white border-2 border-slate-100 text-slate-900 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-lg transition-all flex items-center gap-2"
                            >
                              Manage
                              <ChevronRight size={14} />
                            </Link>
                            
                            <div className="scale-90 opacity-40 hover:opacity-100 transition-opacity">
                              <DeleteOrderButton id={order.id} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="text-center pb-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Silvexiar Control Panel</p>
        </div>

      </div>
    </div>
  );
}
