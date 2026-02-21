import prisma from "@/lib/prisma";
import { Trash2, User, Star } from "lucide-react";
import Image from "next/image";

export default async function AdminProductReviews({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { reviews: { include: { user: true } } }
  });

  if (!product) return <div>Not Found</div>;

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center gap-6">
         <Image src={product.images[0]} width={100} height={100} alt="P" className="rounded-2xl" />
         <h1 className="text-3xl font-bold">{product.title} - Management</h1>
      </div>

      <div className="grid gap-6">
        {product.reviews.map(rev => (
          <div key={rev.id} className="bg-white p-6 rounded-3xl border flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl"><User /></div>
                <div>
                   <p className="font-bold">{rev.user.fullName} ({rev.rating} Stars)</p>
                   <p className="text-gray-500 text-sm">{rev.comment}</p>
                </div>
             </div>
             {/* زر الحذف سيكون API Call */}
             <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={20} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}