import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteCustomerButton from "@/components/DeleteCustomerButton";
import AdminSearch from "@/components/AdminSearch";
import { Users, UserCheck, ShieldCheck, ShoppingCart, Calendar, Mail, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams?: { query?: string };
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const query = params?.query || "";

  // 1. Fetch Users with Search
  const customers = await prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } }
    }
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <Link href="/admin" className="text-slate-400 hover:text-sky-400 text-xs font-black tracking-widest uppercase flex items-center justify-center lg:justify-start gap-2 mb-3 transition-all">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                <Users className="text-sky-500" size={32} />
                User Base
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                Total registered: <span className="text-white font-bold">{customers.length}</span> members
              </p>
            </div>

            {/* Search Tool */}
            <div className="w-full lg:w-96">
              <AdminSearch />
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {customers.length === 0 ? (
            <div className="py-32 text-center text-slate-500">
              <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold">No users found</p>
              {query && <Link href="/admin/customers" className="text-sky-600 underline">Clear search</Link>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-10 py-6">User Info</th>
                    <th className="px-6 py-6">Role</th>
                    <th className="px-6 py-6 text-center">Orders</th>
                    <th className="px-6 py-6">Joined Date</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      
                      {/* Name & Email */}
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{user.fullName}</span>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                              <Mail size={12} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                          user.role === 'ADMIN' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                            : 'bg-sky-50 text-sky-700 border-sky-100'
                        }`}>
                          {user.role === 'ADMIN' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                          {user.role}
                        </span>
                      </td>

                      {/* Order Count */}
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-black text-slate-900">{user._count.orders}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Purchases</span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(user.createdAt).toLocaleDateString("en-GB")}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-10 py-6 text-right">
                        {/* Only show delete if user is not an Admin (Security) */}
                        {user.role !== 'ADMIN' ? (
                          <div className="flex justify-end opacity-40 hover:opacity-100 transition-opacity">
                            <DeleteCustomerButton id={user.id} name={user.fullName} />
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-not-allowed">Staff</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center pb-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Silvexiar Customer Directory</p>
        </div>

      </div>
    </div>
  );
}