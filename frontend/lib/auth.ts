import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				// TODO: Add your authentication logic here
				// Return user object or null
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		AppleProvider({
			clientId: process.env.APPLE_CLIENT_ID!,
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
		}),
	],
	session: {
		strategy: "jwt", // or "database"
	},
	callbacks: {
		async signIn({user, account, profile}) {
			if(account?.provider =="google" || account?.provider=="apple"){
				console.log('TODO: Create user')
				// successful
				return true;
			}
			// how to configure truthy and false login
			return false;
		},
		async jwt({ token, user }) {
			if (user) token.id = user.id;
			return token;
		},
		async session({ session, token }) {
			if (session.user) session.user.id = token.id;
			return session;
		},
	},
	pages: {
		signIn: "/login", // Custom sign-in page
	},
};
