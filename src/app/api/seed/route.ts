import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. مسح المنتجات القديمة (باش مايتعاودوش)
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.product.deleteMany();

    // 2. زيد منتجات جداد
    await prisma.product.createMany({
      data: [
        {
          title: "Wireless Noise Cancelling Headphones",
          slug: "wireless-headphones-pro",
          description: "Experience world-class silence and superior sound with our new noise cancelling technology.",
          price: 299.99,
          inStock: true,
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
        },
        {
          title: "Smart Watch Series 7",
          slug: "smart-watch-series-7",
          description: "The most advanced smartwatch with health tracking and seamless connectivity.",
          price: 399.00,
          inStock: true,
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
        },
        {
          title: "Premium Leather Backpack",
          slug: "premium-leather-backpack",
          description: "Handcrafted from genuine leather, perfect for travel and daily commute.",
          price: 149.50,
          inStock: true,
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
        },
        {
          title: "Mechanical Gaming Keyboard",
          slug: "mechanical-gaming-keyboard",
          description: "RGB backlit mechanical keyboard with blue switches for the ultimate gaming experience.",
          price: 89.99,
          inStock: true,
          images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80"],
        },
      ],
    });

    return NextResponse.json({ message: "Database seeded successfully with products!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}