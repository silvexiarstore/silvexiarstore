import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId as string },
    include: {
      items: {
        include: { product: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      shippingMethod: order.shippingMethod,
      shippingCost: Number(order.shippingCost || 0),
      items: order.items.map((item) => ({
        id: item.id,
        title: item.product.title,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    })),
  });
}
