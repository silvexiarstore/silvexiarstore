import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhook is disabled. PayPal flow is active." },
    { status: 410 },
  );
}
