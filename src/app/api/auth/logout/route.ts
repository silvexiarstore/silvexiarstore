// src\app\api\auth\logout\route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  
  // مسح الكوكيز
  cookieStore.delete("token");

  // Redirect to login page
  return NextResponse.redirect(new URL("/login", req.url));
}
