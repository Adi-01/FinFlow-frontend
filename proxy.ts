import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/income",
  "/expenses",
  "/transactions",
  "/profile",
  "/profile-ui",
  "/reflect",
  "/onboarding",
];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Unauthenticated user trying to access protected route -> redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/signup -> redirect to dashboard
  if (isAuthRoute && sessionToken) {
    if (request.nextUrl.searchParams.has("from")) {
      // User was bounced to /login from a protected route (e.g. 401 or deleted account),
      // delete the invalid sessionToken cookie so they don't get bounced back to /dashboard in a loop!
      const response = NextResponse.next();
      response.cookies.delete("sessionToken");
      return response;
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/income/:path*",
    "/expenses/:path*",
    "/transactions/:path*",
    "/profile/:path*",
    "/profile-ui/:path*",
    "/reflect/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
