import prisma from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  // Prepare data for the form
  const productData = {
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() || "",
    freeShippingPrice: product.freeShippingPrice?.toString() || "",
    fastShippingPrice: product.fastShippingPrice?.toString() || "",
    superFastPrice: product.superFastPrice?.toString() || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ProductForm initialData={productData} />
    </div>
  );
}
