import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const isLoginPage = req.nextUrl.pathname === "/admin";
	// Covers every admin page behind the dashboard shell (dashboard, analytics,
	// lifecycle, projects, team, and anything added later) - not just /admin/dashboard.
	const isProtectedAdminRoute = !isLoginPage && req.nextUrl.pathname.startsWith("/admin/");

	if (isLoginPage && token) {
		const res = await fetch(`${process.env.SPRINGBOOT_BACKEND_URL}/server/auth/verify-admin`, {
			headers: { Authorization: `Bearer ${token?.backendToken}` }
		})
		if (res.ok) return NextResponse.redirect(new URL("/admin/dashboard", req.url))
	}

	if (isProtectedAdminRoute) {
		const res = await fetch(`${process.env.SPRINGBOOT_BACKEND_URL}/server/auth/verify-admin`, {
			headers: { Authorization: `Bearer ${token?.backendToken}` }
		})
		if (!res.ok) return NextResponse.redirect(new URL("/admin", req.url))
	}
}

export const config = {
	matcher: ["/admin", "/admin/:path*"],
};
