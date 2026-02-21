import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendCustomerOrderStatusEmail } from "@/lib/order-mails";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, status, paymentStatus } = await req.json();

    const previousOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!previousOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status, paymentStatus },
      include: {
        user: { select: { fullName: true, email: true } },
        address: { select: { email: true } },
        items: { include: { product: { select: { title: true } } } },
      },
    });

    const recipientEmail = updatedOrder.address?.email || updatedOrder.user?.email;
    if (previousOrder.status !== updatedOrder.status && recipientEmail) {
      try {
        await sendCustomerOrderStatusEmail({
          to: recipientEmail,
          customerName: updatedOrder.user.fullName || "Customer",
          orderId: updatedOrder.id,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          totalAmount: updatedOrder.totalAmount,
          shippingMethod: updatedOrder.shippingMethod,
          shippingCost: updatedOrder.shippingCost,
          minDeliveryDays: updatedOrder.minDeliveryDays,
          maxDeliveryDays: updatedOrder.maxDeliveryDays,
          items: updatedOrder.items.map((item) => ({
            title: item.product.title,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      } catch (emailError) {
        console.error("CUSTOMER_STATUS_EMAIL_ERROR:", emailError);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
