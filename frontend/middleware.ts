import { withAuth } from "next-auth/middleware";

export default withAuth({
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/admin",
	},
});

export const config = {
	matcher: ["/admin/dashboard", "/admin/dashboard/:path*"]
}
