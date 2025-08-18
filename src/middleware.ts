import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromRequest, isAuthenticated } from "./lib/auth/utils";

export async function middleware(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const isAuth = token ? await isAuthenticated(request) : null;
  
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");
  const protectedRoutes = ["/checkout", "/profile", "/admin"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuth) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && isAuth) {
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && isAuth?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  if (isAuth) {
    requestHeaders.set("x-user-id", isAuth.userId);
    requestHeaders.set("x-user-role", isAuth.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};
