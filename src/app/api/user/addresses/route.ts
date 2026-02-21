// src\app\api\user\addresses\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
// تأكد أن دالة getSession أو getCurrentUser موجودة في هذا المسار وتعمل بشكل صحيح
import { getSession } from "@/lib/auth"; 

// 1. Validation Schema (نفس الحقول لي درنا فالفورمولير)
const addressCreateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().min(6, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  addressLine: z.string().min(5, "Address line is required"),
});

// GET: جلب عناوين المستخدم
export async function GET() {
  try {
    const session = await getSession();
    
    // إذا لم يكن مسجلاً للدخول
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId as string },
      // نرتبوهم بحيث الـ Default يبان هو اللول، ومن بعد الأجدد فالأجدد
      orderBy: [
        { isDefault: "desc" }, 
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: إضافة عنوان جديد
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // التحقق من صحة البيانات باستخدام Zod
    const validation = addressCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() }, 
        { status: 400 }
      );
    }

    const { fullName, email, phone, country, city, postalCode, addressLine } = validation.data;

    // نشوفو واش عندو عناوين قبل ولا لا (باش أول واحد يكون هو Default أوتوماتيك)
    const count = await prisma.address.count({ 
      where: { userId: session.userId as string } 
    });

    const isFirstAddress = count === 0;

    const newAddress = await prisma.address.create({
      data: {
        userId: session.userId as string,
        fullName,
        email: email || null,
        phone,
        country,
        city,
        postalCode,
        addressLine,
        isDefault: isFirstAddress, // True ila kan lowel, False ila kan 3ndo khrin
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}

// DELETE: مسح عنوان (اختياري ولكن مفيد)
export async function DELETE(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    // كنستعملو deleteMany هنا كـ Trick باش نضمنو بلي user كيمسح غير العنوان ديالو
    // deleteMany كترجع count، إلا كان 0 يعني مالقاش العنوان أو ماشي ديالو
    const result = await prisma.address.deleteMany({
      where: {
        id: id,
        userId: session.userId as string, 
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Address not found or permission denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await req.json();
    
    const updatedAddress = await prisma.address.update({
      where: { 
        id,
        userId: session.userId as string // نضمنو أنه مول العنوان
      },
      data: {
        fullName: body.fullName,
        email: body.email || null,
        addressLine: body.addressLine,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country,
        phone: body.phone,
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
