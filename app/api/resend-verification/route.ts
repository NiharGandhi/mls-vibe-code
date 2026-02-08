import { NextRequest, NextResponse } from "next/server";
import {
  checkResendVerificationRateLimit,
  recordResendVerificationSent,
} from "@/lib/rate-limit";

const AUTH_SEND_VERIFICATION = "/api/auth/send-verification-email";
const CALLBACK_URL = "/dashboard";

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const { allowed, retryAfterSeconds } = checkResendVerificationRateLimit(email);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before requesting another email.",
        retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_BASE_URL ??
    request.nextUrl.origin;

  const res = await fetch(`${baseUrl}${AUTH_SEND_VERIFICATION}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, callbackURL: CALLBACK_URL }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? "Failed to send verification email" },
      { status: res.status }
    );
  }

  recordResendVerificationSent(email);
  return NextResponse.json({ success: true });
}
