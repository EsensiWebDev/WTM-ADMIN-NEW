import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password"];
const AUTHENTICATED_REDIRECT_PATH = "/account/user-management/super-admin";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = Boolean(token);
    const { pathname } = req.nextUrl;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      const callbackUrl = `${pathname}${req.nextUrl.search}`;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(
        new URL(AUTHENTICATED_REDIRECT_PATH, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
