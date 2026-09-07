# TODO
needs a rewrite to properly use tanstack query. this allows for the auth layer needs a cleaner abstraction over its queryables and protected routes.
global 401 403 handlers need to protect the routes rather than an external blocking duplicate token verification request. backend will verify tokens all on its own
right now it round trips twice which is inefficient loading times wise. 
backend handles verification. user permissions need to be better scope and verified. 
(permision elevation needs scoping again and requires better documentation before release)
tanstack query is already being used on the frontend for the cart invalidation states. 
[documentation link](https://tanstack.com/query/latest/docs)

## this is the function that needs abstractions from. 
rerequests way too many time for the backend and doesnt REALLY solve the actually risky part of the security layer problem. 
``` Typescript frontend/src/middleware.ts
async function middleware(req: NextRequest) {
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

	// TODO: this needs refactoring. which means rewriting the application to use tanstack query instead. they offer the ability to wrap 401 and 403 to handle default redirects. 
	if (isProtectedAdminRoute) {
		if (!(await isVerifiedAdmin(token?.backendToken as string))) {
			return NextResponse.redirect(new URL("/admin", req.url));
		}
	}
}
```


