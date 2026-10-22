import { NextResponse } from "next/server"; 

export function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // 1. Detect if this is a staging/preview environment using the host header or env variables
  const host = (request.headers.get("host") || "").toLowerCase();
  const isProdHost = host === "preqt.club" || host === "www.preqt.club";
  const isStaging = 
    (host && !isProdHost && !host.startsWith("localhost:")) ||
    host.includes("staging") || 
    host.includes("vercel.app") || 
    host.includes("webninjaz.com") ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("apistaging") ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("staging") ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("vercel.app") ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes("apistaging") ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes("staging");

  // 2. Identify if the current path requires the legacy authentication check
  const isTargetedAuthRoute = [
    "/sign-in",
    "/signup",
    "/reset-password",
    "/forget-password",
    "/account",
    "/deals",
    "/private-deals",
    "/transaction-page",
    "/events",
    "/otp"
  ].some(prefix => pathname === prefix || pathname.startsWith(prefix + "/"));

  if (isTargetedAuthRoute) {
    const token = request.cookies.get("accessToken")?.value;
    const isAuthenticated = Boolean(token);
    const verifyOtp = request.cookies.get("verifyOtp")?.value == "true"; 

    const securePaths = [
      "/account",
      "/account/:path*",
      "/private-deals",
      "/private-deals/:path*",
      "/transaction-page",
      "/transaction-page/:path*",
      "/events",
    ];

    if (!verifyOtp && pathname == "/otp") {
      const response = NextResponse.redirect(new URL("/", origin));
      if (isStaging) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
      }
      return response;
    }

    if (
      isAuthenticated &&
      (pathname === "/sign-in" ||
        pathname === "/signup" ||
        pathname.startsWith("/forget-password") ||
        pathname.startsWith("/reset-password"))
    ) {
      const response = NextResponse.redirect(new URL("/deals", origin));
      if (isStaging) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
      }
      return response;
    }

    // Rule 2: If NOT authenticated and trying to access secure paths → redirect to /signin
    const isAccessingSecurePath = securePaths.some((path) => {
      if (path.endsWith("/:path*")) {
        const base = path.replace("/:path*", "");
        return pathname.startsWith(base);
      }
      return pathname === path;
    });

    if (!isAuthenticated && isAccessingSecurePath) {
      const response = NextResponse.redirect(new URL("/", origin));
      if (isStaging) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
      }
      return response;
    }
  }

  // 3. Set X-Robots-Tag header on staging requests
  const response = NextResponse.next();
  if (isStaging) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
