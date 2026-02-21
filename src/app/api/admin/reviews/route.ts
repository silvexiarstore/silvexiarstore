import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    
    // تأكد أن المستخدم هو Admin
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Review deleted by admin" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}