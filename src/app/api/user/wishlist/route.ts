import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// 1. إضافة أو إزالة من المفضلة (Toggle)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    const userId = session.userId as string;

    // البحث هل المنتج موجود أصلاً في المفضلة
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existingItem) {
      // إذا كان موجوداً -> نقوم بحذفه
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id }
      });
      return NextResponse.json({ message: "Removed from wishlist", active: false });
    } else {
      // إذا لم يكن موجوداً -> نقوم بإضافته
      await prisma.wishlistItem.create({
        data: { userId, productId }
      });
      return NextResponse.json({ message: "Added to wishlist", active: true });
    }

  } catch (error) {
    return NextResponse.json({ error: "Wishlist operation failed" }, { status: 500 });
  }
}

// 2. جلب حالة المنتج (هل هو في المفضلة أم لا)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const session = await getSession();

  if (!session || !session.userId) return NextResponse.json({ active: false, count: 0 });

  if (!productId) {
    const count = await prisma.wishlistItem.count({
      where: { userId: session.userId as string },
    });
    return NextResponse.json({ count });
  }

  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { 
        userId: session.userId as string, 
        productId 
      }
    }
  });

  return NextResponse.json({ active: !!item });
}
