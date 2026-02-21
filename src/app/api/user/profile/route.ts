import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { fullName: true, email: true } // نجبدو غير اللي غنحتاجو
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}