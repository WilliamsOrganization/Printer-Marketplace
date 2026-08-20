import "next-auth";

declare module "next-auth" {
	interface User {
		backendToken?: string;
		phoneNumber?: string;
	}
	interface Session {
		backendToken?: string;
		user: {
			id: string;
			email?: string | null;
			name?: string | null;
			image?: string | null;
			phoneNumber?: string;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		backendToken?: string;
		userId?: string;
		phoneNumber?: string;
	}
}
