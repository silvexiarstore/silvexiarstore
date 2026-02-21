import { sendEmail } from "@/lib/mail";
import { formatMoney } from "@/lib/money";

const ADMIN_ORDER_EMAIL = process.env.ORDER_ALERT_EMAIL || "silvexiarstore@gmail.com";

const formatDate = (value: Date | string) => new Date(value).toLocaleString("en-US");

export async function sendAdminNewOrderEmail(payload: {
  orderId: string;
  createdAt: Date | string;
  totalAmount: unknown;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  shippingMethod?: string | null;
  shippingCost?: unknown;
  minDeliveryDays?: number | null;
  maxDeliveryDays?: number | null;
  items: Array<{ title: string; quantity: number; price: unknown }>;
}) {
  const itemsHtml = payload.items
    .map(
      (item) =>
        `<li><strong>${item.title}</strong> - Qty: ${item.quantity} - ${formatMoney(item.price)}</li>`,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${payload.orderId}</p>
      <p><strong>Date:</strong> ${formatDate(payload.createdAt)}</p>
      <p><strong>Customer:</strong> ${payload.customerName} (${payload.customerEmail})</p>
      <p><strong>Status:</strong> ${payload.status}</p>
      <p><strong>Payment:</strong> ${payload.paymentStatus}</p>
      <p><strong>Shipping:</strong> ${(payload.shippingMethod || "FREE").replace("_", " ")} (${formatMoney(payload.shippingCost)})</p>
      <p><strong>Delivery:</strong> ${
        payload.minDeliveryDays != null && payload.maxDeliveryDays != null
          ? `${payload.minDeliveryDays}-${payload.maxDeliveryDays} days`
          : "N/A"
      }</p>
      <p><strong>Total:</strong> ${formatMoney(payload.totalAmount)}</p>
      <h3>Items</h3>
      <ul>${itemsHtml}</ul>
    </div>
  `;

  await sendEmail(ADMIN_ORDER_EMAIL, `New Order - ${payload.orderId.slice(0, 8)}`, html);
}

export async function sendCustomerOrderStatusEmail(payload: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  totalAmount: unknown;
  shippingMethod?: string | null;
  shippingCost?: unknown;
  minDeliveryDays?: number | null;
  maxDeliveryDays?: number | null;
  items: Array<{ title: string; quantity: number; price: unknown }>;
}) {
  const itemsHtml = payload.items
    .map(
      (item) =>
        `<li><strong>${item.title}</strong> - Qty: ${item.quantity} - ${formatMoney(item.price)}</li>`,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${payload.customerName},</h2>
      <p>Your order status is now: <strong>${payload.status}</strong>.</p>
      <p><strong>Order ID:</strong> ${payload.orderId}</p>
      <p><strong>Payment:</strong> ${payload.paymentStatus}</p>
      <p><strong>Shipping:</strong> ${(payload.shippingMethod || "FREE").replace("_", " ")} (${formatMoney(payload.shippingCost)})</p>
      <p><strong>Delivery:</strong> ${
        payload.minDeliveryDays != null && payload.maxDeliveryDays != null
          ? `${payload.minDeliveryDays}-${payload.maxDeliveryDays} days`
          : "N/A"
      }</p>
      <p><strong>Total:</strong> ${formatMoney(payload.totalAmount)}</p>
      <h3>Items</h3>
      <ul>${itemsHtml}</ul>
      <p>Thank you for shopping with Silvexiar.</p>
    </div>
  `;

  await sendEmail(payload.to, `Order Update - ${payload.status}`, html);
}
