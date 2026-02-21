import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return NextResponse.json({ message: "Check your email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // ساعة واحدة

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: expiry },
    });

    const requestOrigin = new URL(req.url).origin;
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl =
      envBaseUrl && !envBaseUrl.includes("localhost") ? envBaseUrl : requestOrigin;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await sendEmail(email, "Reset Your Silvexiar Key", `
      <div style="font-family: serif; text-align: center; padding: 50px;">
        <h1 style="font-size: 24px;">Security Restoration</h1>
        <p>A request was made to reset your access key. Click below:</p>
        <a href="${resetUrl}" style="background: black; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; display: inline-block; margin-top: 20px;">Restoration Key</a>
      </div>
    `);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
