import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    // 1. التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    // 2. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. إنشاء توكن التحقق
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 4. إنشاء المستخدم
    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        verificationToken,
      },
    });

    // 5. إرسال إيميل التحقق (Next Mail)
    const requestOrigin = new URL(req.url).origin;
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl =
      envBaseUrl && !envBaseUrl.includes("localhost") ? envBaseUrl : requestOrigin;
    const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`;
    
    await sendEmail(email, "Activate Your Silvexiar Account", `
      <div style="font-family: serif; text-align: center; padding: 40px;">
        <h1>Welcome to Silvexiar</h1>
        <p>Click below to activate your premium membership:</p>
        <a href="${verificationUrl}" style="background: black; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px;">Verify Account</a>
      </div>
    `);

    return NextResponse.json({ message: "Registered! Please check email." }, { status: 201 });

  } catch {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
