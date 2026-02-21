import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) return NextResponse.json({ error: "Token not found" }, { status: 404 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null, // مسح التوكن بعد التفعيل
    },
  });

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}