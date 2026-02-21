import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  isNewsletterSubscribed,
  subscribeNewsletter,
  sendNewsletterWelcomeEmail,
} from "@/lib/newsletter";

const subscribeSchema = z.object({
  email: z.string().email("Valid email is required."),
});

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ authenticated: false, subscribed: false, email: "" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { email: true },
  });

  const email = user?.email || "";
  const subscribed = email ? await isNewsletterSubscribed(email) : false;

  return NextResponse.json({
    authenticated: true,
    email,
    subscribed,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email.", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const session = await getSession();
    const source = session?.userId ? "authenticated_footer" : "guest_footer";
    const email = await subscribeNewsletter(parsed.data.email, source);

    try {
      await sendNewsletterWelcomeEmail(email);
    } catch (emailError) {
      console.error("NEWSLETTER_WELCOME_EMAIL_ERROR:", emailError);
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("NEWSLETTER_SUBSCRIBE_ERROR:", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }
}
