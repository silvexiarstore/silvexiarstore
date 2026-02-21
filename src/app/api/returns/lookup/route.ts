import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const lookupSchema = z.object({
  orderCode: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = lookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lookup data", details: parsed.error.format() }, { status: 400 });
    }

    const orderCode = parsed.data.orderCode.toLowerCase();
    const email = parsed.data.email.toLowerCase();

    if (!orderCode && !email) {
      return NextResponse.json(
        { error: "Provide order code or email to search." },
        { status: 400 },
      );
    }

    const where: any = {};
    if (orderCode) {
      where.id = { startsWith: orderCode };
    }
    if (email) {
      where.OR = [
        { user: { email: { equals: email, mode: "insensitive" } } },
        { address: { email: { equals: email, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    if (!orders.length) {
      return NextResponse.json(
        { error: "No matching orders found." },
        { status: 404 },
      );
    }

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
  } catch (error) {
    console.error("RETURN_LOOKUP_ERROR:", error);
    return NextResponse.json({ error: "Failed to lookup order." }, { status: 500 });
  }
}
