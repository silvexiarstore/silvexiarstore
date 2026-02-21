import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  LayoutDashboard,
  Box,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboard() {
  // 1. Security Check
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user || user.role !== "ADMIN") redirect("/");

  // 2. Fetch Data (KPIs)
  const [totalRevenue, totalOrders, pendingOrders, stockCount, customersCount, categoriesCount] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { inStock: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.category.count(), // باش يبان شحال من قسم كاين فـ Settings
  ]);

  const today = new Date().toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- SECTION 1: WELCOME HEADER --- */}
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
                <LayoutDashboard size={14} />
                Admin Terminal
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                Welcome back, <span className="bg-gradient-to-r from-sky-400 to-white bg-clip-text text-transparent">{user.fullName.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                <Clock size={16} /> {today}
              </p>
            </div>
            <Link 
              href="/" 
              className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-sky-400 hover:text-white transition-all duration-300 shadow-xl flex items-center gap-2"
            >
              VISIT STORE
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* --- SECTION 2: SMART STATS (KPIs) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* REVENUE CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Success</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {formatMoney(totalRevenue._sum.totalAmount || 0)}
            </h3>
          </div>

          {/* ORDERS CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                <ShoppingCart size={24} />
              </div>
              <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase">{pendingOrders} Pending</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalOrders}</h3>
          </div>

          {/* STOCK CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
                <Package size={24} />
              </div>
              <span className="text-[10px] font-black text-violet-500 bg-violet-50 px-2 py-1 rounded-lg uppercase">Live</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">In Stock Items</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stockCount}</h3>
          </div>

          {/* CUSTOMERS CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">Users</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Customers</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{customersCount}</h3>
          </div>
        </div>

        {/* --- SECTION 3: MANAGEMENT NAVIGATION --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 ml-4">
            <div className="w-2 h-6 bg-sky-500 rounded-full"></div>
            Management Hub
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* 1. Orders Management */}
            <Link href="/admin/orders" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-sky-500 hover:ring-4 hover:ring-sky-50 transition-all duration-300">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <ShoppingCart size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Orders</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Manage transactions, shipping labels, and status updates.</p>
              <div className="mt-6 flex items-center text-sky-600 font-black text-xs uppercase tracking-widest">
                Go to manager <ArrowUpRight size={14} className="ml-1" />
              </div>
            </Link>

            {/* 2. Products Management */}
            <Link href="/admin/products" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-violet-500 hover:ring-4 hover:ring-violet-50 transition-all duration-300">
              <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all">
                <Box size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Inventory</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Control your stock, edit products and dynamic variants.</p>
              <div className="mt-6 flex items-center text-violet-600 font-black text-xs uppercase tracking-widest">
                Update stock <ArrowUpRight size={14} className="ml-1" />
              </div>
            </Link>

            {/* 3. Customers Management */}
            <Link href="/admin/customers" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Customers</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Analyze user base, history and account permissions.</p>
              <div className="mt-6 flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest">
                View Database <ArrowUpRight size={14} className="ml-1" />
              </div>
            </Link>

            {/* 4. Settings (Categories) Management */}
            <Link href="/admin/settings" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-emerald-500 hover:ring-4 hover:ring-emerald-50 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Settings size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Settings</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Manage categories ({categoriesCount}), site config and global rules.</p>
              <div className="mt-6 flex items-center text-emerald-600 font-black text-xs uppercase tracking-widest">
                Configure Site <ArrowUpRight size={14} className="ml-1" />
              </div>
            </Link>

            {/* 5. Complaints Management */}
            <Link href="/admin/complaints" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-rose-500 hover:ring-4 hover:ring-rose-50 transition-all duration-300">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Complaints</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Track return issues, customer claims, and support replies.</p>
              <div className="mt-6 flex items-center text-rose-600 font-black text-xs uppercase tracking-widest">
                Open register <ArrowUpRight size={14} className="ml-1" />
              </div>
            </Link>

          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center py-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">Silvexiar Control</p>
        </div>

      </div>
    </div>
  );
}
