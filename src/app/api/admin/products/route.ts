import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendNewProductNewsletter } from "@/lib/newsletter";

type VariantOption = { name: string; values: string[] };
type ContentSection = {
  id: string;
  type: "text" | "image";
  text: string;
  style: "normal" | "bold" | "italic";
  image: string;
  caption: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });
  return user?.role === "ADMIN";
}

function normalizeSpecifications(input: unknown): {
  variantOptions: VariantOption[];
  contentSections: ContentSection[];
} {
  if (Array.isArray(input)) {
    return {
      variantOptions: input as VariantOption[],
      contentSections: [],
    };
  }

  if (!input || typeof input !== "object") {
    return {
      variantOptions: [],
      contentSections: [],
    };
  }

  const value = input as {
    variantOptions?: unknown;
    contentSections?: unknown;
  };

  const variantOptions = Array.isArray(value.variantOptions)
    ? (value.variantOptions as VariantOption[])
    : [];
  const contentSections = Array.isArray(value.contentSections)
    ? (value.contentSections as ContentSection[])
    : [];

  return {
    variantOptions,
    contentSections,
  };
}

// DELETE
export async function DELETE(req: Request) {
  // 1. التحقق من الأدمن
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // 2. تنظيف الداتابيز من أي حاجة مرتبطة بهاد المنتج (علاقة Foreign Key)
    // نمسحو من المفضلة
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });

    // نمسحو التعليقات
    await prisma.review.deleteMany({ where: { productId: id } });

    // نمسحو السلعة لي مسجلة فلي كوموند (ضروري باش ما يطلعش P2003)
    await prisma.orderItem.deleteMany({ where: { productId: id } });

    // 3. دابا نقدر نمسحو المنتج وحنا مرتاحين
    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete: Product is linked to other records." },
      { status: 500 },
    );
  }
}

// CREATE (POST)
export async function POST(req: Request) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title,
      description,
      price,
      oldPrice,
      images,
      categoryId,
      specifications,
      isNew,
      isBestSeller,
      inStock,
    } = body;
    const normalizedSpecifications = normalizeSpecifications(specifications);

    const slug =
      title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      Date.now();

    const product = await prisma.product.create({
      data: {
        title,
        description,
        slug,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        inStock: inStock,
        isNew,
        isBestSeller,
        images: images || [], // Array of strings
        categoryId: categoryId && categoryId !== "" ? categoryId : null, // Fix Uncategorized
        specifications: normalizedSpecifications,
        freeShippingEnabled: Boolean(body.freeShippingEnabled),
        freeShippingPrice: body.freeShippingPrice != null ? parseFloat(body.freeShippingPrice) : null,
        freeShippingMinDeliveryDays: body.freeShippingMinDeliveryDays ?? null,
        freeShippingMaxDeliveryDays: body.freeShippingMaxDeliveryDays ?? null,
        fastShippingEnabled: Boolean(body.fastShippingEnabled),
        fastShippingPrice: body.fastShippingPrice != null ? parseFloat(body.fastShippingPrice) : null,
        fastShippingMinDeliveryDays: body.fastShippingMinDeliveryDays ?? null,
        fastShippingMaxDeliveryDays: body.fastShippingMaxDeliveryDays ?? null,
        superFastShippingEnabled: Boolean(body.superFastShippingEnabled),
        superFastPrice: body.superFastPrice != null ? parseFloat(body.superFastPrice) : null,
        superFastMinDeliveryDays: body.superFastMinDeliveryDays ?? null,
        superFastMaxDeliveryDays: body.superFastMaxDeliveryDays ?? null,
      },
    });

    void sendNewProductNewsletter({
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || null,
    }).catch((error) => {
      console.error("NEWSLETTER_NEW_PRODUCT_ERROR:", error);
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// UPDATE (PUT) - New!
export async function PUT(req: Request) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      price,
      oldPrice,
      images,
      categoryId,
      specifications,
      isNew,
      isBestSeller,
      inStock,
    } = body;
    const normalizedSpecifications = normalizeSpecifications(specifications);

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        inStock,
        isNew,
        isBestSeller,
        images: images || [],
        categoryId: categoryId && categoryId !== "" ? categoryId : null,
        specifications: normalizedSpecifications,
        freeShippingEnabled: Boolean(body.freeShippingEnabled),
        freeShippingPrice: body.freeShippingPrice != null ? parseFloat(body.freeShippingPrice) : null,
        freeShippingMinDeliveryDays: body.freeShippingMinDeliveryDays ?? null,
        freeShippingMaxDeliveryDays: body.freeShippingMaxDeliveryDays ?? null,
        fastShippingEnabled: Boolean(body.fastShippingEnabled),
        fastShippingPrice: body.fastShippingPrice != null ? parseFloat(body.fastShippingPrice) : null,
        fastShippingMinDeliveryDays: body.fastShippingMinDeliveryDays ?? null,
        fastShippingMaxDeliveryDays: body.fastShippingMaxDeliveryDays ?? null,
        superFastShippingEnabled: Boolean(body.superFastShippingEnabled),
        superFastPrice: body.superFastPrice != null ? parseFloat(body.superFastPrice) : null,
        superFastMinDeliveryDays: body.superFastMinDeliveryDays ?? null,
        superFastMaxDeliveryDays: body.superFastMaxDeliveryDays ?? null,
      },
    });
    return NextResponse.json(product);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

