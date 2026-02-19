import "next-auth";

declare module "next-auth" {
	interface User {
		backendToken?: string;
	}
	interface Session {
		backendToken?: string;
		user: {
			id: string;
			email?: string | null;
			name?: string | null;
			image?: string | null;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		backendToken?: string;
		userId?: string;
	}
}
