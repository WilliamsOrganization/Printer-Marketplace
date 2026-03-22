import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const isLoginPage = req.nextUrl.pathname === "/admin";
	const isDashboard = req.nextUrl.pathname.startsWith("/admin/dashboard");

	if (isLoginPage && token) {
		return NextResponse.redirect(new URL("/admin/dashboard", req.url));
	}

	if (isDashboard && !token) {
		return NextResponse.redirect(new URL("/admin", req.url));
	}
}

export const config = {
	matcher: ["/admin", "/admin/dashboard", "/admin/dashboard/:path*"],
};
