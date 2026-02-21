import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendAdminNewOrderEmail, sendCustomerOrderStatusEmail } from "@/lib/order-mails";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = (process.env.PAYPAL_ENV || "live").toLowerCase();
const base =
  PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

interface CartSpec {
  name: string;
  value: string | number;
}

interface CheckoutCartItem {
  id: string;
  productId?: string;
  title?: string;
  quantity: number;
  price: number;
  specs?: CartSpec[];
}

interface GuestAddressPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine: string;
}

interface CreateOrderPayload {
  cartItems: CheckoutCartItem[];
  cartTotal?: string;
}

interface CaptureOrderPayload {
  orderID: string;
  cartItems: CheckoutCartItem[];
  shippingAddressId?: string;
  guestAddress?: GuestAddressPayload | null;
  cartTotal?: string;
}

type ShippingMethod = "FREE" | "FAST" | "SUPER_FAST";

function getSpecValue(item: CheckoutCartItem, specName: string) {
  return item.specs?.find((spec) => spec.name === specName)?.value;
}

function normalizeShippingMethod(value: unknown): ShippingMethod {
  const normalized = value === "SUPER-FAST" ? "SUPER_FAST" : String(value || "FREE");
  if (normalized === "FAST" || normalized === "SUPER_FAST" || normalized === "FREE") {
    return normalized;
  }
  return "FREE";
}

function extractPayPalErrorMessage(data: unknown, fallback: string) {
  const asRecord = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const detailsList = Array.isArray(asRecord.details) ? asRecord.details : [];
  const details = detailsList[0] && typeof detailsList[0] === "object"
    ? (detailsList[0] as Record<string, unknown>)
    : null;
  const issue =
    details && typeof details.issue === "string" && details.issue.trim()
      ? ` (${details.issue})`
      : "";
  const description =
    (details && typeof details.description === "string" && details.description.trim()
      ? details.description
      : null) ||
    (typeof asRecord.message === "string" && asRecord.message.trim() ? asRecord.message : null) ||
    (typeof asRecord.error_description === "string" && asRecord.error_description.trim()
      ? asRecord.error_description
      : null) ||
    (typeof asRecord.name === "string" && asRecord.name.trim() ? asRecord.name : null) ||
    fallback;

  return `${description}${issue}`;
}

async function computeCheckoutPricing(cartItems: CheckoutCartItem[]) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const productIds = cartItems.map((item) => item.productId || item.id).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  let trustedTotal = 0;
  let shippingCostTotal = 0;
  let minDeliveryDays: number | null = null;
  let maxDeliveryDays: number | null = null;
  let shippingMethod: ShippingMethod = "FREE";

  const orderItems = cartItems.map((item, index) => {
    const productId = item.productId || item.id;
    const product = productsById.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for product: ${productId}`);
    }

    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid product price for: ${productId}`);
    }

    const unitShippingCostRaw = Number(getSpecValue(item, "Shipping Cost"));
    const unitShippingCost =
      Number.isFinite(unitShippingCostRaw) && unitShippingCostRaw >= 0 ? unitShippingCostRaw : 0;

    const unitMinDeliveryRaw = Number(getSpecValue(item, "Min Delivery Days"));
    const unitMaxDeliveryRaw = Number(getSpecValue(item, "Max Delivery Days"));
    const unitMinDeliveryDays =
      Number.isFinite(unitMinDeliveryRaw) && unitMinDeliveryRaw >= 0 ? unitMinDeliveryRaw : null;
    const unitMaxDeliveryDays =
      Number.isFinite(unitMaxDeliveryRaw) && unitMaxDeliveryRaw >= 0 ? unitMaxDeliveryRaw : null;

    if (index === 0) {
      shippingMethod = normalizeShippingMethod(getSpecValue(item, "Shipping"));
      minDeliveryDays = unitMinDeliveryDays;
      maxDeliveryDays = unitMaxDeliveryDays;
    }

    trustedTotal += (unitPrice + unitShippingCost) * quantity;
    shippingCostTotal += unitShippingCost * quantity;

    return {
      productId,
      quantity,
      price: unitPrice,
    };
  });

  return {
    trustedTotal: Number(trustedTotal.toFixed(2)),
    shippingCostTotal: Number(shippingCostTotal.toFixed(2)),
    minDeliveryDays,
    maxDeliveryDays,
    shippingMethod,
    orderItems,
  };
}

