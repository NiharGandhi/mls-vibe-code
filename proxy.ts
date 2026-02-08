import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  // Server actions send Accept: text/x-component. Don't redirect them or the client
  // gets "An unexpected response was received from the server" (redirect vs RSC payload).
  if (request.headers.get("Accept") === "text/x-component") {
    return NextResponse.next();
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected page routes requiring authentication
    '/admin/:path*',
    '/dashboard/:path*',
    '/teams/:path*',
    '/account/:path*',
    '/challenges/:path*',
    // Protected API routes requiring authentication
    '/api/admin/:path*',
    '/api/team/:path*',
    '/api/challenges/:path*',
    '/api/notifications/:path*',
    '/api/join-request/:path*',
    '/api/all-teams',
  ],
};