// src\app\api\user\reviews\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    // 🛑 تأكد أن الداتا كاينة (هذا هو سبب 400 المحتمل)
    if (!productId || !rating) {
      return NextResponse.json({ error: "Product ID and Rating are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.userId as string,
        productId,
        rating: Number(rating),
        comment: comment || "",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Review API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}