"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

const LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Complaints", href: "/admin/complaints", icon: AlertTriangle },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-72 bg-slate-900 border-r border-slate-800 z-[90]
        transition-all duration-500 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 flex flex-col
      `}
      >
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/30">
              S
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter">SILVEXIAR</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  <span className="text-sm font-bold">{link.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs hover:bg-white hover:text-slate-900 transition-all"
          >
            <LogOut size={16} /> EXIT TO STORE
          </Link>
        </div>
      </aside>
    </>
  );
}