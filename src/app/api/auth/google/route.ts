import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getGoogleRedirectUri(requestUrl: string) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(requestUrl).origin;
  const callbackPath = process.env.GOOGLE_REDIRECT_PATH || "/api/auth/google/callback";
  return `${origin}${callbackPath}`;
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const modeParam = reqUrl.searchParams.get("mode");
  const mode = modeParam === "signup" ? "signup" : "login";
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google client ID is not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set("oauth_google_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  cookieStore.set("oauth_google_mode", mode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = getGoogleRedirectUri(req.url);
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizeUrl);
}
