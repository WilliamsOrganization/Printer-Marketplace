import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { email } from "zod";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if(!credentials?.email || !credentials?.password ){
					return null;
				}
				const res = await fetch('http://localhost:8080/api/auth/login',{
					method: "POST",
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify({
						email: credentials.email,
						password: credentials.password,
					})
				})
				if(!res.ok) return null;
				const data = res.json();

				return {
					id: data.user.id,
					email: data.user.email,
					name: data.user.name,
					accessToken: data.token,
					// authtoken 
				}

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
