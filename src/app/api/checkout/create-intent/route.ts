import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe is disabled. Use /api/checkout/paypal instead." },
    { status: 410 },
  );
}
