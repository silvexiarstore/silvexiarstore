import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my-secret-key-change-it-later"
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. التحقق من وجود المستخدم
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // --- الإضافة الجديدة: التحقق من تفعيل الإيميل ---
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email address before logging in." },
        { status: 403 } // 403 Forbidden
      );
    }

    // 3. التحقق من كلمة المرور
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. إنشاء توكن الجلسة (JWT)
    const token = await new SignJWT({ 
      userId: user.id, 
      role: user.role 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // 5. إعداد الكوكيز (Secure)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true, // حماية من XSS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 ساعة
      path: "/",
    });

    return NextResponse.json(
      { message: "Login successful", role: user.role },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}