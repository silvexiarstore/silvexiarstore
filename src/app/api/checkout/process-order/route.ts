import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // ضروري باش نجيبو الايدي
import { sendAdminNewOrderEmail, sendCustomerOrderStatusEmail } from "@/lib/order-mails";

export async function POST(req: Request) {
  try {
    // 1. Get Real User form Session
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, totalAmount, shippingAddressId, transactionId, shippingMethod } = body;
    const normalizedMethod = shippingMethod === "SUPER-FAST" ? "SUPER_FAST" : shippingMethod;
    const method: "FREE" | "FAST" | "SUPER_FAST" = ["FREE", "FAST", "SUPER_FAST"].includes(normalizedMethod)
      ? normalizedMethod
      : "FREE";

    const shippingCost =
      Number(items?.[0]?.specs?.find((spec: any) => spec.name === "Shipping Cost")?.value) || 0;
    const minDeliveryDaysRaw = Number(
      items?.[0]?.specs?.find((spec: any) => spec.name === "Min Delivery Days")?.value,
    );
    const maxDeliveryDaysRaw = Number(
      items?.[0]?.specs?.find((spec: any) => spec.name === "Max Delivery Days")?.value,
    );
    const minDeliveryDays = Number.isFinite(minDeliveryDaysRaw) ? minDeliveryDaysRaw : null;
    const maxDeliveryDays = Number.isFinite(maxDeliveryDaysRaw) ? maxDeliveryDaysRaw : null;

    // 2. Validate Data
    if (!items || !totalAmount || !shippingAddressId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Create Order in DB
    const order = await prisma.order.create({
      data: {
        userId: session.userId as string, // Hna 3tina ID s7i7
        totalAmount,
        status: "PENDING",
        paymentStatus: "PAID",
        shippingAddressId,
        transactionId,
        shippingMethod: method,
        shippingCost,
        minDeliveryDays,
        maxDeliveryDays,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id, // Vérifier ID fin rah
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const customer = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { fullName: true, email: true },
    });
    const address = await prisma.address.findUnique({
      where: { id: shippingAddressId },
      select: { email: true },
    });

    const recipientEmail = address?.email || customer?.email;
    if (recipientEmail && customer?.email) {
      const emailItems = items.map((item: any) => ({
        title: item.title || item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      try {
        await sendCustomerOrderStatusEmail({
          to: recipientEmail,
          customerName: customer.fullName || "Customer",
          orderId: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          shippingMethod: order.shippingMethod,
          shippingCost: order.shippingCost,
          minDeliveryDays: order.minDeliveryDays,
          maxDeliveryDays: order.maxDeliveryDays,
          items: emailItems,
        });
      } catch (emailError) {
        console.error("CUSTOMER_ORDER_EMAIL_ERROR:", emailError);
      }

      try {
        await sendAdminNewOrderEmail({
          orderId: order.id,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          customerName: customer.fullName || "Customer",
          customerEmail: customer.email,
          shippingMethod: order.shippingMethod,
          shippingCost: order.shippingCost,
          minDeliveryDays: order.minDeliveryDays,
          maxDeliveryDays: order.maxDeliveryDays,
          items: emailItems,
        });
      } catch (emailError) {
        console.error("ADMIN_ORDER_EMAIL_ERROR:", emailError);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("Order Error:", error); // Shof hada f Terminal dial VS Code
    return NextResponse.json({ error: error.message || "Failed to save order" }, { status: 500 });
  }
}
