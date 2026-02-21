import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Stripe from "stripe";
import { sendAdminNewOrderEmail, sendCustomerOrderStatusEmail } from "@/lib/order-mails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    // ... check session & empty cart

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId as string;

    const { items } = await req.json();

    // 1. Get real products from DB (نستعملو productId دابا)
    const productIds = items.map((item: any) => item.productId); // <--- تبدلات
    
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData = [];

    // 2. Calculate Total
    for (const item of items) {
      // نقلبو بالـ productId
      const product = dbProducts.find((p) => p.id === item.productId); // <--- تبدلات
      
      if (product) {
        // تأكد من تحويل Decimal لـ Number
        const price = Number(product.price); 
        totalAmount += price * item.quantity;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price, 
        });
      }
    }

    // 3. Get User's Default Address (For now)
    const address = await prisma.address.findFirst({
      where: { userId: userId, isDefault: true },
    });

    if (!address) {
        return NextResponse.json({ error: "Please add a shipping address first" }, { status: 400 });
    }
    
    // 4. Create Order in Database (PENDING)
    const order = await prisma.order.create({
      data: {
        userId: userId,
        totalAmount: totalAmount,
        status: "PENDING",
        paymentStatus: "UNPAID",
        shippingAddressId: address.id,
        items: {
          create: orderItemsData,
        },
      },
    });

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });
    const recipientEmail = address.email || customer?.email || null;
    const emailItems = items.map((item: any) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      return {
        title: product?.title || item.productId,
        quantity: item.quantity,
        price: product?.price || item.price || 0,
      };
    });

    if (recipientEmail && customer?.email) {
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

     if (totalAmount < 0.5) {
       return NextResponse.json({ error: "Amount too low" }, { status: 400 });
    }

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // ضرب فـ 100 باش يولي Cents
      currency: "usd",
      metadata: {
        orderId: order.id, // Link Stripe to our Database Order
        userId: userId,
      },
    });

    // Update order with Stripe Intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { transactionId: paymentIntent.id }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
