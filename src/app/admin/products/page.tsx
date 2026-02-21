import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DeleteProductButton from "@/components/DeleteProductButton";
import AdminSearch from "@/components/AdminSearch";
import { formatMoney } from "@/lib/money";
import { 
  Package, 
  Plus, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  LayoutDashboard,
  Box
} from "lucide-react";

interface Props {
  searchParams?: {
    query?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const query = params?.query || "";

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION (Responsive & Modern) */}
        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <Link href="/admin" className="text-slate-400 hover:text-sky-400 text-xs font-black tracking-widest uppercase flex items-center justify-center lg:justify-start gap-2 mb-3 transition-all">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                <Box className="text-sky-500" size={32} />
                Inventory
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                Total Products: <span className="text-white font-bold">{products.length}</span> items managed
              </p>
            </div>

            {/* Actions: Search & Add (Adaptive for Mobile) */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="w-full sm:w-72">
                <AdminSearch />
              </div>
              <Link
                href="/admin/products/new"
                className="w-full sm:w-auto bg-sky-500 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-sky-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                ADD PRODUCT
              </Link>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {products.length === 0 ? (
            <div className="py-32 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">No products found</h3>
              <p className="text-slate-400 mt-2 font-medium">Try searching for something else or add a product.</p>
              {query && (
                <Link href="/admin/products" className="mt-4 inline-block text-sky-600 font-bold hover:underline">Clear search</Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-10 py-6">Product</th>
                    <th className="px-6 py-6 hidden md:table-cell">Category</th>
                    <th className="px-6 py-6">Price</th>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((product) => (
                    <tr key={product.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      
                      {/* Product Main Info */}
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full"><Package size={20} className="text-slate-300" /></div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 truncate max-w-[120px] sm:max-w-[200px]">{product.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate uppercase tracking-tighter">ID: {product.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category (Hidden on very small screens) */}
                      <td className="px-6 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl w-fit border border-slate-200">
                          <Layers size={12} className="text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {product.category?.name || "No Category"}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-0.5 text-slate-900 font-black">
                          <span className="text-base">{formatMoney(product.price)}</span>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${
                          product.inStock 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {product.inStock ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {product.inStock ? "In Stock" : "Sold Out"}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="bg-white border-2 border-slate-100 text-slate-900 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-lg transition-all"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </Link>
                          
                          <div className="scale-90 opacity-40 hover:opacity-100 transition-opacity">
                             <DeleteProductButton id={product.id} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Brand */}
        <div className="text-center pb-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Silvexiar Inventory System</p>
        </div>
        
      </div>
    </div>
  );
}