async function generateAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`PayPal token request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  if (!data?.access_token) {
    throw new Error("PayPal access token is missing in response");
  }

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    console.log("--- STEP 1: CREATING PAYPAL ORDER ---");
    const { cartItems, cartTotal }: CreateOrderPayload = await req.json();
    const pricing = await computeCheckoutPricing(cartItems);

    const clientTotal = Number(cartTotal);
    if (Number.isFinite(clientTotal) && Math.abs(clientTotal - pricing.trustedTotal) > 0.01) {
      return NextResponse.json(
        { error: "Cart total mismatch. Please refresh checkout and try again." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(pricing.trustedTotal) || pricing.trustedTotal < 0.01) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum payable amount for USD is $0.01." },
        { status: 400 },
      );
    }

    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: pricing.trustedTotal.toFixed(2) } }],
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.id) {
      const paypalDescription = extractPayPalErrorMessage(data, "Failed to create PayPal order");
      return NextResponse.json({ error: paypalDescription, details: data }, { status: 400 });
    }

    console.log("PayPal Order Created:", data.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const { orderID, cartItems, shippingAddressId, guestAddress, cartTotal }: CaptureOrderPayload =
      await req.json();

    const pricing = await computeCheckoutPricing(cartItems);
    const parsedCartTotal = Number(cartTotal);
    if (Number.isFinite(parsedCartTotal) && Math.abs(parsedCartTotal - pricing.trustedTotal) > 0.01) {
      return NextResponse.json(
        { error: "Cart total mismatch. Please refresh checkout and try again." },
        { status: 400 },
      );
    }

    console.log(`--- PROCESSING ORDER ${orderID} ---`);

    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.status !== "COMPLETED") {
      const paypalDescription = extractPayPalErrorMessage(data, "Payment capture failed");
      return NextResponse.json({ error: paypalDescription, details: data }, { status: 400 });
    }

    const capturedAmountRaw = Number(
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ??
        data?.purchase_units?.[0]?.amount?.value,
    );
    if (!Number.isFinite(capturedAmountRaw) || Math.abs(capturedAmountRaw - pricing.trustedTotal) > 0.01) {
      return NextResponse.json(
        { error: "Captured amount mismatch. Order not saved.", details: data },
        { status: 400 },
      );
    }

    let orderUserId = session?.userId as string | undefined;
    let resolvedShippingAddressId: string | undefined = shippingAddressId;

    if (orderUserId) {
      if (!shippingAddressId) {
        return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
      }

      const ownAddress = await prisma.address.findFirst({
        where: { id: shippingAddressId, userId: orderUserId },
        select: { id: true },
      });
      if (!ownAddress) {
        return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 });
      }
    } else {
      if (
        !guestAddress ||
        !guestAddress.fullName ||
        !guestAddress.email ||
        !guestAddress.phone ||
        !guestAddress.country ||
        !guestAddress.city ||
        !guestAddress.postalCode ||
        !guestAddress.addressLine
      ) {
        return NextResponse.json({ error: "Guest shipping details are required" }, { status: 400 });
      }

      const guestEmail = `guest+${Date.now()}-${randomUUID().slice(0, 8)}@silvexiar.local`;
      const guestPasswordHash = await bcrypt.hash(`guest-${randomUUID()}`, 10);

      const created = await prisma.$transaction(async (tx) => {
        const guestUser = await tx.user.create({
          data: {
            email: guestEmail,
            passwordHash: guestPasswordHash,
            fullName: guestAddress.fullName,
            phone: guestAddress.phone,
            emailVerified: new Date(),
          },
          select: { id: true },
        });

        const address = await tx.address.create({
          data: {
            userId: guestUser.id,
            fullName: guestAddress.fullName,
            email: guestAddress.email,
            phone: guestAddress.phone,
            country: guestAddress.country,
            city: guestAddress.city,
            postalCode: guestAddress.postalCode,
            addressLine: guestAddress.addressLine,
            isDefault: true,
          },
          select: { id: true },
        });

        return { guestUserId: guestUser.id, addressId: address.id };
      });

      orderUserId = created.guestUserId;
      resolvedShippingAddressId = created.addressId;
    }

    if (!orderUserId || !resolvedShippingAddressId) {
      return NextResponse.json({ error: "Unable to resolve checkout user/address" }, { status: 500 });
    }

    const order = await prisma.order.create({
      data: {
        userId: orderUserId,
        totalAmount: pricing.trustedTotal,
        status: "PENDING",
        paymentStatus: "PAID",
        shippingAddressId: resolvedShippingAddressId,
        transactionId: orderID,
        shippingMethod: pricing.shippingMethod,
        shippingCost: pricing.shippingCostTotal,
        minDeliveryDays: pricing.minDeliveryDays,
        maxDeliveryDays: pricing.maxDeliveryDays,
        items: {
          create: pricing.orderItems,
        },
      },
    });

    const customer = await prisma.user.findUnique({
      where: { id: orderUserId },
      select: { fullName: true, email: true },
    });
    const address = await prisma.address.findUnique({
      where: { id: resolvedShippingAddressId },
      select: { email: true },
    });

    const recipientEmail = address?.email || customer?.email || guestAddress?.email;
    const customerName = customer?.fullName || guestAddress?.fullName || "Customer";
    const customerEmail = customer?.email || recipientEmail || "guest@silvexiar.local";

    if (recipientEmail) {
      const emailItems = cartItems.map((item) => ({
        title: item.title || item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      try {
        await sendCustomerOrderStatusEmail({
          to: recipientEmail,
          customerName,
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
          customerName,
          customerEmail,
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

    console.log("ORDER SAVED SUCCESSFULLY! ID:", order.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "Critical failure" }, { status: 500 });
  }
}
