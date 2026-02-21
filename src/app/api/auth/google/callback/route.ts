import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my-secret-key-change-it-later"
);

function getGoogleRedirectUri(requestUrl: string) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(requestUrl).origin;
  const callbackPath = process.env.GOOGLE_REDIRECT_PATH || "/api/auth/google/callback";
  return `${origin}${callbackPath}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const loginUrl = new URL("/login", req.url);

  if (oauthError || !code || !state) {
    loginUrl.searchParams.set("error", "google_auth_cancelled");
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_google_state")?.value;

  if (!storedState || storedState !== state) {
    loginUrl.searchParams.set("error", "google_auth_state");
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set("error", "google_auth_config");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const redirectUri = getGoogleRedirectUri(req.url);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      loginUrl.searchParams.set("error", "google_auth_token");
      return NextResponse.redirect(loginUrl);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile?.email) {
      loginUrl.searchParams.set("error", "google_auth_profile");
      return NextResponse.redirect(loginUrl);
    }

    const email = String(profile.email).toLowerCase();
    const fullName = profile.name || email.split("@")[0] || "Google User";

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          emailVerified: new Date(),
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    cookieStore.delete("oauth_google_state");

    return NextResponse.redirect(new URL("/account", req.url));
  } catch (error) {
    console.error("Google callback error:", error);
    loginUrl.searchParams.set("error", "google_auth_failed");
    return NextResponse.redirect(loginUrl);
  }
}
