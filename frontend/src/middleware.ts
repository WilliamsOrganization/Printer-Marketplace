import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function isVerifiedAdmin(backendToken: string | undefined) {
	try {
		const res = await fetch(`${process.env.SPRINGBOOT_BACKEND_URL}/server/auth/verify-admin`, {
			headers: { Authorization: `Bearer ${backendToken}` }
		});
		return res.ok;
	} catch (err) {
		console.error("[middleware] verify-admin fetch failed", err);
		return false;
	}
}

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const isLoginPage = req.nextUrl.pathname === "/admin";
	// Covers every admin page behind the dashboard shell (dashboard, analytics,
	// lifecycle, projects, team, and anything added later) - not just /admin/dashboard.
	const isProtectedAdminRoute = !isLoginPage && req.nextUrl.pathname.startsWith("/admin/");

	if (isLoginPage && token) {
		if (await isVerifiedAdmin(token?.backendToken as string)) {
			return NextResponse.redirect(new URL("/admin/dashboard", req.url));
		}
	}

	if (isProtectedAdminRoute) {
		if (!(await isVerifiedAdmin(token?.backendToken as string))) {
			return NextResponse.redirect(new URL("/admin", req.url));
		}
	}
}

export const config = {
	matcher: ["/admin", "/admin/:path*"],
};
