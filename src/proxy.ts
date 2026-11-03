import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

import { auth } from "./lib/auth";

/**
 * Frontend route guard. Unauthenticated visitors are bounced to /login with
 * the route they wanted, so signing in returns them where they were going.
 * The Express API still verifies the JWT on every write - this is UX only.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/add-studio",
    "/my-listings",
    "/my-bookings",
    "/studios/edit/:path*",
  ],
};
