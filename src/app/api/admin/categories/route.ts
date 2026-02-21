import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
  return user?.role === "ADMIN";
}

// GET: جلب كاع الأقسام
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(categories);
}

// POST: إضافة قسم جديد
export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, image } = await req.json();
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const category = await prisma.category.create({
      data: { name, slug, image }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// DELETE: مسح قسم
export async function DELETE(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Cannot delete category with products" }, { status: 500 });
  }
}

// PUT: تعديل قسم موجود
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, image } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, slug, image }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}