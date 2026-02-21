import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star, User, MessageSquare, Package } from "lucide-react";
import Image from "next/image";
import DeleteReviewButton from "@/components/DeleteReviewButton";

export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  if (currentUser?.role !== "ADMIN") redirect("/");

  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      product: { select: { title: true, images: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-600/20">
            <MessageSquare size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reviews Manager</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Control customer feedback</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">No reviews found in the records.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  {rev.product.images[0] ? (
                    <Image src={rev.product.images[0]} alt={rev.product.title} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Package size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-2">
                      <Package size={10} /> {rev.product.title}
                    </span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-900 font-bold text-lg leading-tight">"{rev.comment || "No comment provided."}"</p>

                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {rev.user.fullName} ({rev.user.email})
                    </span>
                    <span className="text-[10px] opacity-50 ml-2">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <DeleteReviewButton reviewId={rev.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}